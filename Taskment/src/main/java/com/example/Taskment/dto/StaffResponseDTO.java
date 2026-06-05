package com.example.Taskment.dto;

import lombok.Data;
import java.util.Set;

@Data
public class StaffResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private int taskCount; // Số lượng công việc đang được giao

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public int getTaskCount() { return taskCount; }
    public void setTaskCount(int taskCount) { this.taskCount = taskCount; }
}
