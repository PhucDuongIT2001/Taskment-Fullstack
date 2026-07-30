# ============================================================
# cloudfront.tf — CloudFront CDN Distribution
#
# AWS Well-Architected — Performance Efficiency Pillar:
#
# - CDN Cache: static assets được cache ở 400+ edge locations toàn cầu
#   → Giảm latency cho người dùng Việt Nam và quốc tế
# - HTTPS bắt buộc: chứng chỉ SSL được quản lý bởi AWS
# - WAF tích hợp: chặn OWASP Top 10, DDoS attack
# - HTTP/2: tăng tốc độ tải trang
#
# Chi phí: CloudFront rất rẻ, phần lớn traffic trong Free Tier (1TB/tháng)
# ============================================================

# CloudFront Distribution cho Frontend
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Taskment Frontend CDN - ${var.environment}"

  # Alias (custom domain) — chỉ cấu hình nếu có domain
  aliases = var.domain_name != "" ? [var.domain_name] : []

  # Origin: S3 bucket (truy cập qua OAC, không phải public URL)
  origin {
    domain_name              = aws_s3_bucket.frontend_static.bucket_regional_domain_name
    origin_id                = "S3-taskment-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # Default cache behavior cho static assets
  default_cache_behavior {
    target_origin_id       = "S3-taskment-frontend"
    viewer_protocol_policy = "redirect-to-https"  # Bắt buộc HTTPS
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true   # Gzip/Brotli compression
    
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # CachingOptimized

    # Security Headers được thêm vào response
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  # Cache behavior cho index.html: KHÔNG cache (luôn fresh sau deploy)
  ordered_cache_behavior {
    path_pattern           = "/index.html"
    target_origin_id       = "S3-taskment-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  # CachingDisabled
  }

  # Fallback cho React Router: trả về index.html cho 404 (SPA routing)
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # Chứng chỉ SSL
  viewer_certificate {
    cloudfront_default_certificate = var.certificate_arn == "" ? true : false
    acm_certificate_arn            = var.certificate_arn != "" ? var.certificate_arn : null
    ssl_support_method             = var.certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.certificate_arn != "" ? "TLSv1.2_2021" : null
  }

  # WAF (Web Application Firewall) — chặn OWASP Top 10
  web_acl_id = aws_wafv2_web_acl.frontend.arn

  # Price Class: chỉ dùng edge locations ở Châu Á, Mỹ, Châu Âu (tiết kiệm chi phí)
  price_class = "PriceClass_200"

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  tags = { Name = "taskment-frontend-cdn-${var.environment}" }
}

# Security Response Headers Policy
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "taskment-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000   # 1 năm
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_type_options { override = true }
    frame_options {
      frame_option = "SAMEORIGIN"
      override     = true
    }
    xss_protection {
      mode_block  = true
      protection  = true
      override    = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }
}

# WAF Web ACL cho CloudFront (phải ở region us-east-1)
resource "aws_wafv2_web_acl" "frontend" {
  provider    = aws.us_east_1  # CloudFront WAF phải ở us-east-1
  name        = "taskment-frontend-waf"
  description = "WAF for Taskment Frontend CloudFront"
  scope       = "CLOUDFRONT"

  default_action { allow {} }

  # Managed Rule: AWS Core Rule Set (chặn OWASP Top 10)
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rate limiting: chặn IP request quá 2000 lần/5 phút
  rule {
    name     = "RateLimitRule"
    priority = 2
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "taskmentWAF"
    sampled_requests_enabled   = true
  }

  tags = { Name = "taskment-frontend-waf" }
}

# Provider thứ 2 ở us-east-1 (cần cho CloudFront WAF)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
