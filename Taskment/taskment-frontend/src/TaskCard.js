import React from 'react';

function TaskCard({ task, onDelete }) {
  // Destructuring (Trích xuất) các thuộc tính từ object task.
  // Việc này giúp code bên dưới ngắn gọn hơn, không cần phải viết "task.title", "task.id" lặp đi lặp lại.
  const { id, title, description, project, status, assignee } = task;

  return (
    // Dùng thẻ <article> (Semantic HTML) thay vì <div> giúp cấu trúc web rõ ràng hơn, 
    // tốt cho SEO và các công cụ đọc màn hình (Accessibility).
    <article className="card">
      {/* Phần header chứa tiêu đề và nút hành động */}
      <header className="card-header">
        {/* Toán tử || (Logical OR) sẽ hiển thị chuỗi "Không có tiêu đề" nếu title bị rỗng hoặc null */}
        <h3 className="card-title">{title || "Không có tiêu đề"}</h3>
        <button className="delete-btn" onClick={() => onDelete(id)}>Xóa</button>
      </header>

      <p className="card-desc">{description || "Không có mô tả"}</p>

      <div className="card-badges">
        {/* Dùng dấu ?. (Optional Chaining) để tránh lỗi crash app (trắng trang) 
            nếu object project hoặc status trả về từ API bị null/undefined */}
        <div className="badge badge-project">
          📍 Dự án: {project?.name || "N/A"}
        </div>
        <div className="badge badge-status">
          🏷️ Trạng thái: {status?.name || "Chưa rõ"}
        </div>
      </div>

      {/* Phần footer để hiển thị các thông tin phụ như người thực hiện */}
      <footer className="card-footer">
        👤 Người thực hiện: {assignee?.fullName || "Chưa giao"}
      </footer>
    </article>
  );
}

export default TaskCard;