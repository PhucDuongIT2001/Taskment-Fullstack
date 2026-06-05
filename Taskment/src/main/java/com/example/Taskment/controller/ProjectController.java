package com.example.Taskment.controller;

import com.example.Taskment.dto.ProjectRequestDTO;
import com.example.Taskment.dto.ProjectResponseDTO;
import com.example.Taskment.dto.TaskResponseDTO;
import com.example.Taskment.service.ProjectService;
import com.example.Taskment.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.Taskment.service.ExcelReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;
    private final ExcelReportService excelReportService; // MỚI THÊM

    public ProjectController(ProjectService projectService, TaskService taskService, ExcelReportService excelReportService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.excelReportService = excelReportService;
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<Resource> exportProjectTasksToExcel(@PathVariable Long id) {
        ProjectResponseDTO project = projectService.getProjectById(id);
        List<TaskResponseDTO> tasks = taskService.getTasksByProjectId(id);

        ByteArrayInputStream in = excelReportService.generateProjectReport(project, tasks);
        InputStreamResource file = new InputStreamResource(in);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bao_cao_du_an_" + id + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF_LEADER', 'STAFF_MEMBER')")
    public ResponseEntity<List<ProjectResponseDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/my") // API MỚI
    public ResponseEntity<?> getMyProjects(
            Authentication authentication,
            @RequestParam(value = "page", defaultValue = "0", required = false) int pageNo,
            @RequestParam(value = "size", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir,
            @RequestParam(value = "paged", defaultValue = "false", required = false) boolean paged) {
        
        if (paged) {
            return ResponseEntity.ok(projectService.getMyProjectsPaginated(authentication.getName(), pageNo, pageSize, sortBy, sortDir));
        }
        return ResponseEntity.ok(projectService.getMyProjects(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@RequestBody ProjectRequestDTO requestDTO) {
        ProjectResponseDTO createdProject = projectService.createProject(requestDTO);
        return new ResponseEntity<>(createdProject, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.isProjectLeader(authentication, #id)")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectRequestDTO projectDetails, Authentication authentication) {
        ProjectResponseDTO updatedProject = projectService.updateProject(id, projectDetails, authentication.getName());
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("@projectSecurity.isProjectLeader(authentication, #id)")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication authentication) {
        projectService.deleteProject(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
