package com.example.Taskment.dto;

public class ChatbotResponse {
    private String reply;

    // Constructor
    public ChatbotResponse() {}

    public ChatbotResponse(String reply) {
        this.reply = reply;
    }

    // Getter and Setter
    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
