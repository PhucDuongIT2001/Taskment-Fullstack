package com.example.Taskment.dto;


import java.time.LocalDateTime;

public class TaskDTO {
    public TaskDTO() {}

    public TaskDTO(Long id, String title, String description, java.time.LocalDateTime dueDate, java.time.LocalDateTime createdAt, Long projectId, String projectName, Long statusId, String statusName, Long priorityId, String priorityName, Long assigneeId, String assigneeUsername) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.projectId = projectId;
        this.projectName = projectName;
        this.statusId = statusId;
        this.statusName = statusName;
        this.priorityId = priorityId;
        this.priorityName = priorityName;
        this.assigneeId = assigneeId;
        this.assigneeUsername = assigneeUsername;
    }

    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    
    private Long projectId;
    private String projectName;
    
    private Long statusId;
    private String statusName;
    
    private Long priorityId;
    private String priorityName;
    
    private Long assigneeId;
    private String assigneeUsername;

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
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public Long getStatusId() { return statusId; }
    public void setStatusId(Long statusId) { this.statusId = statusId; }
    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }
    public Long getPriorityId() { return priorityId; }
    public void setPriorityId(Long priorityId) { this.priorityId = priorityId; }
    public String getPriorityName() { return priorityName; }
    public void setPriorityName(String priorityName) { this.priorityName = priorityName; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public String getAssigneeUsername() { return assigneeUsername; }
    public void setAssigneeUsername(String assigneeUsername) { this.assigneeUsername = assigneeUsername; }
}
