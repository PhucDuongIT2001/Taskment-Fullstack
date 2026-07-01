-- =====================================================
-- Migration: Task Attachments & Activity Log Enhancement
-- Dự án: Taskment.ai
-- Ngày: 2026-06-05
-- =====================================================

-- ---------------------------------------------------
-- 1. Bảng task_attachments (thay cho attachments cũ)
--    Nếu bảng attachments đã tồn tại, thêm cột mới
-- ---------------------------------------------------

-- Thêm file_size (bytes) và file_type (MIME type) vào bảng attachments
ALTER TABLE attachments
    ADD COLUMN IF NOT EXISTS file_size BIGINT COMMENT 'Kích thước file tính bằng bytes',
    ADD COLUMN IF NOT EXISTS file_type VARCHAR(100) COMMENT 'MIME type của file (vd: application/pdf)';

-- ---------------------------------------------------
-- 2. Cập nhật bảng activity_logs
--    Thêm task_id và user_id để filter per-task
-- ---------------------------------------------------

ALTER TABLE activity_logs
    ADD COLUMN IF NOT EXISTS task_id BIGINT NULL COMMENT 'ID của task liên quan (nullable - log toàn hệ thống không cần)',
    ADD COLUMN IF NOT EXISTS user_id BIGINT NULL COMMENT 'ID của user thực hiện hành động';

-- Index để tăng tốc query theo task_id
CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);

-- ---------------------------------------------------
-- 3. Nếu cần tạo mới bảng attachments từ đầu
--    (dùng khi chưa có bảng attachments)
-- ---------------------------------------------------

-- CREATE TABLE IF NOT EXISTS attachments (
--     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
--     file_name   VARCHAR(255) NOT NULL COMMENT 'Tên file gốc',
--     file_url    VARCHAR(500) NOT NULL COMMENT 'URL tương đối để download (/uploads/...)',
--     file_size   BIGINT       COMMENT 'Kích thước file tính bằng bytes',
--     file_type   VARCHAR(100) COMMENT 'MIME type (application/pdf, ...)',
--     task_id     BIGINT NOT NULL COMMENT 'Task chứa attachment này',
--     uploaded_by BIGINT       COMMENT 'User đã upload file',
--     created_at  DATETIME     COMMENT 'Thời điểm upload',
--     CONSTRAINT fk_attachment_task
--         FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
--     CONSTRAINT fk_attachment_uploader
--         FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
-- );

-- ---------------------------------------------------
-- 4. Kiểm tra kết quả
-- ---------------------------------------------------
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME IN ('attachments', 'activity_logs')
-- AND TABLE_SCHEMA = 'task_management_ai'
-- ORDER BY TABLE_NAME, ORDINAL_POSITION;
