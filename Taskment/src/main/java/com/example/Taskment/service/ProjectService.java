package com.example.Taskment.service;

import com.example.Taskment.dto.ProjectRequestDTO;
import com.example.Taskment.dto.ProjectResponseDTO;
import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.ProjectMember; // THÊM MỚI
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.ProjectMemberRepository; // THÊM MỚI
import com.example.Taskment.repository.ProjectRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set; // THÊM MỚI
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, ProjectMemberRepository projectMemberRepository, ActivityLogService activityLogService, NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }

    public List<ProjectResponseDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // THÊM MỚI: Lấy danh sách dự án mà người dùng là chủ sở hữu HOẶC là thành viên có phân trang
    public com.example.Taskment.dto.PaginatedResponseDTO<ProjectResponseDTO> getMyProjectsPaginated(String username, int pageNo, int pageSize, String sortBy, String sortDir) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));
        
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase(org.springframework.data.domain.Sort.Direction.ASC.name()) ? org.springframework.data.domain.Sort.by(sortBy).ascending()
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(pageNo, pageSize, sort);
        org.springframework.data.domain.Page<Project> projects = projectRepository.findRelatedProjectsWithPagination(user, pageable);
        
        List<ProjectResponseDTO> content = projects.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new com.example.Taskment.dto.PaginatedResponseDTO<>(content, projects.getNumber(), projects.getSize(), projects.getTotalElements(), projects.getTotalPages(), projects.isLast());
    }

    // Giữ lại getMyProjects cũ để không phá vỡ code hiện tại
    public List<ProjectResponseDTO> getMyProjects(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại."));
        
        // Lấy các dự án mà user là leader
        Set<Project> ownedProjects = projectRepository.findByLeader(user);
        
        // Lấy các dự án mà user là thành viên
        Set<Project> memberProjects = projectMemberRepository.findByUser(user).stream()
                                        .map(ProjectMember::getProject)
                                        .collect(Collectors.toSet());
        
        // Gộp 2 danh sách lại và loại bỏ trùng lặp
        Set<Project> allRelevantProjects = new java.util.HashSet<>(ownedProjects);
        allRelevantProjects.addAll(memberProjects);
        
        return allRelevantProjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProjectResponseDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + id));
        return convertToDTO(project);
    }

    @Transactional
    public ProjectResponseDTO createProject(ProjectRequestDTO requestDTO) {
        User leader = userRepository.findById(requestDTO.getLeaderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng quản lý với ID: " + requestDTO.getLeaderId()));
        
        Project project = new Project();
        project.setName(requestDTO.getName());
        project.setDescription(requestDTO.getDescription());
        project.setStatus(requestDTO.getStatus());
        project.setLeader(leader);
        project.setDueDate(requestDTO.getDueDate());
        
        Project savedProject = projectRepository.save(project);
        
        activityLogService.logActivity("SUCCESS", "Dự án mới '" + savedProject.getName() + "' vừa được tạo.");
        
        // Notify the assigned leader
        try {
            String message = "Bạn được chỉ định làm Trưởng dự án (Leader) cho dự án mới '" + savedProject.getName() + "'.";
            String link = "/projects";
            notificationService.sendDetailedNotification(leader, message, link, "PROJECT_ASSIGNED", null);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        
        return convertToDTO(savedProject);
    }

    @Transactional
    public ProjectResponseDTO updateProject(Long id, ProjectRequestDTO projectDetails, String currentUsername) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + id));
        
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Người dùng hiện tại không tồn tại."));
        
        if (!project.getLeader().equals(currentUser) && !currentUser.getRoles().stream().anyMatch(r -> r.getRole().equals("ROLE_ADMIN"))) {
            throw new AccessDeniedException("Bạn không có quyền chỉnh sửa dự án này.");
        }

        if (projectDetails.getName() != null) {
            project.setName(projectDetails.getName());
        }
        if (projectDetails.getDescription() != null) {
            project.setDescription(projectDetails.getDescription());
        }
        if (projectDetails.getStatus() != null) {
            project.setStatus(projectDetails.getStatus());
        }
        if (projectDetails.getLeaderId() != null) {
            User newLeader = userRepository.findById(projectDetails.getLeaderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng quản lý mới với ID: " + projectDetails.getLeaderId()));
            
            if (project.getLeader() == null || !project.getLeader().equals(newLeader)) {
                project.setLeader(newLeader);
                try {
                    String message = "Bạn vừa được bàn giao làm Trưởng dự án (Leader) cho dự án '" + project.getName() + "'.";
                    String link = "/projects";
                    notificationService.sendDetailedNotification(newLeader, message, link, "PROJECT_ASSIGNED", null);
                } catch (Exception e) {
                    System.err.println("Failed to send notification: " + e.getMessage());
                }
            }
        }
        if (projectDetails.getDueDate() != null) {
            project.setDueDate(projectDetails.getDueDate());
        }

        Project updatedProject = projectRepository.save(project);
        
        activityLogService.logActivity("INFO", "Dự án '" + updatedProject.getName() + "' vừa được cập nhật.");
        
        return convertToDTO(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id, String currentUsername) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + id));

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Người dùng hiện tại không tồn tại."));

        if (!project.getLeader().equals(currentUser) && !currentUser.getRoles().stream().anyMatch(r -> r.getRole().equals("ROLE_ADMIN"))) {
            throw new AccessDeniedException("Bạn không có quyền xóa dự án này.");
        }

        String projectName = project.getName();
        projectRepository.deleteById(id);
        
        activityLogService.logActivity("WARNING", "Dự án '" + projectName + "' đã bị xóa khỏi hệ thống.");
    }

    private ProjectResponseDTO convertToDTO(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setCreateAt(project.getCreateAt());
        dto.setDueDate(project.getDueDate());
        if (project.getLeader() != null) {
            dto.setLeaderUsername(project.getLeader().getUsername());
            dto.setLeaderId(project.getLeader().getId());
        }
        return dto;
    }
}
