package com.example.Taskment.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateTaskStatusRequest {

    @NotNull(message = "New Status ID cannot be null")
    private Long newStatusId;

    public Long getNewStatusId() {
        return newStatusId;
    }

    public void setNewStatusId(Long newStatusId) {
        this.newStatusId = newStatusId;
    }
}
