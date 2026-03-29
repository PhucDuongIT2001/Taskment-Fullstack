package com.example.Taskment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "priorities")
public class Priority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Ví dụ: "High", "Medium", "Low"

    private Integer level; // Mức độ ưu tiên bằng số (1, 2, 3...)

    // --- Constructor ---
    public Priority() {}

    public Priority(String name, Integer level) {
        this.name = name;
        this.level = level;
    }

    // --- Getter và Setter ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
}