package com.example.Taskment.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig — Cấu hình Web MVC.
 *
 * LÝ DO THAY ĐỔI (AWS Well-Architected — Reliability Pillar):
 * Trước đây: serve file đính kèm từ thư mục /uploads/ trên local disk của container.
 * Vấn đề: Container ECS Fargate là ephemeral (không có persistent storage).
 *         Mỗi khi container restart/redeploy, toàn bộ file trong /uploads/ sẽ bị mất.
 *
 * Giải pháp: File đính kèm giờ được upload lên Amazon S3 (xem AttachmentService.java).
 * - S3 có độ bền 11 nine (99.999999999%) — không bao giờ mất file
 * - File được truy cập qua Presigned URL từ S3, không qua server
 * - Giảm tải cho backend container
 *
 * Resource handler /uploads/** đã được xóa vì không còn cần thiết.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Resource handler /uploads/** đã được xóa.
    // File đính kèm hiện được lưu trên Amazon S3 và truy cập qua Presigned URL.
    // Xem: AttachmentService.java -> uploadAttachment() và generatePresignedUrl()
}
