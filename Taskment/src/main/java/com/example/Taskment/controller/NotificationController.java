package com.example.Taskment.controller;

import com.example.Taskment.dto.NotificationDTO;
import com.example.Taskment.service.NotificationService;
import com.example.Taskment.entity.Notification;
import com.example.Taskment.repository.NotificationRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository, NotificationService notificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Authentication authentication) {
        Long userId = userRepository.findByUsername(authentication.getName()).orElseThrow().getId();
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        
        List<NotificationDTO> dtos = notifications.stream()
                .map(notificationService::mapToDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/mark-as-read")
    @Transactional
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = userRepository.findByUsername(authentication.getName()).orElseThrow().getId();
        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndIsReadFalse(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
        return ResponseEntity.ok().build();
    }
}
