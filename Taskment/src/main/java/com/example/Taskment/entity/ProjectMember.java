package com.example.Taskment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name ="project_members")
public class ProjectMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Ket noi table  project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="project_id", nullable = false)
    private Project project;

    //Ket noi voi Users

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",nullable = false)
    private User user;

    //Roles
    @Column(name = "role_in_project", nullable = false)
    private String roleInProject = "MEMBER";

    @Column(name="joined_at")
    private LocalDateTime joinedAt;

    // CONSTRUCTOR
    public ProjectMember(){}

    @PrePersist
    protected void onCreate(){
        this.joinedAt = LocalDateTime.now();
    }

    // GET AND SET


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRoleInProject() {
        return roleInProject;
    }

    public void setRoleInProject(String roleInProject) {
        this.roleInProject = roleInProject;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
