# ============================================================
# security_groups.tf — Security Groups (Tường lửa cho từng tầng)
#
# AWS Well-Architected — Security Pillar (Least Privilege Network):
#
# Nguyên tắc: Chỉ mở port cần thiết, từ nguồn cụ thể.
#
# Luồng traffic hợp lệ:
#   Internet → ALB (port 443/80) → ECS Tasks (port 8080) → RDS (port 3306)
#
# Luồng bị chặn:
#   Internet → ECS Tasks (KHÔNG có kết nối trực tiếp)
#   Internet → RDS (KHÔNG có kết nối trực tiếp)
#   ECS Tasks → RDS port 3306 từ bất kỳ nơi nào khác
# ============================================================

# --- Security Group cho Application Load Balancer ---
resource "aws_security_group" "alb" {
  name        = "taskment-alb-sg-${var.environment}"
  description = "Allow HTTPS/HTTP from internet to ALB"
  vpc_id      = aws_vpc.main.id

  # Inbound: HTTPS từ internet (CloudFront hoặc users trực tiếp)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }

  # Inbound: HTTP (để redirect sang HTTPS)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP for redirect to HTTPS"
  }

  # Outbound: cho phép ALB forward request đến ECS tasks
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound (to ECS tasks)"
  }

  tags = { Name = "taskment-alb-sg-${var.environment}" }
}

# --- Security Group cho ECS Tasks (Backend Spring Boot) ---
resource "aws_security_group" "ecs_tasks" {
  name        = "taskment-ecs-sg-${var.environment}"
  description = "Allow inbound traffic only from ALB to ECS tasks"
  vpc_id      = aws_vpc.main.id

  # Inbound: CHỈ cho phép từ ALB Security Group (không mở cho internet)
  # LÝ DO: Đây là nguyên tắc least-privilege trong network security
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Spring Boot port - only from ALB"
  }

  # Outbound: cho phép gọi ra internet (S3, SES, Secrets Manager, RDS...)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = { Name = "taskment-ecs-sg-${var.environment}" }
}

# --- Security Group cho RDS MySQL ---
resource "aws_security_group" "rds" {
  name        = "taskment-rds-sg-${var.environment}"
  description = "Allow MySQL access only from ECS tasks"
  vpc_id      = aws_vpc.main.id

  # Inbound: CHỈ cho phép từ ECS Tasks Security Group
  # LÝ DO: Database KHÔNG bao giờ được expose ra internet
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
    description     = "MySQL - only from ECS tasks"
  }

  # Outbound: cho phép RDS gửi log, backup...
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = { Name = "taskment-rds-sg-${var.environment}" }
}

# --- Security Group cho ElastiCache Redis ---
resource "aws_security_group" "redis" {
  name        = "taskment-redis-sg-${var.environment}"
  description = "Allow Redis access only from ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
    description     = "Redis - only from ECS tasks"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "taskment-redis-sg-${var.environment}" }
}
