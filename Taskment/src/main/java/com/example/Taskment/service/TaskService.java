package com.example.Taskment.service;

import com.example.Taskment.dto.CustomerRequestDTO;
import com.example.Taskment.dto.TaskRequestDTO;
import com.example.Taskment.dto.TaskResponseDTO;
import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set; // THÊM MỚI
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final PriorityRepository priorityRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final IssueTypeRepository issueTypeRepository;
    private final NotificationService notificationService;
    private final TaskWatcherRepository taskWatcherRepository;
    private final ActivityLogService activityLogService;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, TaskStatusRepository taskStatusRepository, PriorityRepository priorityRepository, UserRepository userRepository, SprintRepository sprintRepository, IssueTypeRepository issueTypeRepository, NotificationService notificationService, TaskWatcherRepository taskWatcherRepository, ActivityLogService activityLogService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.priorityRepository = priorityRepository;
        this.userRepository = userRepository;
        this.sprintRepository = sprintRepository;
        this.issueTypeRepository = issueTypeRepository;
        this.notificationService = notificationService;
        this.taskWatcherRepository = taskWatcherRepository;
        this.activityLogService = activityLogService;
    }

    public List<TaskResponseDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskResponseDTO> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskResponseDTO> getMyTasks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        List<Task> tasks = taskRepository.findByAssigneeId(user.getId());
        return tasks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TaskResponseDTO> getTasksByReporter(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        List<Task> tasks = taskRepository.findByReporterId(user.getId());
        return tasks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public TaskResponseDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc"));
        return mapToDTO(task);
    }

    @Transactional
    public TaskResponseDTO createTask(TaskRequestDTO request, String creatorUsername) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new RuntimeException("Người tạo không tồn tại"));
        
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Dự án không tồn tại"));
        
        TaskStatus status;
        if (request.getStatusId() != null) {
            status = taskStatusRepository.findById(request.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Trạng thái không tồn tại"));
        } else {
            status = taskStatusRepository.findByNameIgnoreCase("To Do")
                    .or(() -> taskStatusRepository.findByNameIgnoreCase("TO DO"))
                    .orElseGet(() -> taskStatusRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy bất kỳ trạng thái nào trong hệ thống")));
        }
        
        Priority priority;
        if (request.getPriorityId() != null) {
            priority = priorityRepository.findById(request.getPriorityId())
                    .orElseThrow(() -> new RuntimeException("Mức độ ưu tiên không tồn tại"));
        } else {
            priority = priorityRepository.findByNameIgnoreCase("Medium")
                    .or(() -> priorityRepository.findByNameIgnoreCase("MEDIUM"))
                    .orElseGet(() -> priorityRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy bất kỳ mức độ ưu tiên nào trong hệ thống")));
        }
        
        User assignee;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Người được giao không tồn tại"));
        } else {
            assignee = creator;
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStoryPoints(request.getStoryPoints());
        
        task.setProject(project);
        task.setStatus(status);
        task.setPriority(priority);
        task.setAssignee(assignee);
        task.setReporter(creator);
        task.setDueDate(request.getDueDate());
        
        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
            task.setSprint(sprint);
        }
        
        IssueType issueType = null;
        if (request.getIssueTypeId() != null) {
            issueType = issueTypeRepository.findById(request.getIssueTypeId())
                    .orElseThrow(() -> new RuntimeException("IssueType not found"));
        } else {
            issueType = issueTypeRepository.findByNameIgnoreCase("Task")
                    .or(() -> issueTypeRepository.findByNameIgnoreCase("TASK"))
                    .orElseGet(() -> issueTypeRepository.findAll().stream().findFirst().orElse(null));
        }
        if (issueType != null) {
            task.setIssueType(issueType);
        }
        
        if (request.getParentId() != null) {
            Task parentTask = taskRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent task not found"));
            task.setParentTask(parentTask);
        }
        
        Task savedTask = taskRepository.save(task);

        if (!assignee.equals(creator)) {
            String message = String.format("%s đã giao cho bạn một công việc mới: %s", creator.getFullName(), savedTask.getTitle());
            notificationService.sendDetailedNotification(assignee, message, "/task/" + savedTask.getId(), "TASK_ASSIGNED", savedTask.getId());
        }
        sendNotificationToWatchers(savedTask, creator, "đã tạo công việc mới", "/task/" + savedTask.getId());
        
        activityLogService.logActivity("SUCCESS", creator.getUsername() + " vừa tạo công việc mới: '" + savedTask.getTitle() + "'");
        
        return mapToDTO(savedTask);
    }

    @Transactional
    public TaskResponseDTO createCustomerRequest(CustomerRequestDTO requestDTO, String creatorUsername) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new RuntimeException("Người tạo không tồn tại"));
        
        Project defaultProject = projectRepository.findById(1L)
                .or(() -> projectRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new RuntimeException("Lỗi: Hệ thống chưa có dự án nào để tiếp nhận yêu cầu."));
                
        TaskStatus defaultStatus = taskStatusRepository.findByNameIgnoreCase("To Do")
                .or(() -> taskStatusRepository.findByNameIgnoreCase("TO DO"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạng thái mặc định 'To Do'"));
                
        Priority defaultPriority = priorityRepository.findByNameIgnoreCase("Medium")
                .or(() -> priorityRepository.findByNameIgnoreCase("MEDIUM"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy độ ưu tiên mặc định 'Medium'"));
                
        IssueType defaultIssueType = issueTypeRepository.findByNameIgnoreCase("Task")
                .or(() -> issueTypeRepository.findByNameIgnoreCase("TASK"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại công việc mặc định 'Task'"));

        Task task = new Task();
        task.setTitle(requestDTO.getTitle());
        task.setDescription(requestDTO.getDescription());
        task.setStoryPoints(0);
        
        task.setProject(defaultProject);
        task.setStatus(defaultStatus);
        task.setPriority(defaultPriority);
        task.setAssignee(creator);
        task.setReporter(creator);
        task.setIssueType(defaultIssueType);
        
        Task savedTask = taskRepository.save(task);
        
        activityLogService.logActivity("INFO", creator.getUsername() + " vừa tạo yêu cầu khách hàng: '" + savedTask.getTitle() + "'");
        
        return mapToDTO(savedTask);
    }

    @Transactional
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc để cập nhật"));

        User oldAssignee = task.getAssignee();
        TaskStatus oldStatus = task.getStatus();
        
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStoryPoints() != null) task.setStoryPoints(request.getStoryPoints());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId()).orElseThrow();
            task.setProject(project);
        }
        if (request.getStatusId() != null) {
            TaskStatus status = taskStatusRepository.findById(request.getStatusId()).orElseThrow();
            task.setStatus(status);
        }
        if (request.getPriorityId() != null) {
            Priority priority = priorityRepository.findById(request.getPriorityId()).orElseThrow();
            task.setPriority(priority);
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElseThrow();
            task.setAssignee(assignee);
            if (!assignee.equals(oldAssignee)) {
                String message = String.format("Bạn vừa được gán vào công việc: %s", task.getTitle());
                notificationService.sendDetailedNotification(assignee, message, "/task/" + task.getId(), "TASK_ASSIGNED", task.getId());
            }
        }
        
        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId()).orElseThrow();
            task.setSprint(sprint);
        }
        
        if (request.getIssueTypeId() != null) {
            IssueType issueType = issueTypeRepository.findById(request.getIssueTypeId()).orElseThrow();
            task.setIssueType(issueType);
        }
        
        if (request.getParentId() != null) {
            Task parentTask = taskRepository.findById(request.getParentId()).orElseThrow();
            task.setParentTask(parentTask);
        }

        Task updatedTask = taskRepository.save(task);

        if (request.getStatusId() != null && !updatedTask.getStatus().equals(oldStatus)) {
            String message = String.format("Trạng thái công việc '%s' đã thay đổi từ '%s' sang '%s'",
                                           updatedTask.getTitle(), oldStatus.getName(), updatedTask.getStatus().getName());
            sendNotificationToWatchers(updatedTask, updatedTask.getAssignee(), message, "/task/" + updatedTask.getId());
        }
        sendNotificationToWatchers(updatedTask, updatedTask.getAssignee(), "đã cập nhật công việc", "/task/" + updatedTask.getId());

        activityLogService.logActivity("INFO", "Công việc '" + updatedTask.getTitle() + "' vừa được cập nhật.");

        return mapToDTO(updatedTask);
    }
    
    @Transactional
    public TaskResponseDTO updateTaskStatus(Long taskId, Long newStatusId, String updaterUsername) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc"));
        
        TaskStatus oldStatus = task.getStatus();
        TaskStatus newStatus = taskStatusRepository.findById(newStatusId)
                .orElseThrow(() -> new RuntimeException("Trạng thái mới không tồn tại"));

        if (oldStatus.equals(newStatus)) {
            return mapToDTO(task);
        }

        task.setStatus(newStatus);
        Task savedTask = taskRepository.save(task);

        User updater = userRepository.findByUsername(updaterUsername).orElseThrow();
        String message = String.format("%s đã cập nhật trạng thái công việc '%s' từ '%s' thành '%s'", 
                                       updater.getFullName(), 
                                       savedTask.getTitle(), 
                                       oldStatus.getName(), 
                                       newStatus.getName());

        if (!savedTask.getReporter().equals(updater)) {
            notificationService.sendNotification(savedTask.getReporter(), message, "/task/" + savedTask.getId());
        }
        if (!savedTask.getAssignee().equals(updater) && !savedTask.getAssignee().equals(savedTask.getReporter())) {
            notificationService.sendNotification(savedTask.getAssignee(), message, "/task/" + savedTask.getId());
        }
        sendNotificationToWatchers(savedTask, updater, "đã thay đổi trạng thái công việc", "/task/" + savedTask.getId());

        activityLogService.logActivity("SUCCESS", updater.getUsername() + " đã chuyển trạng thái task '" + savedTask.getTitle() + "' thành " + newStatus.getName());

        return mapToDTO(savedTask);
    }
    
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task != null) {
            String title = task.getTitle();
            taskRepository.deleteById(id);
            activityLogService.logActivity("WARNING", "Công việc '" + title + "' đã bị xóa khỏi hệ thống.");
        }
    }

    private void sendNotificationToWatchers(Task task, User initiator, String action, String link) {
        taskWatcherRepository.findByTaskId(task.getId()).stream()
            .map(TaskWatcher::getUser)
            .filter(watcher -> !watcher.equals(initiator)) // Không gửi thông báo cho người thực hiện hành động
            .forEach(watcher -> {
                String message = String.format("%s %s: %s", initiator.getFullName(), action, task.getTitle());
                notificationService.sendNotification(watcher, message, link);
            });
    }

    private TaskResponseDTO mapToDTO(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStoryPoints(task.getStoryPoints());
        dto.setCreatedAt(task.getCreatedAt());

        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
            dto.setProjectName(task.getProject().getName());
        }

        if (task.getStatus() != null) {
            dto.setStatusId(task.getStatus().getId());
            dto.setStatusName(task.getStatus().getName());
        }

        if (task.getPriority() != null) {
            dto.setPriorityId(task.getPriority().getId());
            dto.setPriorityName(task.getPriority().getName());
        }

        if (task.getAssignee() != null) {
            dto.setAssigneeId(task.getAssignee().getId());
            dto.setAssigneeName(task.getAssignee().getUsername());
        }

        if (task.getReporter() != null) {
            dto.setReporterId(task.getReporter().getId());
            dto.setReporterName(task.getReporter().getUsername());
        }
        
        if (task.getSprint() != null) {
            dto.setSprintId(task.getSprint().getId());
            dto.setSprintName(task.getSprint().getName());
        }
        
        if (task.getIssueType() != null) {
            dto.setIssueTypeId(task.getIssueType().getId());
            dto.setIssueTypeName(task.getIssueType().getName());
        }
        
        if (task.getParentTask() != null) {
            dto.setParentId(task.getParentTask().getId());
        }

        if (task.getDueDate() != null) {
            dto.setDueDate(task.getDueDate());
            
            // Tính toán remainingHours và overdue
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (task.getDueDate().isBefore(now)) {
                dto.setOverdue(true);
                dto.setRemainingHours(0L);
            } else {
                dto.setOverdue(false);
                dto.setRemainingHours(java.time.Duration.between(now, task.getDueDate()).toHours());
            }
        }

        return dto;
    }
}
