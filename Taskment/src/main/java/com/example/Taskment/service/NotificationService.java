package com.example.Taskment.service;

import com.example.Taskment.dto.NotificationDTO;
import com.example.Taskment.entity.Notification;
import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.NotificationRepository;
import com.example.Taskment.repository.TaskWatcherRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final TaskWatcherRepository taskWatcherRepository;
    private final EmailService emailService;

    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepository, TaskWatcherRepository taskWatcherRepository, EmailService emailService) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
        this.taskWatcherRepository = taskWatcherRepository;
        this.emailService = emailService;
    }

    public void sendNotification(User recipient, String message, String link) {
        sendDetailedNotification(recipient, message, link, "SYSTEM", null);
    }
    
    public void sendDetailedNotification(User recipient, String message, String link, String type, Long taskId) {
        // 1. Tạo và lưu thông báo vào DB
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setRead(false);
        notification.setType(type);
        notification.setTaskId(taskId);
        Notification saved = notificationRepository.save(notification);

        // 2. Chuyển sang DTO
        NotificationDTO dto = mapToDTO(saved);

        // 3. Gửi thông báo qua WebSocket đến kênh riêng của người dùng
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                dto
        );

        // 4. Gửi Email thông báo (chạy ngầm)
        if (type != null && (type.equals("TASK_ASSIGNED") || type.equals("PROJECT_ASSIGNED") ||
                             type.equals("OVERDUE") || type.startsWith("DEADLINE_"))) {
            if (recipient.getEmail() != null && !recipient.getEmail().isEmpty()) {
                emailService.sendNotificationEmail(recipient.getEmail(), recipient.getFullName(), type, message, link);
            }
        }
    }

    public void sendNotificationToTaskWatchers(Task task, String message, String link, User sender) {
        Set<User> watchers = taskWatcherRepository.findByTaskId(task.getId()).stream()
                                .map(watcher -> watcher.getUser())
                                .collect(Collectors.toSet());
        
        watchers.forEach(watcher -> {
            if (!watcher.equals(sender)) {
                sendDetailedNotification(watcher, message, link, "TASK_UPDATE", task.getId());
            }
        });
    }
    
    public NotificationDTO mapToDTO(Notification notif) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notif.getId());
        dto.setMessage(notif.getMessage());
        dto.setLink(notif.getLink());
        dto.setRead(notif.isRead());
        dto.setCreatedAt(notif.getCreatedAt());
        dto.setType(notif.getType());
        dto.setTaskId(notif.getTaskId());
        if (notif.getRecipient() != null) {
            dto.setRecipientId(notif.getRecipient().getId());
        }
        return dto;
    }
}
