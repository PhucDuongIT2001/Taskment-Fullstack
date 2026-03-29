package com.example.Taskment.controller;

import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired private CommentRepository commentRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;

    // 1. VIẾT BÌNH LUẬN: POST http://localhost:8080/api/comments/task/1/user/1
    @PostMapping("/task/{taskId}/user/{userId}")
    public Comment addComment(@PathVariable Long taskId, @PathVariable Long userId, @RequestBody Comment comment) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        comment.setTask(task);
        comment.setUser(user);
        return commentRepository.save(comment);
    }

    // 2. XEM BÌNH LUẬN CỦA 1 TASK: GET http://localhost:8080/api/comments/task/1
    @GetMapping("/task/{taskId}")
    public List<Comment> getCommentsByTask(@PathVariable Long taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    // 3. XÓA BÌNH LUẬN
    @DeleteMapping("/{id}")
    public String deleteComment(@PathVariable Long id) {
        commentRepository.deleteById(id);
        return "Đã xóa bình luận!";
    }
}