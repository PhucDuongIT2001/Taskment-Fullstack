# KẾ HOẠCH PHÁT TRIỂN DỰ ÁN TASKMENT

## Ưu tiên #1: Hoàn thiện và Bảo mật Luồng Xác thực
Đây là việc cần làm ngay lập tức sau khi đăng nhập thành công.

1. **Sửa lỗi Unit Test:**
   - **Vấn đề:** Lỗi `Mockito cannot mock this class` xảy ra vì lớp `AuthService` có thể đang bị khai báo là `final`.
   - **Hành động:** Mở file `AuthService.java` và **xóa từ khóa `final`** khỏi khai báo lớp. Sau đó chạy lại test để đảm bảo mọi thứ đều xanh.

2. **Tích hợp JWT (JSON Web Token):**
   - **Tại sao?** Hiện tại, sau khi đăng nhập, frontend không có cách nào "chứng minh" cho backend rằng nó đã đăng nhập ở những lần gọi API sau.
   - **Hành động (Backend):**
     - Thêm thư viện JWT (ví dụ: `jjwt`).
     - Sau khi `AuthService` xác thực người dùng thành công, tạo ra một chuỗi JWT chứa thông tin người dùng (ví dụ: username, roles).
     - Trả về chuỗi JWT này cho frontend trong response của API `/api/auth/login`.
   - **Hành động (Frontend):**
     - Sau khi nhận được JWT từ API login, lưu nó vào một nơi an toàn (ví dụ: `localStorage` hoặc `sessionStorage`).
     - Khi gọi các API cần bảo vệ sau này, đính kèm JWT này vào header của request (`Authorization: Bearer <token>`).

3. **Bảo vệ các API khác (Protected Routes):**
   - **Tại sao?** Chúng ta không muốn bất kỳ ai cũng có thể xem, tạo, sửa, xóa các công việc.
   - **Hành động (Backend):**
     - Sử dụng Spring Security để cấu hình một bộ lọc (filter).
     - Bộ lọc này sẽ chặn các request đến các API cần bảo vệ (ví dụ: `/api/tasks/**`).
     - Đọc JWT từ header, xác thực token, và nếu hợp lệ thì cho phép request đi tiếp. Nếu không, trả về lỗi `401 Unauthorized`.

## Ưu tiên #2: Xây dựng Chức năng Cốt lõi (Quản lý Task)
Khi luồng xác thực đã an toàn, chúng ta bắt đầu xây dựng tính năng chính.

1. **Backend:**
   - Tạo Entity `Task` (với các trường như `id`, `title`, `description`, `status`, `dueDate`, `userId` để biết task này của ai).
   - Tạo `TaskRepository`, `TaskService`, `TaskController` cho các hành động CRUD.
   - Viết API để:
     - Lấy danh sách các task của người dùng đang đăng nhập.
     - Tạo một task mới.
     - Cập nhật một task.
     - Xóa một task.

2. **Frontend:**
   - Tạo trang `Dashboard` hoặc `TaskList` để hiển thị danh sách công việc sau khi đăng nhập.
   - Tạo các component như `TaskItem` (hiển thị một công việc), `AddTaskForm` (form thêm công việc mới).
   - Viết các hàm trong `TaskService.js` để gọi các API quản lý task.
   - Cấu hình routing (ví dụ: dùng `react-router-dom`) để chuyển hướng người dùng đến trang Dashboard sau khi đăng nhập thành công.

## Ưu tiên #3: Cải thiện và Mở rộng
Đây là các bước giúp ứng dụng hoàn thiện và chuyên nghiệp hơn.

1. **Validation:** Thêm validation cho dữ liệu đầu vào ở cả frontend và backend.
2. **Error Handling:** Xử lý lỗi một cách thân thiện hơn ở frontend, hiển thị thông báo lỗi rõ ràng cho người dùng.
3. **Quản lý State:** Sử dụng các công cụ quản lý state của React (như Context API hoặc Redux) để quản lý thông tin người dùng đăng nhập một cách nhất quán trên toàn ứng dụng.
