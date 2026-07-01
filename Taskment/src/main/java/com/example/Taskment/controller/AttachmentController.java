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

    /**
     * Upload file đính kèm cho một task
     * POST /api/tasks/{taskId}/attachments
     */
    @PostMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<AttachmentDTO> uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        AttachmentDTO dto = attachmentService.uploadAttachment(taskId, file, username);
        return ResponseEntity.ok(dto);
    }

    /**
     * Lấy danh sách file đính kèm của một task
     * GET /api/tasks/{taskId}/attachments
     */
    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<List<AttachmentDTO>> getAttachments(@PathVariable Long taskId) {
        List<AttachmentDTO> attachments = attachmentService.getAttachmentsByTaskId(taskId);
        return ResponseEntity.ok(attachments);
    }

    /**
     * Xóa file đính kèm theo attachmentId (path riêng)
     * DELETE /api/attachments/{id}
     */
    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        attachmentService.deleteAttachment(id, username);
        return ResponseEntity.ok("Đã xóa tài liệu thành công");
    }

    /**
     * Xóa file đính kèm theo taskId và attachmentId (RESTful path chuẩn)
     * DELETE /api/tasks/{taskId}/attachments/{attachmentId}
     */
    @DeleteMapping("/tasks/{taskId}/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachmentByTask(
            @PathVariable Long taskId,
            @PathVariable Long attachmentId,
            Authentication authentication) {
        String username = authentication.getName();
        attachmentService.deleteAttachment(attachmentId, username);
        return ResponseEntity.ok("Đã xóa tài liệu thành công");
    }
}
