package com.example.Taskment.controller;

import com.example.Taskment.dto.AttachmentDTO;
import com.example.Taskment.service.AttachmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<AttachmentDTO> uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        AttachmentDTO dto = attachmentService.uploadAttachment(taskId, file, username);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<List<AttachmentDTO>> getAttachments(@PathVariable Long taskId) {
        List<AttachmentDTO> attachments = attachmentService.getAttachmentsByTaskId(taskId);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        attachmentService.deleteAttachment(id, username);
        return ResponseEntity.ok("Đã xóa tài liệu thành công");
    }
}
