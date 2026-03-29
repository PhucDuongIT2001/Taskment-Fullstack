package com.example.Taskment.controller;

import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.ProjectRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Lấy toàn bộ danh sách dự án
    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    //  GET ONE: Xem chi tiết 1 dự án theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    //  POST: Tạo dự án mới gắn với một User cụ thể
    @PostMapping("/{ownerId}")
    public Project createProject(@PathVariable Long ownerId, @RequestBody Project project) {
        // Tìm User (chủ sở hữu) từ database
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + ownerId));

        // Gán chủ sở hữu cho dự án
        project.setOwner(owner);

        // Lưu dự án vào database
        return projectRepository.save(project);
    }
    // PUT: Sửa thông tin dự án (Tên, Mô tả, Trạng thái)
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        return projectRepository.findById(id).map(project -> {
            project.setName(projectDetails.getName());
            project.setDescription(projectDetails.getDescription());
            project.setStatus(projectDetails.getStatus());
            Project updatedProject = projectRepository.save(project);
            return ResponseEntity.ok(updatedProject);
        }).orElse(ResponseEntity.notFound().build());
    }
    // DELETE: Xóa dự án
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        return projectRepository.findById(id).map(project -> {
            projectRepository.delete(project);
            return ResponseEntity.ok().body("Đã xóa dự án thành công!");
        }).orElse(ResponseEntity.notFound().build());
    }
    // SEARCH: Tìm kiếm dự án theo tên (Tận dụng Repository bạn vừa viết)
    @GetMapping("/search")
    public List<Project> searchProjects(@RequestParam String name) {
        return projectRepository.findByNameContainingIgnoreCase(name);
    }
}