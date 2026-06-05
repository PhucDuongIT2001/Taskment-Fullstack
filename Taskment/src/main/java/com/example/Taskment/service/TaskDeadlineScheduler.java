package com.example.Taskment.service;

import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.TaskStatus;
import com.example.Taskment.repository.NotificationRepository;
import com.example.Taskment.repository.TaskRepository;
import com.example.Taskment.repository.TaskStatusRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
public class TaskDeadlineScheduler {

    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    public TaskDeadlineScheduler(TaskRepository taskRepository, TaskStatusRepository taskStatusRepository, NotificationService notificationService, NotificationRepository notificationRepository) {
        this.taskRepository = taskRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    @Scheduled(fixedRate = 60000) // Chạy mỗi phút (60,000ms)
    @Transactional
    public void checkAndMarkOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        
        TaskStatus doneStatus = taskStatusRepository.findByName("DONE").orElse(null);
        TaskStatus overdueStatus = taskStatusRepository.findByName("OVERDUE").orElse(null);
        
        if (doneStatus == null || overdueStatus == null) return;
        
        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            if (task.getDueDate() == null || task.getStatus().equals(doneStatus)) continue;
            
            LocalDateTime deadline = task.getDueDate();
            
            if (deadline.isBefore(now)) {
                // Task quá hạn
                if (!task.getStatus().equals(overdueStatus)) {
                    task.setStatus(overdueStatus);
                    taskRepository.save(task);
                    
                    if (task.getAssignee() != null) {
                        String type = "OVERDUE";
                        if (!notificationRepository.existsByRecipientIdAndTaskIdAndType(task.getAssignee().getId(), task.getId(), type)) {
                            String msg = String.format("CẢNH BÁO: Công việc '%s' đã quá hạn!", task.getTitle());
                            notificationService.sendDetailedNotification(task.getAssignee(), msg, "/task/" + task.getId(), type, task.getId());
                        }
                    }
                }
            } else {
                // Task sắp hết hạn
                long hoursRemaining = Duration.between(now, deadline).toHours();
                long minutesRemaining = Duration.between(now, deadline).toMinutes();
                
                String type = null;
                String msg = null;
                
                if (minutesRemaining <= 60 && minutesRemaining > 0) {
                    type = "DEADLINE_1H";
                    msg = String.format("GẤP: Công việc '%s' sẽ hết hạn trong vòng 1 giờ!", task.getTitle());
                } else if (hoursRemaining <= 12 && hoursRemaining > 1) {
                    type = "DEADLINE_12H";
                    msg = String.format("LƯU Ý: Công việc '%s' sẽ hết hạn trong 12 giờ tới.", task.getTitle());
                } else if (hoursRemaining <= 24 && hoursRemaining > 12) {
                    type = "DEADLINE_24H";
                    msg = String.format("NHẮC NHỞ: Công việc '%s' sẽ hết hạn trong 24 giờ tới.", task.getTitle());
                }
                
                if (type != null && task.getAssignee() != null) {
                    if (!notificationRepository.existsByRecipientIdAndTaskIdAndType(task.getAssignee().getId(), task.getId(), type)) {
                        notificationService.sendDetailedNotification(task.getAssignee(), msg, "/task/" + task.getId(), type, task.getId());
                    }
                }
            }
        }
    }
}
