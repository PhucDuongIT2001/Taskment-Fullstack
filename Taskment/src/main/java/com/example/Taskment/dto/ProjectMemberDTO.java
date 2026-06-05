package com.example.Taskment.dto;

public class ProjectMemberDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String role; // Vai trò trong dự án, ví dụ: "Developer", "Tester"

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
