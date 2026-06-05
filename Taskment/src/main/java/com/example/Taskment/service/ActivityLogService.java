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

    public void logActivity(String type, String message) {
        ActivityLog log = new ActivityLog(type, message);
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
