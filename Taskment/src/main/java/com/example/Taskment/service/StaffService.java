package com.example.Taskment.service;

import com.example.Taskment.dto.StaffResponseDTO;
import com.example.Taskment.entity.Role;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import com.example.Taskment.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public StaffService(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }


    public List<StaffResponseDTO> getAllStaff() {
        // Tìm tất cả User có Role là ROLE_STAFF
        List<User> staffList = userRepository.findByRoles_Role("ROLE_STAFF");
        
        return staffList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StaffResponseDTO getStaffById(Long id) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Staff ID: " + id));
        return mapToDTO(staff);
    }

    private StaffResponseDTO mapToDTO(User user) {
        StaffResponseDTO dto = new StaffResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRoles(user.getRoles().stream().map(Role::getRole).collect(Collectors.toSet()));
        
        // Đếm số task đang thực hiện
        int count = taskRepository.findByAssigneeId(user.getId()).size();
        dto.setTaskCount(count);
        
        return dto;
    }
}
