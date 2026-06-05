package com.example.Taskment.repository;

import com.example.Taskment.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssigneeId(Long assigneeId);

    // Lấy danh sách task do một User cụ thể tạo ra (reporter)
    List<Task> findByReporterId(Long reporterId);

    List<Task> findBySprintId(Long sprintId);

    List<Task> findByParentTaskId(Long parentId);
    
    List<Task> findByIssueTypeId(Long issueTypeId);
}
