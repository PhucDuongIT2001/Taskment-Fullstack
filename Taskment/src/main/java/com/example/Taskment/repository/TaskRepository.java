package com.example.Taskment.repository;

import com.example.Taskment.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Lấy danh sách task của một Project
    List<Task> findByProjectId(Long projectId);

    // Lấy danh sách task được giao cho một User cụ thể (assignee)
    List<Task> findByAssigneeId(Long userId);
}

