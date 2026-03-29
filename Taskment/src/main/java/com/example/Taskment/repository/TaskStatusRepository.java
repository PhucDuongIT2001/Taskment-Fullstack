package com.example.Taskment.repository;

import com.example.Taskment.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {
    // Tìm trạng thái theo tên (ví dụ: tìm xem có trạng thái "DONE" chưa)
    Optional<TaskStatus> findByName(String name);
}