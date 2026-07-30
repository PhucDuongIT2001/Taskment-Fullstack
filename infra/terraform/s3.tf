# ============================================================
# s3.tf — Amazon S3 Buckets
#
# Bucket 1: taskment-frontend-static-{env}
#   → Chứa React build output (HTML, CSS, JS, images)
#   → Phục vụ qua CloudFront (không public trực tiếp)
#
# Bucket 2: taskment-attachments-{env}
#   → Chứa file đính kèm của tasks
#   → Truy cập qua Presigned URL (không public)
#   → Lifecycle: chuyển sang S3-IA sau 30 ngày, Glacier sau 90 ngày
#
# AWS Well-Architected Pillars áp dụng:
# - Security: block public access, server-side encryption
# - Cost Optimization: lifecycle policy giảm chi phí lưu trữ dài hạn
# - Reliability: S3 có 99.999999999% durability
# ============================================================

# ============================================================
# Bucket 1: Frontend Static Files
# ============================================================
resource "aws_s3_bucket" "frontend_static" {
  bucket = "taskment-frontend-static-${var.environment}"
  tags   = { Name = "taskment-frontend-static-${var.environment}", Purpose = "Frontend static hosting" }
}

# Chặn tất cả public access (CloudFront sẽ truy cập qua OAC, không phải public)
resource "aws_s3_bucket_public_access_block" "frontend_static" {
  bucket                  = aws_s3_bucket.frontend_static.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Mã hóa at-rest bằng SSE-S3
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend_static" {
  bucket = aws_s3_bucket.frontend_static.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Versioning cho phép rollback frontend (Cost Optimization: xóa version cũ sau 30 ngày)
resource "aws_s3_bucket_versioning" "frontend_static" {
  bucket = aws_s3_bucket.frontend_static.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "frontend_static" {
  bucket = aws_s3_bucket.frontend_static.id
  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    noncurrent_version_expiration { noncurrent_days = 30 }
  }
}

# CloudFront Origin Access Control (OAC) — chỉ CloudFront được đọc bucket
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "taskment-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket policy: chỉ cho phép CloudFront đọc
resource "aws_s3_bucket_policy" "frontend_static" {
  bucket = aws_s3_bucket.frontend_static.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend_static.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
        }
      }
    }]
  })
}

# ============================================================
# Bucket 2: File Attachments
# ============================================================
resource "aws_s3_bucket" "attachments" {
  bucket = "taskment-attachments-${var.environment}"
  tags   = { Name = "taskment-attachments-${var.environment}", Purpose = "Task file attachments" }
}

# Chặn hoàn toàn public access (file truy cập qua Presigned URL từ backend)
resource "aws_s3_bucket_public_access_block" "attachments" {
  bucket                  = aws_s3_bucket.attachments.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Mã hóa at-rest
resource "aws_s3_bucket_server_side_encryption_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS — cho phép frontend request presigned URL và upload
resource "aws_s3_bucket_cors_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    # Điều chỉnh theo domain production của bạn
    allowed_origins = ["https://*.yourdomain.com", "http://localhost:3000"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# === COST OPTIMIZATION: Lifecycle Policy ===
# File đính kèm ít được truy cập sau thời gian dài
# → Chuyển sang storage class rẻ hơn để tiết kiệm chi phí
resource "aws_s3_bucket_lifecycle_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  rule {
    id     = "transition-old-attachments"
    status = "Enabled"

    # Sau 30 ngày: chuyển sang S3 Standard-IA (Infrequent Access)
    # Tiết kiệm: $0.023/GB → $0.0125/GB (~46% rẻ hơn)
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Sau 90 ngày: chuyển sang S3 Glacier Instant Retrieval
    # Tiết kiệm: ~$0.004/GB (~83% rẻ hơn Standard)
    # Vẫn đọc được ngay lập tức (Instant Retrieval)
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
  }
}
