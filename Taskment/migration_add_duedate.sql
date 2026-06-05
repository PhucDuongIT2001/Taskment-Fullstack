-- SQL Migration: Thêm tính năng DueDate vào bảng tasks
-- Chạy script này trong môi trường MySQL/PostgreSQL

-- 1. Thêm cột due_date
ALTER TABLE tasks ADD COLUMN due_date DATETIME DEFAULT NULL;

-- 2. (Tuỳ chọn) Handle dữ liệu cũ: Cập nhật các task cũ có deadline là +7 ngày từ ngày tạo
UPDATE tasks SET due_date = DATE_ADD(created_at, INTERVAL 7 DAY) WHERE due_date IS NULL;

-- 3. Đảm bảo trạng thái OVERDUE có tồn tại trong hệ thống
-- Giả sử bảng task_statuses có cấu trúc (id, name, description)
-- Hãy tự động thêm trạng thái OVERDUE nếu chưa có
INSERT INTO task_statuses (name, description)
SELECT 'OVERDUE', 'Công việc đã quá hạn'
WHERE NOT EXISTS (
    SELECT 1 FROM task_statuses WHERE name = 'OVERDUE'
);
