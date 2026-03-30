package com.example.Taskment.controller;

import com.example.Taskment.dto.JwtAuthResponse;
import com.example.Taskment.dto.LoginRequest;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import com.example.Taskment.security.JwtTokenProvider;
import com.example.Taskment.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthService authService;

    // DANG KY
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = authService.register(user);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DANG NHAP (JWT)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Xác thực với Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Nạp thông tin vào Context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Tạo Token
            String jwt = tokenProvider.generateToken(authentication);

            // Truy xuất User
            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

            return ResponseEntity.ok(new JwtAuthResponse(jwt, user));
        } catch (Exception e) {
            // Tạm in lỗi ra Console để học cách Spring quăng Exception
            System.err.println("Login Failed: " + e.getMessage());
            return ResponseEntity.status(401).body("Lỗi: Tài khoản hoặc Mật khẩu không chính xác!");
        }
    }

}
