---
name: fullstack-best-practices
description: "Senior Fullstack Engineering standards for Taskment app (Spring Boot 3 + React + Docker)"
---

# Taskment Engineering Best Practices (Matt Pocock Style)

Bảng quy tắc chuẩn hóa mã nguồn cho dự án Taskment, được thiết kế để AI Agent và Lập trình viên tự động áp dụng khi xây dựng hoặc bảo trì dự án.

---

## 🎨 1. Frontend Standards (React.js / Modern UI)
- **Component Architecture**: 
  - Mỗi Component đảm nhận 1 nhiệm vụ duy nhất (Single Responsibility Principle).
  - Tách biệt UI và Business Logic (dùng Custom Hooks như `useAuth`, `useTasks`).
- **State Management**:
  - Không đột biến state trực tiếp (`never mutate state directly`).
  - Ưu tiên Functional Updates khi cập nhật state phụ thuộc giá trị cũ.
- **Error Handling & UX**:
  - Luôn hiển thị Toast Notification hoặc Alert rõ ràng khi có lỗi API.
  - Sử dụng Loading Skeleton/Spinner khi gọi API bất đồng bộ.

---

## 🛡️ 2. Backend Standards (Spring Boot 3 / Java)
- **RESTful API Contract**:
  - Trả về đối tượng `ResponseEntity<ApiResponse<T>>` đồng nhất cho tất cả Endpoint.
  - Đặt tên URL danh từ số nhiều (VD: `/api/v1/tasks`, `/api/v1/users`).
- **Security & OAuth2**:
  - Không hardcode Secret Key trong code; luôn đọc từ Environment Variables (`application-prod.yaml`).
  - Đăng nhập OAuth2 Google phải tự động fallback và khớp nối linh hoạt các Origin URI.
- **Database & JPA**:
  - Sử dụng `@Transactional` cho các hàm thay đổi dữ liệu.
  - Luôn có Migration SQL hoặc DDL auto validation khi thay đổi Schema.

---

## 🐳 3. DevOps & Containerization
- **Docker & IaC**:
  - Thư mục gốc dự án giữ tệp `docker-compose.yml` để khởi chạy 1-lệnh (`docker-compose up -d`).
  - Mã nguồn IaC Terraform đặt trong `infra/terraform-student/` để dễ dàng deploy/destroy trên AWS.
