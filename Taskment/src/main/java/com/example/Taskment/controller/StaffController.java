package com.example.Taskment.controller;

import com.example.Taskment.dto.StaffResponseDTO;
import com.example.Taskment.service.StaffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }


    // Lấy danh sách toàn bộ nhân viên (Staff)
    @GetMapping
    public ResponseEntity<List<StaffResponseDTO>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    // Lấy chi tiết một nhân viên cụ thể theo ID
    @GetMapping("/{id}")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }
}
