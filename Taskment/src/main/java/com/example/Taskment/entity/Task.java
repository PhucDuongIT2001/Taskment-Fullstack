package com.example.Taskment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- CÁC MỐI QUAN HỆ (RELATIONSHIPS) ---

    // 1. Task thuộc về một dự án nào đó
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"tasks","hibernateLazyInitializer", "handler"})
    private Project project;

    // 2. Người thực hiện công việc (Assignee)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User assignee;

    // 3. Người tạo/báo cáo công việc (Reporter)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User reporter;

    // 4. Trạng thái của Task (Kết nối với bảng task_status)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TaskStatus status;

    // 5. Mức độ ưu tiên (Kết nối với bảng priorities)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "priority_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Priority priority;

    // --- CONSTRUCTOR ---

    public Task() {
    }

    // Constructor có tham số để tạo nhanh Task
    public Task(String title, String description, Project project, User reporter) {
        this.title = title;
        this.description = description;
        this.project = project;
        this.reporter = reporter;
    }

    // Tự động gán ngày tạo
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- GETTER VÀ SETTER ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
}