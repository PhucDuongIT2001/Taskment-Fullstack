# ============================================================
# rds.tf — Amazon RDS MySQL (Multi-AZ)
#
# AWS Well-Architected — Reliability Pillar:
#
# - Multi-AZ: AWS tự động tạo standby replica ở AZ-b
#   → Nếu AZ-a bị lỗi, failover sang AZ-b trong ~60-120 giây (tự động)
#   → RPO (Recovery Point Objective) ≈ 0 (synchronous replication)
#
# - Automated Backup: backup hàng ngày, lưu 7 ngày
#   → Point-in-time recovery: khôi phục DB về bất kỳ thời điểm nào trong 7 ngày
#
# - Encryption at Rest: dữ liệu được mã hóa trước khi ghi xuống disk
#
# - Deletion Protection: ngăn xóa nhầm DB production
# ============================================================

# Subnet group: cho phép RDS chạy trong private subnets của VPC
resource "aws_db_subnet_group" "main" {
  name       = "taskment-rds-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "taskment-rds-subnet-group-${var.environment}" }
}

# Parameter group: cấu hình MySQL
resource "aws_db_parameter_group" "main" {
  name   = "taskment-mysql8-params-${var.environment}"
  family = "mysql8.0"

  # UTF-8 đầy đủ (hỗ trợ emoji và ký tự đặc biệt)
  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  parameter {
    name  = "character_set_client"
    value = "utf8mb4"
  }

  # Slow query log — giúp phát hiện query chậm
  parameter {
    name  = "slow_query_log"
    value = "1"
  }
  parameter {
    name  = "long_query_time"
    value = "2"  # Log query chạy > 2 giây
  }

  tags = { Name = "taskment-mysql8-params-${var.environment}" }
}

# RDS MySQL PRIMARY Instance (⑩ trong draw.io)
resource "aws_db_instance" "main" {
  identifier = "taskment-db-${var.environment}"

  # Engine
  engine         = "mysql"
  engine_version = "8.0.36"
  instance_class = var.db_instance_class

  # Storage
  allocated_storage     = 20     # GB
  max_allocated_storage = 100    # Auto scaling storage đến 100GB
  storage_type          = "gp3"  # gp3 hiệu năng tốt hơn gp2 và rẻ hơn

  # Encryption at Rest bằng KMS Customer Managed Key
  # (hiển thị trong draw.io: VPC Flow Logs → CloudWatch → KMS)
  storage_encrypted = true
  kms_key_id        = aws_kms_key.main.arn

  # Database config
  db_name  = var.db_name
  username = var.db_username
  # Password được quản lý bởi Secrets Manager (không hardcode)
  manage_master_user_password = true

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false  # KHÔNG expose ra internet

  # High Availability — Multi-AZ: tự động tạo STANDBY ở AZ-b
  # (hiển thị trong draw.io: RDS MySQL STANDBY)
  multi_az = true

  # Automated Backup → S3 Snapshot (hiển thị trong draw.io)
  backup_retention_period   = 7              # Giữ backup 7 ngày
  backup_window             = "03:00-04:00"  # Thực hiện lúc 3am UTC
  maintenance_window        = "sun:05:00-sun:06:00"
  delete_automated_backups  = false          # Không xóa backup khi xóa instance

  # Performance
  parameter_group_name = aws_db_parameter_group.main.name

  # Monitoring — Enhanced Monitoring → CloudWatch (⑬⑭ trong draw.io)
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]

  # Protection
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "taskment-db-final-snapshot"

  apply_immediately = false

  tags = { Name = "taskment-db-primary-${var.environment}" }
}

# ============================================================
# RDS Read Replica AZ-b (hiển thị trong draw.io)
#
# Mục đích:
# - Phục vụ các truy vấn READ-ONLY (báo cáo, dashboard, export)
# - Giảm tải cho Primary — Primary chỉ xử lý ghi
# - Đặt tại AZ-b để tăng tính sẵn sàng
# - Async replication từ Primary (có thể có lag vài giây)
#
# Ví dụ query nên đi vào Replica:
#   - GET /api/projects/{id}/tasks (load dashboard)
#   - GET /api/reports/... (export báo cáo)
#   - SELECT COUNT(*) ... (thống kê)
# ============================================================
resource "aws_db_instance" "replica" {
  identifier = "taskment-db-replica-${var.environment}"

  # Read Replica từ Primary
  replicate_source_db = aws_db_instance.main.identifier

  # Engine (phải giống Primary)
  instance_class = var.db_instance_class
  storage_type   = "gp3"

  # Encryption kế thừa từ Primary + KMS key
  storage_encrypted = true
  kms_key_id        = aws_kms_key.main.arn

  # Network — đặt ở AZ-b (private subnet)
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  availability_zone      = var.availability_zones[1]  # AZ-b

  # Read Replica KHÔNG cần Multi-AZ (đã có Primary Multi-AZ)
  multi_az = false

  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports = ["error", "slowquery"]

  # Protection
  deletion_protection = true
  skip_final_snapshot = true  # Replica có thể tạo lại được

  apply_immediately = false

  tags = { Name = "taskment-db-replica-${var.environment}" }

  # Đảm bảo Primary tạo xong trước
  depends_on = [aws_db_instance.main]
}

# Output endpoints cho application config
output "rds_primary_endpoint" {
  description = "RDS PRIMARY endpoint — dùng cho ghi (Spring Boot DB_HOST)"
  value       = aws_db_instance.main.address
  sensitive   = true
}

output "rds_replica_endpoint" {
  description = "RDS Read Replica endpoint — dùng cho đọc (datasource read-only)"
  value       = aws_db_instance.replica.address
  sensitive   = true
}

# IAM Role cho RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "taskment-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
