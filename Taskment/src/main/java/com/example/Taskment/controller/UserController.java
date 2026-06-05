package com.example.Taskment.controller;

import com.example.Taskment.dto.ChangePasswordDto;
import com.example.Taskment.dto.HumanInfoDTO;
import com.example.Taskment.dto.ProjectResponseDTO; // THÊM MỚI
import com.example.Taskment.dto.UserUpdateRequestDTO;
import com.example.Taskment.entity.User;
import com.example.Taskment.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<HumanInfoDTO> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/{userId}/profile")
    @org.springframework.security.access.prepost.PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<HumanInfoDTO> updateUserProfile(@PathVariable Long userId, @RequestBody HumanInfoDTO dto) {
        return ResponseEntity.ok(userService.updateProfile(userId, dto));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequestDTO requestDTO) {
        User updatedUser = userService.updateUser(id, requestDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/{userId}/change-password")
    @org.springframework.security.access.prepost.PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<String> changePassword(@PathVariable Long userId, @RequestBody ChangePasswordDto changePasswordDto) {
        userService.changePassword(userId, changePasswordDto);
        return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // THÊM MỚI: Lấy danh sách dự án mà user là thành viên
    @GetMapping("/{userId}/projects")
    public ResponseEntity<List<ProjectResponseDTO>> getUserProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProjects(userId));
    }

    // THÊM MỚI: Upload avatar cho người dùng
    @PostMapping("/{userId}/avatar")
    @org.springframework.security.access.prepost.PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<String> uploadAvatar(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        String avatarUrl = userService.uploadAvatar(userId, file);
        return ResponseEntity.ok(avatarUrl);
    }
}
