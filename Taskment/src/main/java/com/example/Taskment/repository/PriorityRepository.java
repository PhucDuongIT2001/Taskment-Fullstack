package com.example.Taskment.repository;

import com.example.Taskment.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PriorityRepository extends JpaRepository<Priority, Long> {
    // Tìm mức độ ưu tiên theo tên
    Optional<Priority> findByName(String name);
}