package com.example.Taskment.service;

import com.example.Taskment.dto.TaskWatcherDTO;
import com.example.Taskment.entity.Task;
import com.example.Taskment.entity.TaskWatcher;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.TaskRepository;
import com.example.Taskment.repository.TaskWatcherRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskWatcherService {

    private final TaskWatcherRepository taskWatcherRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskWatcherService(TaskWatcherRepository taskWatcherRepository, TaskRepository taskRepository, UserRepository userRepository) {
        this.taskWatcherRepository = taskWatcherRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskWatcherDTO> getWatchersByTaskId(Long taskId) {
        return taskWatcherRepository.findByTaskId(taskId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskWatcherDTO addWatcher(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (taskWatcherRepository.existsByTaskIdAndUserId(taskId, userId)) {
            throw new RuntimeException("User is already watching this task.");
        }

        TaskWatcher watcher = new TaskWatcher();
        watcher.setTask(task);
        watcher.setUser(user);

        TaskWatcher savedWatcher = taskWatcherRepository.save(watcher);
        return convertToDTO(savedWatcher);
    }

    @Transactional
    public void removeWatcher(Long taskId, Long userId) {
        TaskWatcher watcher = taskWatcherRepository.findByTaskIdAndUserId(taskId, userId)
                .orElseThrow(() -> new RuntimeException("Watcher not found for task " + taskId + " and user " + userId));
        taskWatcherRepository.delete(watcher);
    }

    private TaskWatcherDTO convertToDTO(TaskWatcher watcher) {
        TaskWatcherDTO dto = new TaskWatcherDTO();
        dto.setId(watcher.getId());
        dto.setUserId(watcher.getUser().getId());
        dto.setUsername(watcher.getUser().getUsername());
        dto.setFullName(watcher.getUser().getFullName());
        dto.setCreatedAt(watcher.getCreatedAt());
        return dto;
    }
}
