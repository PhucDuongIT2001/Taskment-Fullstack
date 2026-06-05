package com.example.Taskment.controller;

import com.example.Taskment.dto.ProjectMemberDTO;
import com.example.Taskment.service.ProjectMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; // THÊM MỚI
import org.springframework.security.core.Authentication; // THÊM MỚI
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    public ProjectMemberController(ProjectMemberService projectMemberService) {
        this.projectMemberService = projectMemberService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectMemberDTO>> getProjectMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectMemberService.getMembersByProjectId(projectId));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.isProjectLeader(authentication, #projectId)")
    public ResponseEntity<?> addMember(@PathVariable Long projectId, @RequestBody Map<String, String> payload, Authentication authentication) { // THÊM Authentication
        Long userId = Long.parseLong(payload.get("userId"));
        String role = payload.get("role");
        ProjectMemberDTO newMember = projectMemberService.addMemberToProject(projectId, userId, role, authentication.getName()); // THÊM authentication.getName()
        return new ResponseEntity<>(newMember, HttpStatus.CREATED);
    }

    @DeleteMapping("/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.isProjectLeader(authentication, #projectId)")
    public ResponseEntity<?> removeMember(@PathVariable Long projectId, @PathVariable Long userId, Authentication authentication) { // THÊM Authentication
        projectMemberService.removeMemberFromProject(projectId, userId, authentication.getName()); // THÊM authentication.getName()
        return ResponseEntity.noContent().build();
    }
}
