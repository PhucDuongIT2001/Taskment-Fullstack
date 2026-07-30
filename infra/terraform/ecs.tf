# ============================================================
# ecs.tf — ECS Fargate Cluster, Task Definition, Service
#
# AWS Well-Architected — Reliability & Performance Pillars:
#
# - ECS Fargate: serverless container, không quản lý EC2
# - Desired count = 2: luôn có 2 tasks chạy (Multi-AZ)
# - Auto Scaling: tự động scale 2 → 10 tasks theo CPU
# - Rolling update: deploy không downtime (circuit breaker tự rollback)
# - Container Insights: CloudWatch metrics cho từng container
# ============================================================

# ECR Repositories (Docker Image Registry)
resource "aws_ecr_repository" "backend" {
  name                 = "taskment-backend"
  image_tag_mutability = "MUTABLE"

  # Scan image khi push — phát hiện lỗ hổng bảo mật
  image_scanning_configuration { scan_on_push = true }

  tags = { Name = "taskment-backend-ecr" }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "taskment-frontend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "taskment-frontend-ecr" }
}

# Lifecycle policy: giữ tối đa 10 images, xóa image cũ hơn
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "taskment-cluster-${var.environment}"

  # Container Insights: metrics chi tiết cho từng container
  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Name = "taskment-cluster-${var.environment}" }
}

# CloudWatch Log Group cho ECS tasks
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/taskment-backend"
  retention_in_days = 30  # Xóa log cũ hơn 30 ngày (Cost Optimization)
  tags              = { Name = "taskment-backend-logs" }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "taskment-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu     # 512 = 0.5 vCPU
  memory                   = var.backend_memory  # 1024 MB

  # Role hệ thống: pull ECR image, write CloudWatch logs
  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  # Role ứng dụng: S3, SES access
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name  = "taskment-backend"
    image = var.backend_image_uri  # Được cập nhật bởi CI/CD pipeline

    # Port mapping
    portMappings = [{
      containerPort = 8080
      hostPort      = 8080
      protocol      = "tcp"
    }]

    # Environment variables (non-sensitive)
    environment = [
      { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
      { name = "AWS_REGION",             value = var.aws_region },
      { name = "S3_BUCKET_NAME",         value = aws_s3_bucket.attachments.bucket },
      { name = "FRONTEND_URL",           value = "https://${var.domain_name}" },
      { name = "ALLOWED_ORIGINS",        value = "https://${var.domain_name}" }
    ]

    # Secrets từ AWS Secrets Manager (inject tự động, không lộ trong task definition)
    secrets = [
      { name = "DB_HOST",      valueFrom = "${var.db_password_secret_arn}:host::" },
      { name = "DB_NAME",      valueFrom = "${var.db_password_secret_arn}:dbname::" },
      { name = "DB_USERNAME",  valueFrom = "${var.db_password_secret_arn}:username::" },
      { name = "DB_PASSWORD",  valueFrom = "${var.db_password_secret_arn}:password::" },
      { name = "JWT_SECRET",   valueFrom = "${var.app_secrets_arn}:jwt_secret::" },
      { name = "SMTP_USERNAME", valueFrom = "${var.app_secrets_arn}:smtp_username::" },
      { name = "SMTP_PASSWORD", valueFrom = "${var.app_secrets_arn}:smtp_password::" },
      { name = "GEMINI_API_KEY", valueFrom = "${var.app_secrets_arn}:gemini_api_key::" }
    ]

    # CloudWatch logging
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    # Health check trong container
    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60  # Cho Spring Boot 60 giây để khởi động
    }

    # Resource limits (bắt buộc phải có để container không hog resources)
    essential = true
  }])

  tags = { Name = "taskment-backend-td-${var.environment}" }
}

