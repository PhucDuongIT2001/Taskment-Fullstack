package com.example.Taskment.controller;

import com.example.Taskment.dto.SprintRequestDTO;
import com.example.Taskment.entity.Sprint;
import com.example.Taskment.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    // API Lấy tất cả Sprint (Dùng cho dropdown trong TaskForm)
    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        return ResponseEntity.ok(sprintService.getAllSprints());
    }

    // API Lấy Sprint theo Project ID (Dùng cho các chức năng nâng cao sau này)
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProjectId(projectId));
    }

    // API Tạo mới một Sprint
    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody SprintRequestDTO sprintRequestDTO) {
        Sprint createdSprint = sprintService.createSprint(sprintRequestDTO);
        return new ResponseEntity<>(createdSprint, HttpStatus.CREATED);
    }
}
