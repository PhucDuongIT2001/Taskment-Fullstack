package com.example.Taskment.dto;

public class ProjectRequestDTO {
    private String name;
    private String description;
    private String status;
    private Long leaderId;
    private java.time.LocalDateTime dueDate;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getLeaderId() { return leaderId; }
    public void setLeaderId(Long leaderId) { this.leaderId = leaderId; }
    public java.time.LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(java.time.LocalDateTime dueDate) { this.dueDate = dueDate; }
}
