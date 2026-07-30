# ============================================================
# vpc.tf — Virtual Private Cloud
#
# AWS Well-Architected — Security & Reliability Pillars:
#
# SECURITY:
#   - Network isolation: backend và database KHÔNG expose ra internet
#   - Public subnet: chỉ chứa Load Balancer (điểm vào duy nhất)
#   - Private subnet: chứa ECS tasks và RDS (không có IP public)
#   - NAT Gateway: cho phép private subnet gọi ra internet (pull ECR image)
#     nhưng internet KHÔNG thể kết nối vào
#
# RELIABILITY:
#   - Multi-AZ: resource được phân tán qua 2 Availability Zone
#   - Nếu 1 AZ bị sự cố, AZ còn lại vẫn phục vụ
# ============================================================

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true  # Cần thiết để RDS có hostname
  enable_dns_support   = true

  tags = { Name = "taskment-vpc-${var.environment}" }
}

# --- Internet Gateway (cổng vào/ra internet cho Public Subnet) ---
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "taskment-igw-${var.environment}" }
}

# --- Public Subnets (ALB sẽ đặt ở đây, 2 AZ) ---
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true  # Instance trong public subnet được cấp IP public

  tags = { Name = "taskment-public-subnet-${count.index + 1}-${var.environment}" }
}

# --- Private Subnets (ECS tasks + RDS đặt ở đây, 2 AZ) ---
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  # KHÔNG map_public_ip — private subnet không có IP public

  tags = { Name = "taskment-private-subnet-${count.index + 1}-${var.environment}" }
}

# --- Elastic IP cho NAT Gateway ---
# LÝ DO CHỈ DÙNG 1 NAT: Tiết kiệm chi phí ($32/tháng/NAT)
# Trade-off: nếu AZ-a bị lỗi, private subnet ở AZ-b cũng mất internet
# Nếu muốn high availability tuyệt đối: tạo 1 NAT mỗi AZ
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "taskment-nat-eip-${var.environment}" }
}

# --- NAT Gateway (đặt ở public subnet để private subnet truy cập internet) ---
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id  # Đặt ở AZ-a

  tags = { Name = "taskment-nat-${var.environment}" }
  depends_on = [aws_internet_gateway.main]
}

# --- Route Table cho Public Subnets ---
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id  # Traffic ra internet qua IGW
  }

  tags = { Name = "taskment-public-rt-${var.environment}" }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# --- Route Table cho Private Subnets ---
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id  # Traffic ra internet qua NAT (không có public IP)
  }

  tags = { Name = "taskment-private-rt-${var.environment}" }
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ============================================================
# VPC Flow Logs (㉓ trong draw.io)
#
# VPC Flow Logs → CloudWatch → AWS KMS (đúng như draw.io)
#
# Ghi lại TOÀN BỘ lưu lượng mạng trong VPC:
# - Ai đang gọi vào ECS tasks (IP, port, protocol)
# - Kết nối bị từ chối bởi Security Group
# - Phát hiện xâm nhập và tấn công DDoS
# - Audit trail cho compliance
#
# AWS Well-Architected — Security Pillar:
# "Implement a strong identity foundation, enable traceability"
# ============================================================

# IAM Role cho VPC Flow Logs để ghi vào CloudWatch
resource "aws_iam_role" "vpc_flow_logs" {
  name = "taskment-vpc-flow-logs-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "vpc-flow-logs.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "taskment-vpc-flow-logs-role" }
}

resource "aws_iam_role_policy" "vpc_flow_logs" {
  name = "taskment-vpc-flow-logs-policy"
  role = aws_iam_role.vpc_flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ]
      Resource = "*"
    }]
  })
}

# CloudWatch Log Group cho VPC Flow Logs (encrypt bằng KMS)
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/taskment-flow-logs-${var.environment}"
  retention_in_days = 30           # Giữ 30 ngày (Cost Optimization)
  kms_key_id        = aws_kms_key.main.arn  # Encrypt logs bằng KMS (㉓ trong draw.io)

  tags = { Name = "taskment-vpc-flow-logs" }
}

# VPC Flow Logs — ghi toàn bộ traffic (ACCEPT + REJECT)
resource "aws_flow_log" "main" {
  vpc_id          = aws_vpc.main.id
  traffic_type    = "ALL"    # Ghi cả ACCEPT và REJECT (quan trọng cho security)
  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn

  # Format log chi tiết (v3 — có thêm traffic-path, pkt-srcaddr)
  log_format = "$${version} $${account-id} $${interface-id} $${srcaddr} $${dstaddr} $${srcport} $${dstport} $${protocol} $${packets} $${bytes} $${start} $${end} $${action} $${log-status} $${vpc-id} $${subnet-id} $${instance-id} $${tcp-flags} $${type} $${pkt-srcaddr} $${pkt-dstaddr}"

  tags = { Name = "taskment-vpc-flow-logs-${var.environment}" }

  # KMS key phải tạo trước
  depends_on = [aws_cloudwatch_log_group.vpc_flow_logs]
}
