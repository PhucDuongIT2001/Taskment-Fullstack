package com.example.Taskment.security;

import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.Task;
import com.example.Taskment.repository.ProjectRepository;
import com.example.Taskment.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("projectSecurity")
public class ProjectSecurityService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    public boolean isProjectLeader(Authentication authentication, Long projectId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        // ADMIN always passes
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return true;
        }

        // Check if user is STAFF_LEADER and actually the leader of the project
        boolean isStaffLeader = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF_LEADER"));
                
        if (!isStaffLeader) {
            return false;
        }

        String username = authentication.getName();
        Project project = projectRepository.findById(projectId).orElse(null);
        
        if (project == null || project.getLeader() == null) {
            return false;
        }
        
        return project.getLeader().getUsername().equals(username);
    }

    public boolean canManageProject(Authentication authentication, Long projectId) {
        return isProjectLeader(authentication, projectId);
    }

    public boolean canCreateTaskInProject(Authentication authentication, Long projectId) {
        return isProjectLeader(authentication, projectId);
    }
    public boolean canManageTask(Authentication authentication, Long taskId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return true;
        }

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null || task.getProject() == null) {
            return false;
        }

        return isProjectLeader(authentication, task.getProject().getId());
    }
}
