# ============================================================
# kms.tf — AWS Key Management Service
#
# AWS Well-Architected — Security Pillar:
# "Protect data at rest using encryption"
#
# KMS trong Taskment dùng để:
# 1. Mã hóa RDS database at-rest (storage_encrypted = true)
# 2. Mã hóa Secrets Manager secrets
# 3. Mã hóa CloudWatch Logs
# 4. Mã hóa S3 attachments bucket
#
# LÝ DO DÙNG CUSTOMER MANAGED KEY thay vì AWS Managed Key:
# - Kiểm soát hoàn toàn key (có thể revoke, rotate, audit)
# - Bắt buộc để đạt chuẩn compliance (ISO, SOC2, PCI-DSS)
# - Mọi lần dùng key đều được log vào CloudTrail
# ============================================================

# KMS Key chính cho toàn hệ thống Taskment
resource "aws_kms_key" "main" {
  description             = "Taskment master encryption key — ${var.environment}"
  deletion_window_in_days = 30        # Chờ 30 ngày trước khi xóa (recovery window)
  enable_key_rotation     = true      # Tự động rotate key mỗi năm (best practice)
  multi_region            = false     # Single region — ap-southeast-1

  # Key policy: ai được phép dùng key này
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # 1. Root account có toàn quyền (quan trọng để không bị lock out)
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action   = "kms:*"
        Resource = "*"
      },
      # 2. ECS Task Role được phép decrypt (đọc secrets, mở file S3)
      {
        Sid    = "Allow ECS Task Role"
        Effect = "Allow"
        Principal = { AWS = aws_iam_role.ecs_task_role.arn }
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = "*"
      },
      # 3. RDS service được phép encrypt/decrypt storage
      {
        Sid    = "Allow RDS Service"
        Effect = "Allow"
        Principal = { Service = "rds.amazonaws.com" }
        Action   = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
        Resource = "*"
      },
      # 4. Secrets Manager được phép dùng key
      {
        Sid    = "Allow Secrets Manager"
        Effect = "Allow"
        Principal = { Service = "secretsmanager.amazonaws.com" }
        Action   = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
        Resource = "*"
      },
      # 5. CloudWatch Logs được phép encrypt logs
      {
        Sid    = "Allow CloudWatch Logs"
        Effect = "Allow"
        Principal = { Service = "logs.${var.aws_region}.amazonaws.com" }
        Action   = ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
        Resource = "*"
      }
    ]
  })

  tags = { Name = "taskment-kms-key-${var.environment}" }
}

# Alias dễ nhớ hơn ARN
resource "aws_kms_alias" "main" {
  name          = "alias/taskment-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}

# Data source để lấy account ID hiện tại
data "aws_caller_identity" "current" {}

# ============================================================
# Output ARN để các resource khác tham chiếu
# ============================================================
output "kms_key_arn" {
  description = "KMS key ARN — dùng để encrypt RDS, S3, Secrets Manager"
  value       = aws_kms_key.main.arn
}

output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}
