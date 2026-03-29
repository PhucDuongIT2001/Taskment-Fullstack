package com.example.Taskment.controller;

import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskStatusRepository taskStatusRepository;

    @Autowired
    private PriorityRepository priorityRepository;

    // 1. Lấy danh sách tất cả Task
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping("/project/{projectId}/reporter/{reporterId}/assignee/{assigneeId}/status/{statusId}/priority/{priorityId}")
    public Task createTask(
            @PathVariable Long projectId,
            @PathVariable Long reporterId,
            @PathVariable Long assigneeId,
            @PathVariable Long statusId,
            @PathVariable Long priorityId,
            @RequestBody Task task) {

        // 1. Tìm các thực thể cơ bản
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Project ID: " + projectId));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User (Reporter) ID: " + reporterId));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User (Assignee) ID: " + assigneeId));

        // 2. Tìm Status và Priority (Mảnh ghép mới giúp hết lỗi 404)
        TaskStatus status = taskStatusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Status ID: " + statusId));

        Priority priority = priorityRepository.findById(priorityId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Priority ID: " + priorityId));

        // 3. Gán tất cả vào Task
        task.setProject(project);
        task.setReporter(reporter);
        task.setAssignee(assignee);
        task.setStatus(status);
        task.setPriority(priority);

        // 4. Lưu vào Database
        return taskRepository.save(task);
    }
    // 3. READ ONE: Xem chi tiết 1 Task
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE: Cập nhật thông tin Task
    // PUT http://localhost:8080/api/tasks/1
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        return taskRepository.findById(id).map(task -> {
            // Cập nhật các thông tin cơ bản
            if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
            if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
            if (taskDetails.getDueDate() != null) task.setDueDate(taskDetails.getDueDate());

            // Lưu ý: Nếu muốn đổi Project/Assignee thì nên làm API riêng hoặc check null kỹ ở đây

            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. UPDATE STATUS: API riêng để đổi trạng thái (Rất hay dùng)
    // PATCH http://localhost:8080/api/tasks/1/status/3
    @PatchMapping("/{taskId}/status/{statusId}")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId, @PathVariable Long statusId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không thấy Task"));
        TaskStatus status = taskStatusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Không thấy Status"));

        task.setStatus(status);
        taskRepository.save(task);
        return ResponseEntity.ok("Đã chuyển trạng thái Task sang: " + status.getName());
    }

    // 6. DELETE: Xóa Task
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        return taskRepository.findById(id).map(task -> {
            taskRepository.delete(task);
            return ResponseEntity.ok().body("Đã xóa Task thành công!");
        }).orElse(ResponseEntity.notFound().build());
    }
    }
