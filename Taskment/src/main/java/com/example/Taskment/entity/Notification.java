package com.example.Taskment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient; // Người nhận thông báo

    @Column(nullable = false)
    private String message; // Nội dung thông báo

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false; // Mặc định là chưa đọc

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private String link; // Đường dẫn để khi click vào sẽ đi đến Task/Project liên quan

    @Column(name = "type")
    private String type; // Loại notification: SYSTEM, DEADLINE_WARNING, OVERDUE, TASK_ASSIGNED, etc.

    @Column(name = "task_id")
    private Long taskId; // Liên kết với task nếu có

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
}
