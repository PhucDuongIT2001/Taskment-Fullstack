package com.example.Taskment.repository;

import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Tìm tất cả dự án do một User cụ thể sở hữu (owner)
    List<Project> findByOwner(User owner);

    // Tìm dự án theo tên (tìm kiếm gần đúng)
    List<Project> findByNameContainingIgnoreCase(String name);
}
