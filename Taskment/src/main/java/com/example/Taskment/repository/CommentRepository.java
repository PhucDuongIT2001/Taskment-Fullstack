package com.example.Taskment.repository;

import com.example.Taskment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Lấy tất cả bình luận của một Task cụ thể
    List<Comment> findByTaskId(Long taskId);
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
}