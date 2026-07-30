# ============================================================
# outputs.tf — Terraform Outputs
# Hiển thị các thông tin quan trọng sau khi terraform apply
# ============================================================

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "DNS name của Application Load Balancer (để cấu hình DNS record)"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront domain name (dùng cho frontend access)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "rds_endpoint" {
  description = "RDS endpoint (điền vào DB_HOST)"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "s3_frontend_bucket" {
  description = "Tên S3 bucket cho frontend static files"
  value       = aws_s3_bucket.frontend_static.bucket
}

output "s3_attachments_bucket" {
  description = "Tên S3 bucket cho file đính kèm"
  value       = aws_s3_bucket.attachments.bucket
}

output "ecr_backend_url" {
  description = "ECR URL cho backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR URL cho frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "github_actions_role_arn" {
  description = "IAM Role ARN cho GitHub Actions OIDC (điền vào workflow)"
  value       = aws_iam_role.github_actions.arn
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = aws_ecs_cluster.main.name
}

output "sns_alerts_arn" {
  description = "SNS Topic ARN cho alerts"
  value       = aws_sns_topic.alerts.arn
}
