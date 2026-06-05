package com.example.Taskment.controller;

import com.example.Taskment.dto.TaskWatcherDTO;
import com.example.Taskment.service.TaskWatcherService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/watchers")
public class TaskWatcherController {

    private final TaskWatcherService taskWatcherService;

    public TaskWatcherController(TaskWatcherService taskWatcherService) {
        this.taskWatcherService = taskWatcherService;
    }

    @GetMapping
    public ResponseEntity<List<TaskWatcherDTO>> getWatchers(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskWatcherService.getWatchersByTaskId(taskId));
    }

    @PostMapping
    public ResponseEntity<TaskWatcherDTO> addWatcher(@PathVariable Long taskId, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        TaskWatcherDTO newWatcher = taskWatcherService.addWatcher(taskId, userId);
        return new ResponseEntity<>(newWatcher, HttpStatus.CREATED);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeWatcher(@PathVariable Long taskId, @PathVariable Long userId) {
        taskWatcherService.removeWatcher(taskId, userId);
        return ResponseEntity.noContent().build();
    }
}
