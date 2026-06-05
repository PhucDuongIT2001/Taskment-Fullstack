package com.example.Taskment.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatbotRequest {
    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;

    // Constructor
    public ChatbotRequest() {}

    public ChatbotRequest(String message) {
        this.message = message;
    }

    // Getter and Setter
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
