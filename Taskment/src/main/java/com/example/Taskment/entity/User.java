package com.example.Taskment.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false) // THÊM MỚI: Trường enabled
    private boolean enabled = false; // Mặc định là false (chưa xác thực)

    // --- THÊM MỚI CHO TÍNH NĂNG QUÊN MẬT KHẨU ---
    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;
    // --- KẾT THÚC THÊM MỚI ---
    
    // --- THÊM MỚI CHO TÍNH NĂNG 2FA ---
    @Column(name = "two_factor_otp")
    private String twoFactorOtp;

    @Column(name = "two_factor_otp_expiry")
    private LocalDateTime twoFactorOtpExpiry;
    // --- KẾT THÚC THÊM MỚI ---

    // --- CÁC MỐI QUAN HỆ ---

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Quan hệ 1-1 với HumanInfo (Profile)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private HumanInfo humanInfo;

    public User() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- GETTER AND SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public HumanInfo getHumanInfo() { return humanInfo; }
    public void setHumanInfo(HumanInfo humanInfo) { this.humanInfo = humanInfo; }

    // --- GETTER AND SETTER CHO CÁC TRƯỜNG MỚI ---
    public boolean isEnabled() { return enabled; } // Getter cho enabled
    public void setEnabled(boolean enabled) { this.enabled = enabled; } // Setter cho enabled

    public String getResetPasswordToken() { return resetPasswordToken; }
    public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }

    public LocalDateTime getResetPasswordTokenExpiry() { return resetPasswordTokenExpiry; }
    public void setResetPasswordTokenExpiry(LocalDateTime resetPasswordTokenExpiry) { this.resetPasswordTokenExpiry = resetPasswordTokenExpiry; }

    public String getTwoFactorOtp() { return twoFactorOtp; }
    public void setTwoFactorOtp(String twoFactorOtp) { this.twoFactorOtp = twoFactorOtp; }

    public LocalDateTime getTwoFactorOtpExpiry() { return twoFactorOtpExpiry; }
    public void setTwoFactorOtpExpiry(LocalDateTime twoFactorOtpExpiry) { this.twoFactorOtpExpiry = twoFactorOtpExpiry; }
}
