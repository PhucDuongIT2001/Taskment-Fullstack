package com.example.Taskment.dto;

import java.util.Set;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;

    //Constructor
    public UserProfileDto(String username, String email) {}



    // Getters and Setters
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
}
