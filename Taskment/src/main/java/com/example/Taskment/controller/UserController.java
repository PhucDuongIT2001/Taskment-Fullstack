package com.example.Taskment.controller;


import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController // Đánh dấu đây là nơi tiếp nhận các yêu cầu HTTP từ Postman
@RequestMapping("/api/users") // Địa chỉ gốc của API này
public class UserController {

    @Autowired // Tự động kết nối với UserRepository để lấy dữ liệu
    private UserRepository userRepository;

    // API lấy tất cả người dùng: GET http://localhost:8080/api/users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. READ ONE: Lấy chi tiết 1 người dùng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API tạo một người dùng mới: POST http://localhost:8080/api/users
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }
    // 4. UPDATE: Sửa thông tin người dùng theo ID
    // PUT http://localhost:8080/api/users/1
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(userDetails.getFullName());
            user.setEmail(userDetails.getEmail());
            user.setAvatarUrl(userDetails.getAvatarUrl());
            // Cập nhật các trường khác nếu cần
            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. DELETE: Xóa người dùng theo ID
    // DELETE http://localhost:8080/api/users/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("Đã xóa người dùng thành công!");
        }
        return ResponseEntity.notFound().build();
    }
}