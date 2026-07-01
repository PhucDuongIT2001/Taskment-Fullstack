package com.example.Taskment.controller;

import com.example.Taskment.dto.CustomerRequestDTO;
import com.example.Taskment.dto.TaskRequestDTO;
import com.example.Taskment.dto.TaskResponseDTO;
import com.example.Taskment.dto.UpdateTaskStatusRequest;
import com.example.Taskment.entity.ActivityLog;
import com.example.Taskment.service.ActivityLogService;
import com.example.Taskment.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final ActivityLogService activityLogService;

    public TaskController(TaskService taskService, ActivityLogService activityLogService) {
        this.taskService = taskService;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getMyTasks(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.getMyTasks(username));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<TaskResponseDTO>> getMyRequests(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.getTasksByReporter(username));
    }

    @GetMapping("/all")
    public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.canCreateTaskInProject(authentication, #request.projectId)")
    public ResponseEntity<TaskResponseDTO> createTask(@RequestBody TaskRequestDTO request, Authentication authentication) {
        String username = authentication.getName();
        return new ResponseEntity<>(taskService.createTask(request, username), HttpStatus.CREATED);
    }

    @PostMapping("/customer-request")
    public ResponseEntity<TaskResponseDTO> createCustomerRequest(
            @Valid @RequestBody CustomerRequestDTO requestDTO,
            Authentication authentication) {
        String username = authentication.getName();
        return new ResponseEntity<>(taskService.createCustomerRequest(requestDTO, username), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.canManageTask(authentication, #id)")
    public ResponseEntity<TaskResponseDTO> updateTask(@PathVariable Long id, @RequestBody TaskRequestDTO request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PutMapping("/{taskId}/status")
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.canManageTask(authentication, #taskId)")
    public ResponseEntity<TaskResponseDTO> updateTaskStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, request.getNewStatusId(), username));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.canManageTask(authentication, #id)")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy lịch sử hoạt động của một task cụ thể
     * GET /api/tasks/{taskId}/activities
     */
    @GetMapping("/{taskId}/activities")
    public ResponseEntity<List<ActivityLog>> getTaskActivities(@PathVariable Long taskId) {
        return ResponseEntity.ok(activityLogService.getActivitiesByTaskId(taskId));
    }
}
