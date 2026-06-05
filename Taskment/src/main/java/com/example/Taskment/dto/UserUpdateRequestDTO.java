package com.example.Taskment.dto;

import java.util.Set;

public class UserUpdateRequestDTO {
    private String fullName;
    private String email;
    private String password; // Để trống nếu không muốn đổi
    private Set<String> roleNames;

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<String> getRoleNames() { return roleNames; }
    public void setRoleNames(Set<String> roleNames) { this.roleNames = roleNames; }
}
