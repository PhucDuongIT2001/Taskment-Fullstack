package com.example.Taskment.entity;

import jakarta.persistence.*;

@Entity
@Table( name= "roles")
public class Role {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY )
    private Long id;

    @Column(nullable = false,unique = true)
    private String role;

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    public Role() {}


    public Role(String role, String name) {
        this.role = role;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

