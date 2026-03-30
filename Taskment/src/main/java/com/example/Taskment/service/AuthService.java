package com.example.Taskment.service;

import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Đăng ký tài khoản và MÃ HÓA mật khẩu bằng BCrypt
     */
    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Lỗi: Tên đăng nhập này đã có người sử dụng!");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Lỗi: Email này đã được đăng ký!");
        }
        
        // MÃ HÓA MẬT KHẨU
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        return userRepository.save(user);
    }
}