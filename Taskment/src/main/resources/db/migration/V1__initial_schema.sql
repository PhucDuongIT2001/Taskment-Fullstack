-- ============================================================
-- V1__initial_schema.sql — Schema khởi tạo ban đầu
-- Tạo toàn bộ bảng theo thứ tự phụ thuộc (bảng cha trước, con sau)
--
-- Flyway đọc file này một lần duy nhất khi khởi động lần đầu.
-- Sau đó dùng các file V2__, V3__... cho mỗi thay đổi tiếp theo.
--
-- LÝ DO DÙNG FLYWAY thay vì ddl-auto: update:
-- - "update" không bao giờ xóa column cũ → schema bẩn dần theo thời gian
-- - Không có lịch sử thay đổi schema
-- - Không thể rollback
-- - Flyway: version-controlled, traceable, reproducible
-- ============================================================

-- ============================================================
-- TẦNG 1: Các bảng lookup không phụ thuộc bảng khác
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(255) NOT NULL UNIQUE,       -- Ví dụ: ROLE_ADMIN, ROLE_STAFF
    name VARCHAR(50)  NOT NULL               -- Ví dụ: Admin, Staff
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_status (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE        -- TODO, IN_PROGRESS, DONE, OVERDUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS priorities (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(255) NOT NULL UNIQUE,      -- LOW, MEDIUM, HIGH, CRITICAL
    level INT                                -- 1=Low, 2=Medium, 3=High, 4=Critical
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS issue_types (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE        -- BUG, STORY, TASK, EPIC
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẦNG 2: Bảng users (nhiều bảng phụ thuộc vào đây)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username                    VARCHAR(255) NOT NULL UNIQUE,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    password                    VARCHAR(255) NOT NULL,
    full_name                   VARCHAR(255),
    enabled                     BOOLEAN NOT NULL DEFAULT FALSE,
    reset_password_token        VARCHAR(255),
    reset_password_token_expiry DATETIME,
    two_factor_otp              VARCHAR(255),
    two_factor_otp_expiry       DATETIME,
    created_at                  DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng join: User ↔ Role (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profile chi tiết của User
CREATE TABLE IF NOT EXISTS human_info (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL UNIQUE,            -- 1-1 với users
    first_name    VARCHAR(255),
    last_name     VARCHAR(255),
    phone_number  VARCHAR(255),
    address       VARCHAR(255),
    date_of_birth DATE,
    avatar_url    VARCHAR(255),
    gender        VARCHAR(255),
    bio           TEXT,
    CONSTRAINT fk_human_info_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token xác thực email khi đăng ký
CREATE TABLE IF NOT EXISTS verification_token (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    user_id     BIGINT NOT NULL,
    CONSTRAINT fk_verification_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token đặt lại mật khẩu
CREATE TABLE IF NOT EXISTS forgot_password_token (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    user_id     BIGINT NOT NULL,
    CONSTRAINT fk_forgot_password_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẦNG 3: Bảng projects (phụ thuộc users)
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(255),
    create_at   DATETIME,
    due_date    DATETIME,
    leader_id   BIGINT,
    CONSTRAINT fk_projects_leader FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thành viên của từng dự án
CREATE TABLE IF NOT EXISTS project_members (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id       BIGINT NOT NULL,
    user_id          BIGINT NOT NULL,
    role_in_project  VARCHAR(255) NOT NULL DEFAULT 'MEMBER',  -- LEADER, MEMBER
    joined_at        DATETIME,
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    UNIQUE KEY uq_project_member (project_id, user_id)        -- Mỗi user chỉ có 1 role/project
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sprint của dự án
CREATE TABLE IF NOT EXISTS sprints (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    status     VARCHAR(255),
    project_id BIGINT NOT NULL,
    CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẦNG 4: Bảng tasks (phụ thuộc projects, users, status, priority...)
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    story_points        INT,
    created_at          DATETIME,
    due_date            DATETIME,
    is_customer_request BOOLEAN NOT NULL DEFAULT FALSE,
    project_id          BIGINT NOT NULL,
    status_id           BIGINT,
    priority_id         BIGINT,
    issue_type_id       BIGINT,
    sprint_id           BIGINT,
    parent_id           BIGINT,                              -- Self-reference: subtask
    reporter_id         BIGINT,
    assignee_id         BIGINT,
    CONSTRAINT fk_tasks_project    FOREIGN KEY (project_id)    REFERENCES projects(id)    ON DELETE CASCADE,
    CONSTRAINT fk_tasks_status     FOREIGN KEY (status_id)     REFERENCES task_status(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_priority   FOREIGN KEY (priority_id)   REFERENCES priorities(id)  ON DELETE SET NULL,
    CONSTRAINT fk_tasks_issuetype  FOREIGN KEY (issue_type_id) REFERENCES issue_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_sprint     FOREIGN KEY (sprint_id)     REFERENCES sprints(id)     ON DELETE SET NULL,
    CONSTRAINT fk_tasks_parent     FOREIGN KEY (parent_id)     REFERENCES tasks(id)       ON DELETE SET NULL,
    CONSTRAINT fk_tasks_reporter   FOREIGN KEY (reporter_id)   REFERENCES users(id)       ON DELETE SET NULL,
    CONSTRAINT fk_tasks_assignee   FOREIGN KEY (assignee_id)   REFERENCES users(id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẦNG 5: Các bảng con phụ thuộc tasks
-- ============================================================

-- Bình luận trên task
CREATE TABLE IF NOT EXISTS comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    content    TEXT NOT NULL,
    created_at DATETIME,
    task_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    CONSTRAINT fk_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File đính kèm (lưu S3 key, không lưu URL trực tiếp)
CREATE TABLE IF NOT EXISTS attachments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name   VARCHAR(255) NOT NULL,
    file_url    VARCHAR(255) NOT NULL,   -- S3 Object Key (ví dụ: attachments/42/uuid_doc.pdf)
    file_size   BIGINT,
    file_type   VARCHAR(100),
    created_at  DATETIME,
    task_id     BIGINT NOT NULL,
    uploaded_by BIGINT,
    CONSTRAINT fk_attachments_task FOREIGN KEY (task_id)     REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Người theo dõi task (nhận thông báo khi task thay đổi)
CREATE TABLE IF NOT EXISTS task_watchers (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_tw_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_tw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_task_watcher (task_id, user_id)   -- Mỗi user chỉ watch 1 lần
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẦNG 6: Bảng log và notification (phụ thuộc users)
-- ============================================================

-- Nhật ký hoạt động (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    type       VARCHAR(255) NOT NULL,   -- SUCCESS, WARNING, ERROR, INFO
    message    VARCHAR(255) NOT NULL,
    task_id    BIGINT,                  -- Nullable — không phải mọi log đều liên quan task
    user_id    BIGINT,                  -- Nullable — không phải mọi log đều có user
    created_at DATETIME NOT NULL,

    -- Index tăng tốc query theo task hoặc user
    INDEX idx_activity_logs_task_id (task_id),
    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thông báo gửi đến người dùng
CREATE TABLE IF NOT EXISTS notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    message      VARCHAR(255) NOT NULL,
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   DATETIME NOT NULL,
    link         VARCHAR(255),
    type         VARCHAR(255),    -- SYSTEM, DEADLINE_WARNING, OVERDUE, TASK_ASSIGNED...
    task_id      BIGINT,
    CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_recipient (recipient_id),
    INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẦNG 7: AI Conversations & Messages
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    user_id    BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    CONSTRAINT fk_ai_conv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_conversations_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_messages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    role            VARCHAR(10) NOT NULL,   -- 'user' hoặc 'model'
    content         TEXT NOT NULL,
    created_at      DATETIME NOT NULL,
    CONSTRAINT fk_ai_msg_conv FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    INDEX idx_ai_messages_conv (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DỮ LIỆU KHỞI TẠO (Seed Data)
-- INSERT IGNORE: an toàn khi chạy lại (không duplicate)
-- ============================================================

-- Roles cơ bản của hệ thống
INSERT IGNORE INTO roles (role, name) VALUES
('ROLE_ADMIN',    'Admin'),
('ROLE_STAFF',    'Staff'),
('ROLE_CUSTOMER', 'Khách hàng');

-- Task Status mặc định
INSERT IGNORE INTO task_status (name) VALUES
('TODO'),
('IN_PROGRESS'),
('DONE'),
('OVERDUE'),
('CANCELLED'),
('REVIEWING');

-- Priority levels
INSERT IGNORE INTO priorities (name, level) VALUES
('LOW',      1),
('MEDIUM',   2),
('HIGH',     3),
('CRITICAL', 4);

-- Issue Types theo chuẩn Scrum
INSERT IGNORE INTO issue_types (name) VALUES
('TASK'),
('BUG'),
('STORY'),
('EPIC');
