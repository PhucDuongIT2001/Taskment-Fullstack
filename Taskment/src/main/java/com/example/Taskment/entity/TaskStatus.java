package com.example.Taskment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "task_status")
public class TaskStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Ví dụ: "To Do", "In Progress", "Done"

    // --- Constructor ---
    public TaskStatus() {}

    public TaskStatus(String name) {
        this.name = name;
    }

    // --- Getter và Setter ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}