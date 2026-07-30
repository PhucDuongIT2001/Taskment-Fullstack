# ============================================================
# secrets.tf — AWS Secrets Manager
#
# AWS Well-Architected — Security Pillar:
# "Protect secrets throughout their lifecycle"
#
# Lý do dùng Secrets Manager thay biến môi trường thường:
# 1. Secrets được mã hóa at-rest bằng AWS KMS
# 2. Tự động rotation (có thể cấu hình rotate DB password định kỳ)
# 3. Audit trail: mọi lần đọc secret đều được log vào CloudTrail
# 4. Fine-grained access control qua IAM
# 5. Không bao giờ lộ trong ECS task definition logs
# ============================================================

# ============================================================
# Secret 1: Database Credentials
# ============================================================
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "taskment/${var.environment}/db-credentials"
  description = "Taskment RDS MySQL credentials — ${var.environment}"

  # Tự động xóa secret sau 7 ngày recovery window (thay vì xóa ngay)
  recovery_window_in_days = 7

  tags = { Name = "taskment-db-credentials-${var.environment}" }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id

  # Cấu trúc JSON — ECS có thể dùng jsonKey để lấy từng field riêng
  # Ví dụ: valueFrom = "arn:...:secret:taskment/prod/db-credentials:password::"
  secret_string = jsonencode({
    host     = aws_db_instance.main.address
    port     = tostring(aws_db_instance.main.port)
    dbname   = var.db_name
    username = var.db_username
    # Password được RDS tự quản lý khi dùng manage_master_user_password = true
    # Không set password ở đây — AWS tự tạo và rotate
  })

  # Đảm bảo RDS tạo xong trước khi lưu endpoint
  depends_on = [aws_db_instance.main]
}

# ============================================================
# Secret 2: Application Secrets (JWT, SMTP, AI keys...)
# ============================================================
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "taskment/${var.environment}/app-secrets"
  description = "Taskment application secrets — ${var.environment}"

  recovery_window_in_days = 7

  tags = { Name = "taskment-app-secrets-${var.environment}" }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  # QUAN TRỌNG: Sau khi chạy terraform apply, vào AWS Console
  # → Secrets Manager → taskment/prod/app-secrets → Retrieve secret value
  # → Điền giá trị thật cho từng field
  secret_string = jsonencode({
    jwt_secret       = "REPLACE_WITH_STRONG_RANDOM_SECRET_MIN_64_CHARS"
    smtp_username    = "REPLACE_WITH_SES_SMTP_USERNAME"
    smtp_password    = "REPLACE_WITH_SES_SMTP_PASSWORD"
    gemini_api_key   = "REPLACE_WITH_GEMINI_API_KEY"
    google_client_id = "REPLACE_WITH_GOOGLE_CLIENT_ID"
    google_secret    = "REPLACE_WITH_GOOGLE_CLIENT_SECRET"
  })
}

# ============================================================
# Secret Rotation Policy cho DB credentials
# (Tùy chọn — nâng cao, rotate password định kỳ)
# ============================================================
# resource "aws_secretsmanager_secret_rotation" "db_rotation" {
#   secret_id           = aws_secretsmanager_secret.db_credentials.id
#   rotation_lambda_arn = "arn:aws:lambda:..."  # Lambda function xử lý rotation
#   rotation_rules {
#     automatically_after_days = 30
#   }
# }

# ============================================================
# Output ARNs để dùng trong ECS task definition
# ============================================================
output "db_credentials_secret_arn" {
  description = "ARN of DB credentials secret (dùng trong ECS task definition)"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "app_secrets_arn" {
  description = "ARN of app secrets (dùng trong ECS task definition)"
  value       = aws_secretsmanager_secret.app_secrets.arn
}
