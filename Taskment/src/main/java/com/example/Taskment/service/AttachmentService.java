package com.example.Taskment.service;

import com.example.Taskment.dto.AttachmentDTO;
import com.example.Taskment.entity.Attachment;
import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.AttachmentRepository;
import com.example.Taskment.repository.ProjectMemberRepository;
import com.example.Taskment.repository.TaskRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final ProjectMemberRepository projectMemberRepository;

    // Giới hạn dung lượng: 20MB
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

    // Các loại file được phép upload
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"
    );

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Thư mục lưu trữ file
    private final String UPLOAD_DIR = "uploads";

    public AttachmentService(AttachmentRepository attachmentRepository,
                             TaskRepository taskRepository,
                             UserRepository userRepository,
                             ActivityLogService activityLogService,
                             ProjectMemberRepository projectMemberRepository) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
        this.projectMemberRepository = projectMemberRepository;

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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc với ID: " + taskId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra phân quyền upload
        validateUploadPermission(task, user);

        // Kiểm tra file không rỗng
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        // Kiểm tra dung lượng file (tối đa 20MB)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Dung lượng file vượt quá giới hạn 20MB. File hiện tại: "
                    + String.format("%.2f", file.getSize() / (1024.0 * 1024.0)) + "MB");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Kiểm tra extension file
        String extension = getFileExtension(originalFileName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("Loại file không được phép. Chỉ chấp nhận: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX");
        }

        // Kiểm tra content type (lớp bảo vệ thứ 2)
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Content type không hợp lệ: " + contentType);
        }

        // Tạo tên file duy nhất để tránh trùng lặp
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        try {
            Path targetLocation = Paths.get(UPLOAD_DIR).resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // URL tương đối để truy cập file qua Nginx
            String fileDownloadUri = "/uploads/" + uniqueFileName;

            Attachment attachment = new Attachment();
            attachment.setFileName(originalFileName);
            attachment.setFileUrl(fileDownloadUri);
            attachment.setFileSize(file.getSize());
            attachment.setFileType(contentType != null ? contentType : "application/octet-stream");
            attachment.setTask(task);
            attachment.setUploadedBy(user);

            Attachment savedAttachment = attachmentRepository.save(attachment);

            activityLogService.logActivityForTask(
                    "INFO",
                    user.getUsername() + " đã tải lên tài liệu '" + originalFileName + "' cho công việc '" + task.getTitle() + "'",
                    taskId,
                    user.getId()
            );

            return convertToDTO(savedAttachment);
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu file " + originalFileName + ". Vui lòng thử lại!", ex);
        }
    }

    public List<AttachmentDTO> getAttachmentsByTaskId(Long taskId) {
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteAttachment(Long attachmentId, String username) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài liệu đính kèm"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra phân quyền xóa
        validateDeletePermission(attachment, user);

        // Xóa file vật lý trong thư mục
        try {
            String fileUrl = attachment.getFileUrl();
            String uniqueFileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(UPLOAD_DIR).resolve(uniqueFileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            System.err.println("Không thể xóa file vật lý: " + ex.getMessage());
        }

        Long taskId = attachment.getTask() != null ? attachment.getTask().getId() : null;
        String taskTitle = attachment.getTask() != null ? attachment.getTask().getTitle() : "N/A";

        attachmentRepository.delete(attachment);

        activityLogService.logActivityForTask(
                "WARNING",
                user.getUsername() + " đã xóa tài liệu '" + attachment.getFileName() + "' khỏi công việc '" + taskTitle + "'",
                taskId,
                user.getId()
        );
    }

    // ===================== PRIVATE HELPERS =====================

    /**
     * Kiểm tra quyền upload:
     * - Admin: toàn quyền
     * - Project Leader: upload file cho bất kỳ task nào trong project
     * - Member: chỉ upload file cho task được giao cho mình
     */
    private void validateUploadPermission(Task task, User user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getRole().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        // Cho phép Khách hàng upload lên yêu cầu của chính họ
        boolean isCustomer = user.getRoles().stream()
                .anyMatch(r -> r.getRole().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            if (task.getReporter() != null && task.getReporter().getId().equals(user.getId())) {
                return;
            }
            throw new RuntimeException("Bạn chỉ có quyền tải tài liệu lên yêu cầu của chính mình");
        }

        Long projectId = task.getProject() != null ? task.getProject().getId() : null;
        if (projectId == null) {
            throw new RuntimeException("Task không thuộc dự án nào, không thể xác định quyền");
        }

        // Lấy role trong project
        var memberOpt = projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId());
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("Bạn không phải thành viên của dự án này");
        }

        String memberRole = memberOpt.get().getRoleInProject();
        boolean isLeader = "LEADER".equalsIgnoreCase(memberRole) || "PROJECT_LEADER".equalsIgnoreCase(memberRole);
        if (isLeader) return;

        // Member: chỉ upload nếu task được giao cho mình
        if (task.getAssignee() == null || !task.getAssignee().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn chỉ có thể tải tài liệu lên các công việc được giao cho bạn");
        }
    }

    /**
     * Kiểm tra quyền xóa:
     * - Admin: xóa tất cả
     * - Project Leader: xóa tất cả trong project
     * - Member: chỉ xóa file của chính mình
     */
    private void validateDeletePermission(Attachment attachment, User user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getRole().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        // Khách hàng chỉ được xóa file do chính họ tải lên
        boolean isCustomer = user.getRoles().stream()
                .anyMatch(r -> r.getRole().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            if (attachment.getUploadedBy() != null && attachment.getUploadedBy().getId().equals(user.getId())) {
                return;
            }
            throw new RuntimeException("Bạn không có quyền xóa tài liệu này");
        }

        Long projectId = attachment.getTask() != null && attachment.getTask().getProject() != null
                ? attachment.getTask().getProject().getId() : null;

        if (projectId != null) {
            var memberOpt = projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId());
            if (memberOpt.isPresent()) {
                String memberRole = memberOpt.get().getRoleInProject();
                boolean isLeader = "LEADER".equalsIgnoreCase(memberRole) || "PROJECT_LEADER".equalsIgnoreCase(memberRole);
                if (isLeader) return;
            }
        }

        // Member hoặc uploader: chỉ xóa file của chính mình
        if (attachment.getUploadedBy() == null || !attachment.getUploadedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa tài liệu này");
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    private AttachmentDTO convertToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileUrl(attachment.getFileUrl());
        dto.setFileSize(attachment.getFileSize());
        dto.setFileType(attachment.getFileType());
        dto.setCreatedAt(attachment.getCreatedAt());
        if (attachment.getUploadedBy() != null) {
            dto.setUploadedByUsername(attachment.getUploadedBy().getUsername());
            dto.setUploadedByFullName(attachment.getUploadedBy().getFullName());
        }
        return dto;
    }
}
