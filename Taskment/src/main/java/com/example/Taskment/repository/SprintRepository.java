package com.example.Taskment.repository;

import com.example.Taskment.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    
    // Lấy danh sách các Sprint thuộc về một Project cụ thể
    List<Sprint> findByProjectId(Long projectId);
    
    // Lấy các Sprint theo trạng thái (ví dụ: "Active", "Closed")
    List<Sprint> findByStatus(String status);
}
