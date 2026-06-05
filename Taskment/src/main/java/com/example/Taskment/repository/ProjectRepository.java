package com.example.Taskment.repository;

import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set; // THÊM MỚI

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Tìm tất cả dự án do một User cụ thể quản lý (leader)
    Set<Project> findByLeader(User leader);

    // Lấy danh sách dự án liên quan (leader hoặc member) có phân trang
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM Project p LEFT JOIN ProjectMember pm ON p = pm.project WHERE p.leader = :user OR pm.user = :user")
    org.springframework.data.domain.Page<Project> findRelatedProjectsWithPagination(@org.springframework.data.repository.query.Param("user") User user, org.springframework.data.domain.Pageable pageable);

    // Tìm dự án theo tên (tìm kiếm gần đúng)
    List<Project> findByNameContainingIgnoreCase(String name);
}
