package com.example.Taskment.security;

import com.example.Taskment.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                // CHÚ Ý: Bảng Role hiện tại lưu column `role` là "ROLE_ADMIN", 
                // nhưng ở đây lại gọi .getName() (có thể trả về null hoặc "admin").
                // Để chuẩn với Spring Security, chúng ta nên lấy trực tiếp giá trị của trường `role`.
                // Tránh tình trạng nối chuỗi thành "ROLE_ROLE_ADMIN" hoặc "ROLE_null".
                .map(role -> {
                    String roleName = role.getRole(); // Lấy giá trị thực tế như "ROLE_ADMIN"
                    // Đảm bảo không bị lặp chữ ROLE_
                    if (!roleName.startsWith("ROLE_")) {
                        roleName = "ROLE_" + roleName;
                    }
                    return new SimpleGrantedAuthority(roleName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
