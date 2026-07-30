# ============================================================
# alb.tf — Application Load Balancer
#
# AWS Well-Architected — Reliability & Performance Pillars:
#
# - ALB phân phối traffic đến nhiều ECS tasks (Multi-AZ)
# - Health check liên tục: task nào unhealthy → ALB tự loại ra
# - HTTPS termination tại ALB: backend không cần xử lý SSL
# - HTTP → HTTPS redirect tự động
# ============================================================

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "taskment-alb-${var.environment}"
  internal           = false   # Public-facing (internet-accessible)
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id  # Đặt ở 2 public subnets (Multi-AZ)

  # Access logs giúp debug và audit
  access_logs {
    bucket  = aws_s3_bucket.frontend_static.id
    prefix  = "alb-logs"
    enabled = true
  }

  tags = { Name = "taskment-alb-${var.environment}" }
}

# Target Group: các ECS tasks backend sẽ được đăng ký vào đây
resource "aws_lb_target_group" "backend" {
  name        = "taskment-backend-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"   # ECS Fargate dùng IP mode
  vpc_id      = aws_vpc.main.id

  # Health Check: ALB kiểm tra endpoint này định kỳ
  # LÝ DO DÙNG /actuator/health: Spring Boot Actuator trả về status DB, memory...
  health_check {
    enabled             = true
    path                = "/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2    # 2 lần check thành công → healthy
    unhealthy_threshold = 3    # 3 lần check thất bại → unhealthy
    timeout             = 5    # seconds
    interval            = 30   # Check mỗi 30 giây
    matcher             = "200" # HTTP 200 = healthy
  }

  tags = { Name = "taskment-backend-tg-${var.environment}" }
}

# Listener: HTTPS port 443
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"  # TLS 1.3 ưu tiên
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Listener: HTTP port 80 → redirect sang HTTPS (không cho phép HTTP không mã hóa)
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"  # Permanent redirect
    }
  }
}
