package com.example.Taskment.controller;

import com.example.Taskment.dto.CommentDTO;
import com.example.Taskment.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getCommentsForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTaskId(taskId));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long taskId,
                                                 @RequestBody Map<String, String> payload,
                                                 Authentication authentication) {
        String content = payload.get("content");
        String username = authentication.getName();
        CommentDTO createdComment = commentService.createComment(taskId, content, username);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }
}
