package com.example.Taskment.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomerRequestDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