# ECS Service
resource "aws_ecs_service" "backend" {
  name            = "taskment-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count  # 2 tasks (Multi-AZ)
  launch_type     = "FARGATE"

  # Rolling update configuration (zero-downtime deployment)
  deployment_circuit_breaker {
    enable   = true   # Tự động rollback nếu deploy thất bại
    rollback = true
  }

  deployment_maximum_percent         = 200  # Cho phép tạo task mới trước khi xóa cũ
  deployment_minimum_healthy_percent = 100  # Không bao giờ xuống dưới 100% capacity

  # Network configuration: đặt tasks ở private subnets
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false  # Không cấp public IP (private subnet)
  }

  # Đăng ký tasks với ALB Target Group
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "taskment-backend"
    container_port   = 8080
  }

  tags = { Name = "taskment-backend-service" }

  lifecycle {
    # Không để Terraform override image khi CI/CD pipeline cập nhật
    ignore_changes = [task_definition]
  }
}

# ============================================================
# Auto Scaling (Performance Efficiency & Cost Optimization)
# ============================================================

resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Scale up khi CPU > 70%
resource "aws_appautoscaling_policy" "backend_cpu_scale_up" {
  name               = "taskment-backend-cpu-scale-up"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0   # Scale khi CPU trung bình > 70%
    scale_in_cooldown  = 300    # Chờ 5 phút trước khi scale in
    scale_out_cooldown = 60     # Scale out ngay sau 60 giây
  }
}

# ============================================================
# FRONTEND ECS FARGATE (⑤ trong draw.io)
#
# Draw.io: "Frontend ECS Fargate AZ-a" — container riêng biệt
# chạy Nginx để phục vụ React build files.
#
# Kiến trúc:
#   User → ALB → Frontend ECS (Nginx :80) → Proxy /api/* → Backend ECS
#
# Lý do tách Frontend thành ECS riêng (thay vì để trên S3):
# - Hỗ trợ WebSocket proxy (/ws/*)
# - Custom Nginx config (security headers, gzip, cache)
# - Không phụ thuộc CloudFront để serve /index.html
# ============================================================

# CloudWatch Log Group cho Frontend container
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/taskment-frontend"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.main.arn  # Encrypt logs bằng KMS
  tags              = { Name = "taskment-frontend-logs" }
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "taskment-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256   # 0.25 vCPU — Nginx nhẹ hơn Spring Boot
  memory                   = 512   # 512 MB

  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  # Frontend không cần Task Role (không access S3/SES trực tiếp)

  container_definitions = jsonencode([{
    name  = "taskment-frontend"
    image = var.frontend_image_uri  # Được cập nhật bởi CI/CD pipeline

    portMappings = [{
      containerPort = 80
      hostPort      = 80
      protocol      = "tcp"
    }]

    environment = [
      # URL của Backend API (Nginx proxy_pass đến đây)
      { name = "BACKEND_URL", value = "http://taskment-backend-service:8080" }
    ]

    # CloudWatch logging
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    # Health check: Nginx trả về 200 trên /
    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:80/ || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }

    essential = true
  }])

  tags = { Name = "taskment-frontend-td-${var.environment}" }
}

# ALB Target Group cho Frontend
resource "aws_lb_target_group" "frontend" {
  name        = "taskment-frontend-tg-${var.environment}"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }

  tags = { Name = "taskment-frontend-tg-${var.environment}" }
}

# ALB Listener Rule: traffic không phải /api/* → Frontend
resource "aws_lb_listener_rule" "frontend" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  condition {
    path_pattern {
      values = ["/*"]  # Mọi path không match rule backend → Frontend
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ALB Listener Rule: /api/* và /actuator/* → Backend
resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10  # Ưu tiên cao hơn rule frontend

  condition {
    path_pattern {
      values = ["/api/*", "/actuator/*", "/ws/*", "/oauth2/*"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Frontend ECS Service (⑤ trong draw.io — Private Subnet AZ-a)
resource "aws_ecs_service" "frontend" {
  name            = "taskment-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1  # 1 task frontend (nhẹ hơn backend)
  launch_type     = "FARGATE"

  # Rolling update
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  # Đặt trong private subnet (cùng với Backend AZ-a trong draw.io)
  network_configuration {
    subnets          = [aws_subnet.private[0].id]  # Chỉ AZ-a như trong draw.io
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "taskment-frontend"
    container_port   = 80
  }

  tags = { Name = "taskment-frontend-service" }

  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_lb_listener_rule.frontend]
}
