package com.example.Taskment.controller;

import com.example.Taskment.entity.User;
import com.example.Taskment.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // DANG KY
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Đẩy toàn bộ công việc kiểm tra và lưu DB sang cho AuthService
            User savedUser = authService.register(user);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            // Nếu AuthService ném lỗi (ví dụ: trùng username), bắt lấy và trả về mã 400
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DANG NHAP
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            // Gọi logic đăng nhập từ AuthService
            User user = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            // Phân loại lỗi để trả về mã 401 (Sai MK) hoặc 404 (Không thấy user)
            if (e.getMessage().contains("Sai mật khẩu")) {
                return ResponseEntity.status(401).body(e.getMessage());
            }
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

}
