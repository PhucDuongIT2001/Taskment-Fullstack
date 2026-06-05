package com.example.Taskment.dto;

import java.time.LocalDateTime;

public class ProjectResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDateTime createAt;
    private LocalDateTime dueDate;
    private String leaderUsername;
    private Long leaderId;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreateAt() { return createAt; }
    public void setCreateAt(LocalDateTime createAt) { this.createAt = createAt; }
    public String getLeaderUsername() { return leaderUsername; }
    public void setLeaderUsername(String leaderUsername) { this.leaderUsername = leaderUsername; }
    public Long getLeaderId() { return leaderId; }
    public void setLeaderId(Long leaderId) { this.leaderId = leaderId; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
}
