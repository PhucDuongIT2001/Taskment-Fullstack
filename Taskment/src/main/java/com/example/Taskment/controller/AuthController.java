package com.example.Taskment.controller;

import com.example.Taskment.dto.*;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import com.example.Taskment.security.JwtTokenProvider;
import com.example.Taskment.service.AuthService;
import com.example.Taskment.service.OAuth2Service;
import jakarta.servlet.http.HttpServletRequest; // THÊM MỚI
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @Autowired
    private OAuth2Service oAuth2Service;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private com.example.Taskment.service.ActivityLogService activityLogService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpServletRequest) {
        String frontendUrl = httpServletRequest.getHeader("Origin");
        if (frontendUrl == null || frontendUrl.isEmpty()) {
            frontendUrl = "http://localhost:3000"; // Fallback khi không có Origin header
        }
        User savedUser = authService.register(request, frontendUrl);
        activityLogService.logActivity("INFO", "Tài khoản mới vừa được đăng ký: " + savedUser.getUsername());
        return ResponseEntity.ok(java.util.Map.of("message", "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Tìm User sau khi username/password đúng
            User user = userRepository.findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername()).orElseThrow();
            

            // Generate OTP và gửi email
            authService.generateAndSend2FAOtp(user);
            
            activityLogService.logActivity("INFO", "Tài khoản " + user.getUsername() + " nhập đúng mật khẩu, đang chờ xác thực 2FA.");

            // Trả về HTTP 202 Accepted báo hiệu cần 2FA
            return ResponseEntity.status(202).body(java.util.Map.of(
                "requires2FA", true,
                "username", user.getUsername(),
                "message", "Vui lòng nhập mã OTP đã gửi qua email."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Lỗi: Tài khoản hoặc Mật khẩu không chính xác hoặc chưa được kích hoạt!");
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String otp = payload.get("otp");
            
            User user = userRepository.findByUsernameOrEmail(username, username)
                    .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
                    
            if (user.getTwoFactorOtp() == null || !user.getTwoFactorOtp().equals(otp)) {
                return ResponseEntity.status(401).body("Lỗi: Mã OTP không chính xác.");
            }
            
            if (user.getTwoFactorOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.status(401).body("Lỗi: Mã OTP đã hết hạn.");
            }
            
            // Xóa OTP
            user.setTwoFactorOtp(null);
            user.setTwoFactorOtpExpiry(null);
            userRepository.save(user);
            
            // Cấp JWT
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            activityLogService.logActivity("INFO", "Tài khoản " + user.getUsername() + " đăng nhập thành công (Đã qua 2FA).");
            
            return ResponseEntity.ok(new JwtAuthResponse(jwt, user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @PostMapping("/resend-2fa")
    public ResponseEntity<?> resend2FA(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            User user = userRepository.findByUsernameOrEmail(username, username)
                    .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
            
            authService.generateAndSend2FAOtp(user);
            return ResponseEntity.ok(java.util.Map.of("message", "Mã OTP mới đã được gửi thành công."));
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            User user = oAuth2Service.processGoogleLogin(request.getCode());
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            return ResponseEntity.ok(new JwtAuthResponse(jwt, user));
        } catch (Exception e) {
            System.err.println("Google login failed error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body("Lỗi: Đăng nhập bằng Google thất bại! Chi tiết: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("Chưa đăng nhập");
        }
        
        String username = auth.getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(user);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String frontendUrl = request.getHeader("Origin");
            authService.forgotPassword(payload.get("email"), frontendUrl);
            return ResponseEntity.ok("Link đặt lại mật khẩu đã được gửi đến email của bạn (nếu email tồn tại trong hệ thống).");
        } catch (RuntimeException e) {
            return ResponseEntity.ok("Link đặt lại mật khẩu đã được gửi đến email của bạn (nếu email tồn tại trong hệ thống).");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam("token") String token, @RequestBody Map<String, String> payload) {
        try {
            authService.resetPassword(token, payload.get("newPassword"));
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok("Tài khoản đã được kích hoạt thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String frontendUrl = request.getHeader("Origin");
            authService.resendVerificationEmail(payload.get("email"), frontendUrl);
            return ResponseEntity.ok("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
