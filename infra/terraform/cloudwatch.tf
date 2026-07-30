# ============================================================
# cloudwatch.tf — Monitoring, Logging & Alerting
#
# AWS Well-Architected — Operational Excellence Pillar:
#
# "Understand your workloads and their expected behaviors"
# "Respond to events with runbooks or automation"
#
# Nội dung:
# - CloudWatch Log Groups: tập trung log từ ECS containers
# - CloudWatch Alarms: cảnh báo khi metrics vượt ngưỡng
# - SNS Topic: gửi alert qua email khi có vấn đề
# - CloudWatch Dashboard: màn hình tổng quan hệ thống
# ============================================================

# ============================================================
# SNS Topic — Nhận alert từ CloudWatch
# ============================================================
resource "aws_sns_topic" "alerts" {
  name = "taskment-alerts-${var.environment}"
  tags = { Name = "taskment-alerts" }
}

# Subscribe email để nhận alert (thay bằng email thật)
resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "your-email@example.com"  # Thay bằng email của bạn
}

# ============================================================
# CloudWatch Alarms
# ============================================================

# Alert khi CPU của ECS backend > 80%
resource "aws_cloudwatch_metric_alarm" "backend_cpu_high" {
  alarm_name          = "taskment-backend-cpu-high"
  alarm_description   = "Backend ECS CPU sử dụng > 80% trong 5 phút"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2      # Phải vi phạm 2 periods liên tiếp
  period              = 300    # 5 phút mỗi period
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/ECS"
  metric_name = "CPUUtilization"
  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.backend.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]  # Alert khi về bình thường

  tags = { Name = "taskment-backend-cpu-alarm" }
}

# Alert khi có lỗi 5xx từ ALB (ứng dụng bị lỗi)
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "taskment-alb-5xx-errors"
  alarm_description   = "ALB trả về lỗi 5xx nhiều hơn 10 lần trong 5 phút"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/ApplicationELB"
  metric_name = "HTTPCode_Target_5XX_Count"
  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "taskment-alb-5xx-alarm" }
}

# Alert khi RDS CPU > 80%
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "taskment-rds-cpu-high"
  alarm_description   = "RDS CPU sử dụng > 80%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  period              = 300
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/RDS"
  metric_name = "CPUUtilization"
  dimensions  = { DBInstanceIdentifier = aws_db_instance.main.id }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "taskment-rds-cpu-alarm" }
}

# Alert khi RDS Free Storage Space < 5GB
resource "aws_cloudwatch_metric_alarm" "rds_low_storage" {
  alarm_name          = "taskment-rds-low-storage"
  alarm_description   = "RDS còn dưới 5GB dung lượng"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  period              = 300
  statistic           = "Average"
  threshold           = 5368709120  # 5GB in bytes
  treat_missing_data  = "notBreaching"

  namespace   = "AWS/RDS"
  metric_name = "FreeStorageSpace"
  dimensions  = { DBInstanceIdentifier = aws_db_instance.main.id }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = { Name = "taskment-rds-storage-alarm" }
}

# ============================================================
# CloudWatch Dashboard — Tổng quan hệ thống
# ============================================================
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "Taskment-Overview-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0; y = 0; width = 12; height = 6
        properties = {
          title  = "ECS Backend CPU & Memory"
          view   = "timeSeries"
          period = 60
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.backend.name],
            ["AWS/ECS", "MemoryUtilization", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.backend.name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12; y = 0; width = 12; height = 6
        properties = {
          title  = "ALB Request Count & Errors"
          view   = "timeSeries"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", aws_lb.main.arn_suffix],
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0; y = 6; width = 12; height = 6
        properties = {
          title  = "RDS Performance"
          view   = "timeSeries"
          period = 60
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id],
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", aws_db_instance.main.id],
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", aws_db_instance.main.id]
          ]
        }
      }
    ]
  })
}
