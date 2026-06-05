package com.example.Taskment.service;

import com.example.Taskment.dto.CommentDTO;
import com.example.Taskment.entity.Comment;
import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.CommentRepository;
import com.example.Taskment.repository.TaskRepository;
import com.example.Taskment.repository.TaskWatcherRepository; // THÊM MỚI
import com.example.Taskment.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TaskWatcherRepository taskWatcherRepository; // THÊM MỚI

    public CommentService(CommentRepository commentRepository, TaskRepository taskRepository, UserRepository userRepository, NotificationService notificationService, TaskWatcherRepository taskWatcherRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.taskWatcherRepository = taskWatcherRepository; // THÊM MỚI
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByTaskId(Long taskId) {
        List<Comment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO createComment(Long taskId, String content, String username) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Task với ID: " + taskId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với username: " + username));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(content);

        Comment savedComment = commentRepository.save(comment);

        // Gửi thông báo cho người được giao việc (nếu không phải là người bình luận)
        if (task.getAssignee() != null && !task.getAssignee().equals(user)) {
            String message = String.format("%s đã bình luận về công việc '%s'", user.getFullName(), task.getTitle());
            notificationService.sendNotification(task.getAssignee(), message, "/task/" + taskId);
        }
        // Gửi thông báo cho người tạo việc (nếu không phải là người bình luận và cũng không phải người được giao)
        if (task.getReporter() != null && !task.getReporter().equals(user) && !task.getReporter().equals(task.getAssignee())) {
            String message = String.format("%s đã bình luận về công việc bạn đã tạo: '%s'", user.getFullName(), task.getTitle());
            notificationService.sendNotification(task.getReporter(), message, "/task/" + taskId);
        }
        // Gửi thông báo cho tất cả Watcher (trừ người bình luận, người được gán, người báo cáo nếu đã nhận thông báo)
        sendNotificationToWatchers(task, user, "đã bình luận về công việc", "/task/" + taskId);

        return convertToDTO(savedComment);
    }

    private void sendNotificationToWatchers(Task task, User initiator, String action, String link) {
        taskWatcherRepository.findByTaskId(task.getId()).stream()
            .map(watcher -> watcher.getUser())
            .filter(watcherUser -> !watcherUser.equals(initiator) &&
                                   (task.getAssignee() == null || !watcherUser.equals(task.getAssignee())) &&
                                   (task.getReporter() == null || !watcherUser.equals(task.getReporter())))
            .forEach(watcherUser -> {
                String message = String.format("%s %s: %s", initiator.getFullName(), action, task.getTitle());
                notificationService.sendNotification(watcherUser, message, link);
            });
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        if (comment.getUser() != null) {
            dto.setUserId(comment.getUser().getId());
            dto.setUsername(comment.getUser().getUsername());
            dto.setUserFullName(comment.getUser().getFullName());
        }
        return dto;
    }
}
