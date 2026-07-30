-- ============================================================
-- V2__add_staff_leader_role.sql
-- Thêm role Staff Leader (vắng trong V1 nhưng có trong logic ứng dụng)
--
-- LÝ DO TẠO FILE RIÊNG (không sửa V1):
-- Flyway lưu checksum của từng file migration.
-- Nếu sửa V1__initial_schema.sql sau khi đã deploy → Flyway báo lỗi
-- "Checksum mismatch" → phải tạo file Vn__ mới cho mọi thay đổi.
-- ============================================================

INSERT IGNORE INTO roles (role, name) VALUES
('ROLE_STAFF_LEADER', 'Staff Leader');

-- Thêm Sprint start_date và end_date (hỗ trợ roadmap calendar)
ALTER TABLE sprints
    ADD COLUMN IF NOT EXISTS start_date DATETIME NULL AFTER status,
    ADD COLUMN IF NOT EXISTS end_date   DATETIME NULL AFTER start_date;

-- Thêm index tăng tốc query task theo assignee (thường xuyên filter theo người được giao)
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project  ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
