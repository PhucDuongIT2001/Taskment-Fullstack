# ============================================================
# elasticache.tf — Amazon ElastiCache Redis
#
# AWS Well-Architected — Performance Efficiency Pillar:
#
# Mục đích dùng Redis trong Taskment:
# 1. Session Cache: lưu thông tin user đã xác thực (tránh hit DB mỗi request)
# 2. Rate Limiting Cache: đếm số lần request từ mỗi IP
# 3. Notification Queue: buffer notifications realtime trước khi push WebSocket
# 4. Gemini AI response cache: cache kết quả AI để không gọi API lặp lại
#
# Kiến trúc:
# - 1 primary node + 1 replica (Multi-AZ)
# - Trong private subnet (không expose ra internet)
# - Encryption in-transit (TLS) + at-rest
# ============================================================

# Subnet group: ElastiCache chạy trong private subnets
resource "aws_elasticache_subnet_group" "main" {
  name       = "taskment-redis-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "taskment-redis-subnet-group" }
}

# Parameter group: cấu hình Redis
resource "aws_elasticache_parameter_group" "redis" {
  name   = "taskment-redis7-params-${var.environment}"
  family = "redis7"

  # Bật keyspace notifications (cho pub/sub realtime)
  parameter {
    name  = "notify-keyspace-events"
    value = "Ex"  # E=keyevent, x=expired events
  }

  tags = { Name = "taskment-redis-params" }
}

# ElastiCache Replication Group (Redis với Multi-AZ)
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "taskment-redis-${var.environment}"
  description          = "Taskment Redis cache — ${var.environment}"

  # Engine
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.t3.micro"  # Phù hợp workload nhỏ
  port                 = 6379

  # Cluster config
  num_cache_clusters = 2      # 1 primary + 1 replica (Multi-AZ)
  multi_az_enabled   = true
  automatic_failover_enabled = true  # Tự động failover khi primary fail

  # Network
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  # Security
  at_rest_encryption_enabled = true   # Mã hóa data at-rest
  transit_encryption_enabled = true   # Mã hóa data in-transit (TLS)

  # Performance
  parameter_group_name = aws_elasticache_parameter_group.redis.name

  # Maintenance
  maintenance_window       = "sun:05:00-sun:06:00"
  snapshot_retention_limit = 3          # Giữ snapshot 3 ngày
  snapshot_window          = "03:00-04:00"

  # Không xóa khi terraform destroy (bảo vệ data)
  # final_snapshot_identifier = "taskment-redis-final-snapshot"

  tags = { Name = "taskment-redis-${var.environment}" }
}

# Output endpoint để Spring Boot kết nối
output "redis_primary_endpoint" {
  description = "Redis primary endpoint (điền vào SPRING_REDIS_HOST)"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_reader_endpoint" {
  description = "Redis reader endpoint (dùng cho read-only operations)"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
  sensitive   = true
}
