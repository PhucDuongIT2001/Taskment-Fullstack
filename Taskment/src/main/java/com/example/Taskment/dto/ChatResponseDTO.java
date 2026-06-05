package com.example.Taskment.dto;

public class ChatResponseDTO {
    private String response;
    private Long conversationId;

    public ChatResponseDTO() {}

    public ChatResponseDTO(String response) {
        this.response = response;
    }

    public ChatResponseDTO(String response, Long conversationId) {
        this.response = response;
        this.conversationId = conversationId;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
}
