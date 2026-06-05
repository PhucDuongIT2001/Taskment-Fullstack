package com.example.Taskment.service;

import com.example.Taskment.dto.AttachmentDTO;
import com.example.Taskment.entity.Attachment;
import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.AttachmentRepository;
import com.example.Taskment.repository.TaskRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    // Thư mục lưu trữ file
    private final String UPLOAD_DIR = "uploads";

    public AttachmentService(AttachmentRepository attachmentRepository, TaskRepository taskRepository, UserRepository userRepository, ActivityLogService activityLogService) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
        
        // Tạo thư mục nếu chưa tồn tại
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục lưu trữ file đính kèm", e);
        }
    }

    public AttachmentDTO uploadAttachment(Long taskId, MultipartFile file, String username) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Tạo tên file duy nhất để tránh trùng lặp
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        try {
            Path targetLocation = Paths.get(UPLOAD_DIR).resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Tạo đường dẫn URL tương đối để truy cập file từ trình duyệt
            // URL sẽ có dạng: /uploads/filename.ext (tương đối, qua Nginx cổng 80)
            String fileDownloadUri = "/uploads/" + uniqueFileName;

            Attachment attachment = new Attachment();
            attachment.setFileName(originalFileName);
            attachment.setFileUrl(fileDownloadUri);
            attachment.setTask(task);
            attachment.setUploadedBy(user);

            Attachment savedAttachment = attachmentRepository.save(attachment);
            
            activityLogService.logActivity("INFO", user.getUsername() + " đã tải lên tài liệu '" + originalFileName + "' cho công việc '" + task.getTitle() + "'");

            return convertToDTO(savedAttachment);
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu file " + originalFileName + ". Vui lòng thử lại!", ex);
        }
    }

    public List<AttachmentDTO> getAttachmentsByTaskId(Long taskId) {
        return attachmentRepository.findByTaskId(taskId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteAttachment(Long attachmentId, String username) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài liệu đính kèm"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Chỉ người tải lên hoặc Admin mới được phép xóa
        if (!attachment.getUploadedBy().equals(user) && !user.getRoles().stream().anyMatch(r -> r.getRole().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Bạn không có quyền xóa tài liệu này");
        }

        // Xóa file vật lý trong thư mục
        try {
            // Lấy tên file từ URL (lấy phần cuối sau dấu /)
            String fileUrl = attachment.getFileUrl();
            String uniqueFileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(UPLOAD_DIR).resolve(uniqueFileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            System.err.println("Không thể xóa file vật lý: " + ex.getMessage());
        }

        attachmentRepository.delete(attachment);
        activityLogService.logActivity("WARNING", user.getUsername() + " đã xóa tài liệu '" + attachment.getFileName() + "' khỏi công việc '" + attachment.getTask().getTitle() + "'");
    }

    private AttachmentDTO convertToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileUrl(attachment.getFileUrl());
        dto.setCreatedAt(attachment.getCreatedAt());
        if (attachment.getUploadedBy() != null) {
            dto.setUploadedByUsername(attachment.getUploadedBy().getUsername());
            dto.setUploadedByFullName(attachment.getUploadedBy().getFullName());
        }
        return dto;
    }
}
