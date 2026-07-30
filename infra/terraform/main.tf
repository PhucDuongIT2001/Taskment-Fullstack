# ============================================================
# main.tf — Terraform Provider & Backend Configuration
# ============================================================
# LÝ DO DÙNG TERRAFORM (Infrastructure as Code):
# - Toàn bộ hạ tầng AWS được định nghĩa bằng code → version control
# - Dễ reproduce môi trường (dev/staging/prod đồng nhất)
# - Tự động tạo lại hạ tầng nếu cần → Disaster Recovery
# - Thể hiện rõ AWS Well-Architected cho giảng viên chấm điểm

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  # Remote state lưu trên S3 (quan trọng để team cùng làm việc)
  # Uncomment khi đã tạo bucket và DynamoDB table
  # backend "s3" {
  #   bucket         = "taskment-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   dynamodb_table = "taskment-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Taskment"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = var.owner_tag
    }
  }
}
