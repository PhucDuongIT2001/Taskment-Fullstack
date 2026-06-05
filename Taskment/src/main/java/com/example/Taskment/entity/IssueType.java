package com.example.Taskment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "issue_types")
public class IssueType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // Bắt buộc phải có constructor không tham số cho JPA
    public IssueType() {
    }

    // Thêm lại constructor có tham số để DataSeeder sử dụng
    public IssueType(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
