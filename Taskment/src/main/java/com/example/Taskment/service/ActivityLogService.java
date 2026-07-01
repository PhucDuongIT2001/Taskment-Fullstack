package com.example.Taskment.service;

import com.example.Taskment.entity.ActivityLog;
import com.example.Taskment.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * Ghi log hoạt động chung (không liên kết task cụ thể)
     */
    public void logActivity(String type, String message) {
        ActivityLog log = new ActivityLog(type, message);
        activityLogRepository.save(log);
    }

    /**
     * Ghi log hoạt động liên kết với một task cụ thể
     */
    public void logActivityForTask(String type, String message, Long taskId, Long userId) {
        ActivityLog log = new ActivityLog(type, message, taskId, userId);
        activityLogRepository.save(log);
    }

    /**
     * Lấy 50 hoạt động gần nhất (dùng cho admin dashboard)
     */
    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    /**
     * Lấy toàn bộ hoạt động của một task cụ thể
     */
    public List<ActivityLog> getActivitiesByTaskId(Long taskId) {
        return activityLogRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }
}
