package com.example.Taskment.dto;

import java.time.LocalDateTime;

public class AttachmentDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private LocalDateTime createdAt;
    private String uploadedByUsername;
    private String uploadedByFullName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUploadedByUsername() {
        return uploadedByUsername;
    }

    public void setUploadedByUsername(String uploadedByUsername) {
        this.uploadedByUsername = uploadedByUsername;
    }

    public String getUploadedByFullName() {
        return uploadedByFullName;
    }

    public void setUploadedByFullName(String uploadedByFullName) {
        this.uploadedByFullName = uploadedByFullName;
    }
}
