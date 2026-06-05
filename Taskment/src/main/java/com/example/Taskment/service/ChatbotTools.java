package com.example.Taskment.service;

import com.example.Taskment.dto.TaskResponseDTO;
import com.example.Taskment.dto.TaskRequestDTO;
import org.springframework.stereotype.Component;
import com.example.Taskment.entity.User;

import java.util.List;
import java.util.function.Function;

@Component
public class ChatbotTools {

    private final TaskService taskService;
    private final UserService userService; // Cần để lấy userId từ username

    public ChatbotTools(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    // Định nghĩa hàm mà AI có thể gọi để lấy danh sách Task của người dùng
    // Tên hàm trong Spring AI sẽ là get_my_tasks
    public Function<ChatbotTools.MyTasksRequest, List<TaskResponseDTO>> getMyTasks() {
        return request -> {
            // Logic để lấy Task của người dùng
            return taskService.getMyTasks(request.username());
        };
    }

    // Định nghĩa hàm mà AI có thể gọi để tạo Task
    // Tên hàm trong Spring AI sẽ là create_task
    public Function<ChatbotTools.CreateTaskRequest, String> createTask() {
        return request -> {
            // Logic để tạo Task
            TaskRequestDTO newTaskRequest = new TaskRequestDTO();
            newTaskRequest.setTitle(request.title());
            newTaskRequest.setDescription(request.description());
            newTaskRequest.setProjectId(1L); // Mặc định dự án 1
            newTaskRequest.setStatusId(1L); // Mặc định TO DO
            newTaskRequest.setPriorityId(2L); // Mặc định MEDIUM
            
            // Lấy ID của người dùng từ username để gán assignee
            User user = userService.findByUsername(request.username());
            newTaskRequest.setAssigneeId(user.getId());
            
            taskService.createTask(newTaskRequest, request.username());
            return "Đã tạo công việc '" + request.title() + "' thành công.";
        };
    }

    // DTO cho request của hàm getMyTasks
    public record MyTasksRequest(String username) {}

    // DTO cho request của hàm createTask
    public record CreateTaskRequest(String title, String description, String username) {}
}
