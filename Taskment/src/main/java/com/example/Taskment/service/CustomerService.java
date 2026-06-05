package com.example.Taskment.service;

import com.example.Taskment.dto.CustomerResponseDTO;
import com.example.Taskment.entity.Role;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import com.example.Taskment.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public CustomerService(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }


    public List<CustomerResponseDTO> getAllCustomers() {
        // Tìm tất cả User có Role là ROLE_CUSTOMER
        List<User> customers = userRepository.findByRoles_Role("ROLE_CUSTOMER");
        
        return customers.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CustomerResponseDTO getCustomerById(Long id) {
        User customer = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khách hàng ID: " + id));
        return mapToDTO(customer);
    }

    private CustomerResponseDTO mapToDTO(User user) {
        CustomerResponseDTO dto = new CustomerResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRoles(user.getRoles().stream().map(Role::getRole).collect(Collectors.toSet()));
        
        // Đếm số task liên quan đến khách hàng (nếu có logic liên quan)
        // Hiện tại giả sử ta cũng đếm task được giao hoặc liên quan
        int count = taskRepository.findByAssigneeId(user.getId()).size();
        dto.setTaskCount(count);
        
        return dto;
    }
}
