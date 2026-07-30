# 🗂️ Taskment — Hệ Thống Quản Lý Công Việc (Task Management System)

[![Backend CI/CD](https://github.com/your-username/taskment/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/taskment/actions)
[![Frontend CI/CD](https://github.com/your-username/taskment/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/your-username/taskment/actions)
[![AWS Well-Architected](https://img.shields.io/badge/AWS-Well--Architected-FF9900?logo=amazon-aws)](https://aws.amazon.com/architecture/well-architected/)

## 📋 Mô Tả Bài Toán

**Taskment** là hệ thống quản lý công việc (Task Management) được xây dựng theo mô hình doanh nghiệp, hỗ trợ:

- 📊 **Quản lý dự án & sprint** theo phương pháp Agile/Scrum
- 👥 **Phân quyền RBAC**: Admin, Staff Leader, Staff, Customer với quyền khác nhau
- 🤖 **Tích hợp AI** (Google Gemini) để phân tích và gợi ý công việc
- 💬 **Chat realtime** qua WebSocket (STOMP protocol)
- 📎 **Upload file đính kèm** lưu trữ trên Amazon S3
- 📧 **Gửi email thông báo** qua Amazon SES
- 🔐 **Xác thực 2FA** (OTP qua email) + OAuth2 Google Login
- 📊 **Báo cáo & export** Excel

---

## 🏗️ Kiến Trúc AWS (Well-Architected Framework)

Hệ thống được thiết kế theo **AWS Well-Architected Framework** với 5 trụ cột:

### Sơ Đồ Kiến Trúc

```
                          ┌─────────────────────────────────────────────────────────────┐
    🌐 Internet            │                    AWS Cloud (ap-southeast-1)                │
                          │                                                              │
  Users ─────────────────►│  ┌─────────────────────────────────────────┐                │
                          │  │  AWS CloudFront (CDN + WAF)              │                │
                          │  │  • HTTPS termination                     │                │
                          │  │  • Cache static assets globally          │                │
                          │  │  • WAF: OWASP Top 10 protection          │                │
                          │  └──────────────┬──────────────────────────┘                │
                          │                 │                                            │
                          │       ┌─────────▼──────────────────────┐                   │
                          │       │  S3 Frontend Bucket             │                   │
                          │       │  (React static files)           │                   │
                          │       └─────────────────────────────────┘                   │
                          │                 │ API requests                               │
                          │  ┌──────────────▼──────────────────────────────────────┐   │
                          │  │              VPC: 10.0.0.0/16                        │   │
                          │  │                                                      │   │
                          │  │  ┌── Public Subnets (AZ-a & AZ-b) ──────────────┐   │   │
                          │  │  │                                               │   │   │
                          │  │  │  ┌─────────────────────────────────────────┐ │   │   │
                          │  │  │  │  Application Load Balancer (HTTPS:443)  │ │   │   │
                          │  │  │  │  • Health checks, Multi-AZ              │ │   │   │
                          │  │  │  └──────────────────┬──────────────────────┘ │   │   │
                          │  │  │                     │                         │   │   │
                          │  │  │    NAT Gateway ◄────┘                         │   │   │
                          │  │  └──────────────────────────────────────────────┘│   │   │
                          │  │                        │                           │   │   │
                          │  │  ┌── Private Subnets (AZ-a & AZ-b) ─────────────┐ │   │   │
                          │  │  │                                               │ │   │   │
                          │  │  │  ┌─────────────────┐  ┌─────────────────┐   │ │   │   │
                          │  │  │  │  ECS Task AZ-a   │  │  ECS Task AZ-b  │   │ │   │   │
                          │  │  │  │  Spring Boot     │  │  Spring Boot    │   │ │   │   │
                          │  │  │  │  :8080           │  │  :8080          │   │ │   │   │
                          │  │  │  └────────┬────────┘  └────────┬────────┘   │ │   │   │
                          │  │  │           │                     │             │ │   │   │
                          │  │  │  ┌────────▼─────────────────────▼──────────┐ │ │   │   │
                          │  │  │  │  RDS MySQL 8.0 (Multi-AZ)               │ │ │   │   │
                          │  │  │  │  Primary (AZ-a) + Standby (AZ-b)        │ │ │   │   │
                          │  │  │  └────────────────────────────────────────┘ │ │   │   │
                          │  │  │  ┌────────────────────────────────────────┐ │ │   │   │
                          │  │  │  │  ElastiCache Redis (Session Cache)      │ │ │   │   │
                          │  │  │  └────────────────────────────────────────┘ │ │   │   │
                          │  │  └──────────────────────────────────────────────┘ │   │   │
                          │  └───────────────────────────────────────────────────┘   │   │
                          │                                                            │   │
                          │  ┌── AWS Services ──────────────────────────────────┐    │   │
                          │  │  S3 (Attachments) • SES (Email) • Secrets Manager│    │   │
                          │  │  CloudWatch (Logs+Alarms) • ECR (Images)          │    │   │
                          │  └──────────────────────────────────────────────────┘    │   │
                          └─────────────────────────────────────────────────────────┘   
```

### 5 Trụ Cột AWS Well-Architected

| Trụ Cột | Giải Pháp Áp Dụng |
|---|---|
| **⚙️ Operational Excellence** | CI/CD (GitHub Actions + OIDC), CloudWatch Logs (30 ngày), Alarms → SNS Email, SHA-based image tags (rollback được) |
| **🔒 Security** | IAM Least Privilege, VPC Private Subnet, Security Groups (least access), WAF OWASP, Secrets Manager, S3 Presigned URLs, HTTPS TLS 1.3 |
| **🔄 Reliability** | Multi-AZ ECS (2 tasks), RDS Multi-AZ Failover, Auto Scaling (2→10), ECS Circuit Breaker, S3 Durability 11 nines |
| **⚡ Performance Efficiency** | CloudFront CDN (400+ edge locations), ECS Fargate (serverless), HikariCP connection pool, gzip compression |
| **💰 Cost Optimization** | S3 Lifecycle Policy (→IA sau 30 ngày → Glacier sau 90 ngày), CloudWatch Log Retention (30 ngày), Right-sizing (t3.micro RDS, 0.5 vCPU ECS) |

---

## 🛠️ Tech Stack

### Backend
| Công Nghệ | Phiên Bản | Mục Đích |
|---|---|---|
| Java | 17 | Runtime |
| Spring Boot | 3.4.3 | Web framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | ORM / Database access |
| MySQL | 8.0 | Relational database (AWS RDS) |
| JWT (jjwt) | 0.11.5 | Stateless authentication |
| AWS SDK v2 | 2.25 | S3 file storage |
| Flyway | Latest | Database migration management |
| WebSocket (STOMP) | - | Realtime notifications |
| Google Gemini AI | - | AI chatbot integration |
| Lombok | - | Code generation |
| Apache POI | 5.2.3 | Excel export |

### Frontend
| Công Nghệ | Phiên Bản | Mục Đích |
|---|---|---|
| React | 19 | UI framework |
| React Router | v7 | Client-side routing |
| TailwindCSS | 3.x | Styling |
| Axios | 1.14 | HTTP client |
| @stomp/stompjs | 7.x | WebSocket client |
| Framer Motion | 12.x | Animations |
| Chart.js | 4.x | Data visualization |
| @react-oauth/google | 0.13 | Google login |

### Infrastructure (AWS)
| Service | Mục Đích |
|---|---|
| **ECS Fargate** | Container orchestration (serverless) |
| **RDS MySQL (Multi-AZ)** | Database chính |
| **S3** | Static hosting + File attachments |
| **CloudFront** | CDN + WAF |
| **ALB** | Load balancing + HTTPS termination |
| **Secrets Manager** | Quản lý credentials |
| **CloudWatch** | Logging + Monitoring + Alerting |
| **ECR** | Docker image registry |
| **IAM** | Identity & Access Management |
| **SES** | Email delivery |
| **VPC** | Network isolation |

---

## 📁 Cấu Trúc Thư Mục

```
.
├── Taskment/                          # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/Taskment/
│   │   │   │   ├── config/            # Cấu hình (AWS, CORS, WebSocket...)
│   │   │   │   ├── controller/        # REST API endpoints
│   │   │   │   ├── service/           # Business logic
│   │   │   │   ├── repository/        # Data access layer (JPA)
│   │   │   │   ├── entity/            # JPA Entities
│   │   │   │   ├── dto/               # Data Transfer Objects
│   │   │   │   ├── security/          # JWT, SecurityConfig
│   │   │   │   └── exception/         # Global exception handling
│   │   │   └── resources/
│   │   │       ├── application.yaml         # Config local dev
│   │   │       └── application-prod.yaml    # Config production (AWS)
│   │   └── test/                      # Unit tests
│   ├── Dockerfile                     # Multi-stage, non-root user
│   ├── .env.example                   # Environment variables template
│   └── pom.xml
│
├── Taskment/taskment-frontend/        # Frontend (React)
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API service layer
│   │   └── assets/                   # Images, icons
│   ├── nginx.conf                    # Production nginx (security headers)
│   ├── .env.example                  # Frontend env template
│   └── package.json
│
├── infra/terraform/                   # Infrastructure as Code
│   ├── main.tf                       # Provider, backend config
│   ├── variables.tf                  # Input variables
│   ├── outputs.tf                    # Output values
│   ├── vpc.tf                        # VPC, Subnets, IGW, NAT
│   ├── security_groups.tf            # Security Groups (least privilege)
│   ├── iam.tf                        # IAM Roles & Policies
│   ├── rds.tf                        # RDS MySQL Multi-AZ
│   ├── s3.tf                         # S3 Buckets + Lifecycle
│   ├── ecs.tf                        # ECS Cluster + Auto Scaling
│   ├── alb.tf                        # Application Load Balancer
│   ├── cloudfront.tf                 # CloudFront CDN + WAF
│   ├── cloudwatch.tf                 # Monitoring + Alerting
│   └── terraform.tfvars.example      # Variables template
│
└── .github/workflows/
    ├── deploy.yml                    # Backend CI/CD (OIDC, SHA tag)
    ├── deploy-frontend.yml           # Frontend → S3 + CloudFront
    └── pr-checks.yml                 # PR lint & test gate
```

---

## 🚀 Hướng Dẫn Chạy Local (Development)

### Yêu Cầu
- Java 17+
- Maven 3.9+
- Node.js 20+
- MySQL 8.0 (hoặc Docker)
- AWS CLI (nếu muốn test S3 local)

### 1. Clone & Cấu Hình

```bash
# Clone repository
git clone https://github.com/your-username/taskment.git
cd taskment

# Backend: tạo file .env
cp Taskment/.env.example Taskment/.env
# Chỉnh sửa Taskment/.env với thông tin local của bạn

# Frontend: tạo file .env.local
cp Taskment/taskment-frontend/.env.example Taskment/taskment-frontend/.env.local
# Chỉnh sửa REACT_APP_API_URL=http://localhost:8888/api
```

### 2. Khởi Động Database

```bash
# Dùng Docker Compose (đơn giản nhất)
cd Taskment
docker-compose up -d pdshop_mysql

# Hoặc cài MySQL local và tạo database:
mysql -u root -p
CREATE DATABASE task_management_ai;
```

### 3. Chạy Backend

```bash
cd Taskment
./mvnw spring-boot:run

# Backend chạy tại: http://localhost:8888
# Swagger UI: http://localhost:8888/swagger-ui.html (nếu có)
# Health check: http://localhost:8888/actuator/health
```

### 4. Chạy Frontend

```bash
cd Taskment/taskment-frontend
npm install
npm start

# Frontend chạy tại: http://localhost:3000
```

---

## ☁️ Hướng Dẫn Deploy Lên AWS

### Bước 1: Chuẩn Bị AWS Account

```bash
# Cài AWS CLI
aws configure
# Nhập: Access Key ID, Secret Access Key, Region: ap-southeast-1

# Tạo Secrets Manager secrets (trước khi chạy Terraform)
aws secretsmanager create-secret \
  --name "taskment/prod/db-credentials" \
  --secret-string '{"host":"PLACEHOLDER","username":"taskment_admin","password":"YourStrongPassword123!","dbname":"taskment"}'

aws secretsmanager create-secret \
  --name "taskment/prod/app-secrets" \
  --secret-string '{"jwt_secret":"your-jwt-secret","smtp_username":"your-smtp-user","smtp_password":"your-smtp-pass","gemini_api_key":"your-gemini-key"}'
```

### Bước 2: Deploy Infrastructure với Terraform

```bash
cd infra/terraform

# Sao chép và điền giá trị biến
cp terraform.tfvars.example terraform.tfvars
# Chỉnh sửa terraform.tfvars

# Khởi tạo Terraform
terraform init

# Xem kế hoạch thay đổi (chưa apply)
terraform plan -var-file="terraform.tfvars"

# Tạo toàn bộ hạ tầng AWS (~10-15 phút)
terraform apply -var-file="terraform.tfvars"

# Lấy thông tin output quan trọng
terraform output
```

> **Output quan trọng cần lưu:**
> - `alb_dns_name` → Cấu hình DNS record cho API
> - `cloudfront_domain` → URL frontend
> - `ecr_backend_url` → Điền vào GitHub Secrets
> - `github_actions_role_arn` → Điền vào GitHub Secrets

### Bước 3: Cấu Hình GitHub Repository Secrets

Vào **Settings → Secrets and variables → Actions** của repository, thêm:

| Secret | Giá Trị |
|---|---|
| `AWS_GITHUB_ACTIONS_ROLE_ARN` | Output `github_actions_role_arn` từ Terraform |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID CloudFront distribution |
| `REACT_APP_API_URL` | `https://api.yourdomain.com/api` |
| `REACT_APP_WS_URL` | `wss://api.yourdomain.com/ws` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth2 Client ID |

### Bước 4: Deploy Ứng Dụng

```bash
# Push code lên main → GitHub Actions tự động deploy
git push origin main

# Hoặc trigger thủ công:
# GitHub → Actions → "Backend CI/CD" → "Run workflow"
```

### Bước 5: Kiểm Tra

```bash
# Kiểm tra ECS service
aws ecs describe-services \
  --cluster taskment-cluster-prod \
  --services taskment-backend-service \
  --region ap-southeast-1

# Xem logs realtime
aws logs tail /ecs/taskment-backend --follow --region ap-southeast-1

# Kiểm tra health
curl https://api.yourdomain.com/actuator/health
```

---

## 🔐 Bảo Mật (Security Architecture)

```
Internet → CloudFront WAF → ALB (HTTPS) → ECS Private Subnet → RDS Private Subnet
                                                  ↓
                                          Secrets Manager
                                          (không có secrets trong code)
```

| Thành Phần | Biện Pháp Bảo Mật |
|---|---|
| **Credentials** | Lưu trong AWS Secrets Manager, inject vào ECS tại runtime |
| **Network** | Backend/DB trong Private Subnet, không có IP public |
| **API** | JWT authentication, RBAC authorization |
| **Files** | S3 Presigned URL (15 phút), không public |
| **Transport** | HTTPS TLS 1.3 bắt buộc |
| **Container** | Non-root user (uid 1001) |
| **WAF** | OWASP Top 10, Rate limiting (2000 req/5min) |
| **CI/CD** | OIDC (không cần long-lived AWS keys) |

---

## 📊 Monitoring & Alerting

CloudWatch Dashboard: [Xem tại AWS Console](https://console.aws.amazon.com/cloudwatch)

| Metric | Ngưỡng Alert | Hành Động |
|---|---|---|
| ECS CPU | > 80% (5 phút) | SNS Email → Auto Scale Out |
| ALB 5xx Errors | > 10 lần/5 phút | SNS Email Alert |
| RDS CPU | > 80% | SNS Email Alert |
| RDS Storage | < 5GB | SNS Email Alert |

Xem logs realtime:
```bash
aws logs tail /ecs/taskment-backend --follow --region ap-southeast-1
```

---

## 💰 Ước Tính Chi Phí AWS (ap-southeast-1)

| Service | Cấu Hình | Chi Phí/Tháng |
|---|---|---|
| ECS Fargate | 2 tasks × 0.5 vCPU × 1GB | ~$15 |
| RDS MySQL | db.t3.micro Multi-AZ | ~$30 |
| ALB | 1 ALB | ~$18 |
| NAT Gateway | 1 NAT | ~$32 |
| CloudFront | < 1TB traffic | ~$0 (Free Tier) |
| S3 | 10GB | ~$0.23 |
| CloudWatch | Logs + Alarms | ~$3 |
| Secrets Manager | 2 secrets | ~$0.80 |
| **TỔNG** | | **~$99/tháng** |

> 💡 **Tiết kiệm**: Dùng **AWS Free Tier** (12 tháng đầu) + **Fargate Spot** cho workload non-critical → giảm 70% chi phí ECS

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
3. Commit với message rõ ràng: `git commit -m "feat: thêm tính năng X"`
4. Tạo Pull Request → CI/CD tự chạy tests
5. Review & merge sau khi pass checks

---

## 📄 License

MIT License — Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

*Đồ án tốt nghiệp — Taskment Task Management System*  
*Triển khai trên AWS theo AWS Well-Architected Framework*
