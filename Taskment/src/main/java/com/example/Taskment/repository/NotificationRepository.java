package com.example.Taskment.repository;

import com.example.Taskment.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    
    // Thêm phương thức này để lấy danh sách các thông báo chưa đọc
    List<Notification> findByRecipientIdAndIsReadFalse(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);
    
    boolean existsByRecipientIdAndTaskIdAndType(Long recipientId, Long taskId, String type);
}
