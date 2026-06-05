package com.example.Taskment.repository;

import com.example.Taskment.entity.TaskWatcher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskWatcherRepository extends JpaRepository<TaskWatcher, Long> {
    List<TaskWatcher> findByTaskId(Long taskId);
    Optional<TaskWatcher> findByTaskIdAndUserId(Long taskId, Long userId);
    boolean existsByTaskIdAndUserId(Long taskId, Long userId);
}
