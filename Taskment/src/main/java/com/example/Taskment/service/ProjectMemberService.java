package com.example.Taskment.service;

import com.example.Taskment.dto.ProjectMemberDTO;
import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.ProjectMember;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.ProjectMemberRepository;
import com.example.Taskment.repository.ProjectRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException; // THÊM MỚI
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ProjectMemberService(ProjectMemberRepository projectMemberRepository, ProjectRepository projectRepository, UserRepository userRepository, NotificationService notificationService) {
        this.projectMemberRepository = projectMemberRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDTO> getMembersByProjectId(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberDTO addMemberToProject(Long projectId, Long userId, String roleInProject, String currentUsername) { // THÊM currentUsername
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Kiểm tra quyền: Chỉ Admin hoặc Leader của dự án mới được thêm thành viên
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Người dùng hiện tại không tồn tại."));
        if (!project.getLeader().equals(currentUser) && !currentUser.getRoles().stream().anyMatch(r -> r.getRole().equals("ROLE_ADMIN"))) {
            throw new AccessDeniedException("Bạn không có quyền thêm thành viên vào dự án này.");
        }

        if (projectMemberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("User is already a member of this project.");
        }

        ProjectMember newMember = new ProjectMember();
        newMember.setProject(project);
        newMember.setUser(user);
        newMember.setRoleInProject(roleInProject);

        ProjectMember savedMember = projectMemberRepository.save(newMember);

        // Gửi thông báo cho người được thêm vào dự án
        if (!user.equals(currentUser)) {
            String message = String.format("%s đã thêm bạn vào dự án: %s", currentUser.getFullName(), project.getName());
            notificationService.sendDetailedNotification(user, message, "/project/" + project.getId(), "PROJECT_ASSIGNED", null);
        }

        return convertToDTO(savedMember);
    }

    @Transactional
    public void removeMemberFromProject(Long projectId, Long userId, String currentUsername) { // THÊM currentUsername
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Kiểm tra quyền: Chỉ Admin hoặc Leader của dự án mới được xóa thành viên
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Người dùng hiện tại không tồn tại."));
        if (!project.getLeader().equals(currentUser) && !currentUser.getRoles().stream().anyMatch(r -> r.getRole().equals("ROLE_ADMIN"))) {
            throw new AccessDeniedException("Bạn không có quyền xóa thành viên khỏi dự án này.");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Project member not found"));
        projectMemberRepository.delete(member);
    }

    private ProjectMemberDTO convertToDTO(ProjectMember member) {
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setFullName(member.getUser().getFullName());
        dto.setRole(member.getRoleInProject());
        return dto;
    }
}
