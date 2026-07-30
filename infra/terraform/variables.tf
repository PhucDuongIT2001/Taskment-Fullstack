# ============================================================
# variables.tf — Định nghĩa tất cả biến đầu vào
# Giá trị thật được set trong terraform.tfvars (không commit)
# ============================================================

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "owner_tag" {
  description = "Tag for resource ownership (used in billing)"
  type        = string
  default     = "taskment-team"
}

# --- VPC ---
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

# --- RDS ---
variable "db_name" {
  description = "Name of the MySQL database"
  type        = string
  default     = "taskment"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "taskment_admin"
}

variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.micro"
}

# --- ECS ---
variable "backend_image_uri" {
  description = "ECR image URI for backend container"
  type        = string
}

variable "frontend_image_uri" {
  description = "ECR image URI for frontend container"
  type        = string
}

variable "backend_cpu" {
  description = "CPU units for backend ECS task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory (MB) for backend ECS task"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend ECS tasks"
  type        = number
  default     = 2
}

# --- Domain (optional) ---
variable "domain_name" {
  description = "Custom domain name (e.g. taskment.yourdomain.com). Leave empty to skip CloudFront HTTPS setup."
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (must be in us-east-1 for CloudFront)"
  type        = string
  default     = ""
}

# --- Secrets Manager ---
variable "db_password_secret_arn" {
  description = "ARN of Secrets Manager secret containing DB password"
  type        = string
  sensitive   = true
}

variable "app_secrets_arn" {
  description = "ARN of Secrets Manager secret containing app secrets (JWT, SMTP, etc.)"
  type        = string
  sensitive   = true
}

# --- Frontend ECS Image ---
variable "frontend_image_uri" {
  description = "Docker image URI cho Frontend ECS Fargate (⑤ trong draw.io). Ví dụ: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/taskment-frontend:latest"
  type        = string
  default     = "nginx:alpine"  # Fallback nếu chưa build image
}
