package com.example.Taskment.service;

import com.example.Taskment.dto.AttachmentDTO;
import com.example.Taskment.entity.Attachment;
import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.AttachmentRepository;
import com.example.Taskment.repository.ProjectMemberRepository;
import com.example.Taskment.repository.TaskRepository;
import com.example.Taskment.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AttachmentService — Quản lý file đính kèm.
 *
 * === ĐÃ THAY ĐỔI (AWS Well-Architected — Reliability Pillar) ===
 *
 * TRƯỚC (vấn đề cũ):
 *   - File được lưu vào thư mục /uploads/ trên local disk của container ECS
 *   - Container ECS Fargate là ephemeral → khi container restart/redeploy, toàn bộ file MẤT
 *   - Không thể scale ngang (2 container không chia sẻ disk)
 *
 * SAU (giải pháp mới):
 *   - File được upload lên Amazon S3 (độ bền 99.999999999%)
 *   - File KHÔNG BAO GIỜ mất khi container restart hoặc scale
 *   - Truy cập file qua S3 Presigned URL (tạm thời, có hạn 15 phút)
 *   - Presigned URL bảo mật hơn: file không public, không ai đoán được URL
 *
 * === LUỒNG HOẠT ĐỘNG ===
 *   Upload: Client → Backend → S3 (PUT)
 *   Download: Client → Backend (lấy presigned URL) → Client → S3 (GET trực tiếp)
 */
@Service
public class AttachmentService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentService.class);

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final ProjectMemberRepository projectMemberRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    // S3 bucket name — được inject từ biến môi trường (application-prod.yaml)
    @Value("${aws.s3.bucket-name:taskment-attachments-local}")
    private String bucketName;

    // Thời gian hiệu lực của Presigned URL (15 phút)
    private static final Duration PRESIGNED_URL_DURATION = Duration.ofMinutes(15);

    // Giới hạn dung lượng: 20MB
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

    // Các loại file được phép upload
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
            "png", "jpg", "jpeg", "gif", "webp"
    );

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp"
    );

    public AttachmentService(AttachmentRepository attachmentRepository,
                             TaskRepository taskRepository,
                             UserRepository userRepository,
                             ActivityLogService activityLogService,
                             ProjectMemberRepository projectMemberRepository,
                             S3Client s3Client,
                             S3Presigner s3Presigner) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
        this.projectMemberRepository = projectMemberRepository;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    /**
     * Upload file đính kèm lên Amazon S3.
     * Key S3 có cấu trúc: attachments/{taskId}/{uuid}_{originalFileName}
     * Nhờ prefix taskId, dễ quản lý và xóa file theo task.
     */
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
            throw new RuntimeException("Loại file không được phép. Chỉ chấp nhận tài liệu (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX) và hình ảnh (PNG, JPG, JPEG, GIF, WEBP)");
        }

        // Kiểm tra content type (lớp bảo vệ thứ 2 chống file giả mạo)
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Content type không hợp lệ: " + contentType);
        }

        // Tạo S3 key duy nhất: attachments/{taskId}/{uuid}_{originalFileName}
        String s3Key = "attachments/" + taskId + "/" + UUID.randomUUID() + "_" + originalFileName;

        try {
            // Upload file lên S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .contentLength(file.getSize())
                    // Server-side encryption (SSE-S3) — dữ liệu được mã hóa at-rest
                    .serverSideEncryption(software.amazon.awssdk.services.s3.model.ServerSideEncryption.AES256)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File '{}' uploaded to S3 bucket '{}' with key '{}'", originalFileName, bucketName, s3Key);

            // Lưu metadata vào database (không lưu URL mà lưu S3 key)
            // LÝ DO: Presigned URL thay đổi theo thời gian, chỉ lưu key là đủ
            Attachment attachment = new Attachment();
            attachment.setFileName(originalFileName);
            attachment.setFileUrl(s3Key);      // Lưu S3 key thay vì URL
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

            // Tạo presigned URL cho response (15 phút)
            return convertToDTOWithPresignedUrl(savedAttachment);

        } catch (IOException ex) {
            log.error("Failed to upload file '{}' to S3: {}", originalFileName, ex.getMessage());
            throw new RuntimeException("Không thể tải file lên. Vui lòng thử lại!", ex);
        }
    }

    public List<AttachmentDTO> getAttachmentsByTaskId(Long taskId) {
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::convertToDTOWithPresignedUrl)
                .collect(Collectors.toList());
    }

    /**
     * Xóa file đính kèm: xóa trên S3 trước, rồi mới xóa record trong DB.
     */
    public void deleteAttachment(Long attachmentId, String username) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài liệu đính kèm"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra phân quyền xóa
        validateDeletePermission(attachment, user);

        // Xóa file trên S3
        try {
            String s3Key = attachment.getFileUrl(); // FileUrl giờ lưu S3 key
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("File deleted from S3 bucket '{}', key '{}'", bucketName, s3Key);
        } catch (Exception ex) {
            // Log lỗi nhưng không dừng — vẫn xóa record trong DB
            log.error("Could not delete file from S3: {}. Continuing to delete DB record.", ex.getMessage());
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
     * Tạo S3 Presigned URL có hạn 15 phút.
     * Presigned URL cho phép client download file trực tiếp từ S3
     * mà không cần đi qua backend — giảm tải server, tăng tốc độ.
     */
    private String generatePresignedUrl(String s3Key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(PRESIGNED_URL_DURATION)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for key '{}': {}", s3Key, e.getMessage());
            return null;
        }
    }

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

        var memberOpt = projectMemberRepository.findByProjectIdAndUserId(projectId, user.getId());
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("Bạn không phải thành viên của dự án này");
        }

        String memberRole = memberOpt.get().getRoleInProject();
        boolean isLeader = "LEADER".equalsIgnoreCase(memberRole) || "PROJECT_LEADER".equalsIgnoreCase(memberRole);
        if (isLeader) return;

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

    /**
     * Convert Attachment entity sang DTO, tạo presigned URL cho fileUrl.
     */
    private AttachmentDTO convertToDTOWithPresignedUrl(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        // Tạo presigned URL thay vì trả về S3 key trực tiếp
        dto.setFileUrl(generatePresignedUrl(attachment.getFileUrl()));
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
