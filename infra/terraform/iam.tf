# ============================================================
# iam.tf — IAM Roles & Policies (Least Privilege)
#
# AWS Well-Architected — Security Pillar:
# "Grant only the permissions required to perform a task"
#
# Các roles được tạo:
# 1. ECS Task Execution Role: quyền hệ thống (pull ECR, write CloudWatch logs)
# 2. ECS Task Role: quyền ứng dụng (S3 upload/download trên bucket riêng)
# 3. GitHub Actions Role: quyền CI/CD (push ECR, update ECS service)
#    → Dùng OIDC (không cần long-lived access keys)
# ============================================================

# ============================================================
# 1. ECS Task Execution Role
#    (AWS cần role này để khởi động container ECS)
# ============================================================
resource "aws_iam_role" "ecs_execution_role" {
  name = "taskment-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = { Name = "taskment-ecs-execution-role-${var.environment}" }
}

# Quyền chuẩn của ECS Execution Role (pull ECR, write CloudWatch)
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Cho phép ECS Execution Role đọc Secrets Manager (inject secrets vào container)
resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name = "taskment-ecs-execution-secrets-policy"
  role = aws_iam_role.ecs_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        # CHỈ được đọc secrets của project Taskment (không phải toàn bộ account)
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:taskment/*"
        ]
      }
    ]
  })
}

# ============================================================
# 2. ECS Task Role
#    (Quyền mà ứng dụng Spring Boot dùng lúc runtime)
# ============================================================
resource "aws_iam_role" "ecs_task_role" {
  name = "taskment-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = { Name = "taskment-ecs-task-role-${var.environment}" }
}

# Quyền S3 cho backend: CHỈ trên bucket attachments của dự án
resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "taskment-ecs-task-s3-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",           # Upload file
          "s3:GetObject",           # Download file (presigned URL)
          "s3:DeleteObject",        # Xóa file
          "s3:GetObjectAttributes"  # Kiểm tra metadata
        ]
        # Least privilege: CHỈ trên prefix attachments/ của bucket riêng
        Resource = [
          "${aws_s3_bucket.attachments.arn}/attachments/*"
        ]
      }
    ]
  })
}

# Quyền SES: gửi email thông báo
resource "aws_iam_role_policy" "ecs_task_ses" {
  name = "taskment-ecs-task-ses-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ses:FromAddress" = "noreply@taskment.yourdomain.com"
          }
        }
      }
    ]
  })
}

# ============================================================
# 3. GitHub Actions OIDC Role (CI/CD — không dùng long-lived keys)
#
# LÝ DO DÙNG OIDC:
# - Không cần lưu AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY trong GitHub Secrets
# - Token được cấp tạm thời (expire sau mỗi job), không thể bị leak lâu dài
# - Best practice của AWS cho CI/CD
# ============================================================

# OIDC Provider cho GitHub Actions
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # Thumbprint của GitHub OIDC
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Role cho GitHub Actions
resource "aws_iam_role" "github_actions" {
  name = "taskment-github-actions-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          # CHỈ cho phép từ repository của bạn (thay your-github-username/your-repo)
          "token.actions.githubusercontent.com:sub" = "repo:your-github-username/your-repo:*"
        }
      }
    }]
  })
}

# Quyền của GitHub Actions: push ECR + update ECS service
resource "aws_iam_role_policy" "github_actions_policy" {
  name = "taskment-github-actions-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = [
          aws_iam_role.ecs_execution_role.arn,
          aws_iam_role.ecs_task_role.arn
        ]
      },
      # S3 sync cho frontend static files
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [
          aws_s3_bucket.frontend_static.arn,
          "${aws_s3_bucket.frontend_static.arn}/*"
        ]
      },
      # CloudFront invalidation sau khi deploy frontend
      {
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = "*"
      }
    ]
  })
}
