package com.example.Taskment.repository;

import com.example.Taskment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm người dùng bằng username (Dùng cho đăng nhập)
    Optional<User> findByUsername(String username);

    // Tìm người dùng bằng email
    Optional<User> findByEmail(String email);

    // Tìm người dùng bằng username hoặc email
    Optional<User> findByUsernameOrEmail(String username, String email);

    // Kiểm tra xem email đã tồn tại chưa
    Boolean existsByEmail(String email);

    // Kiểm tra xem username đã tồn tại chưa
    Boolean existsByUsername(String username);

    // Tìm danh sách theo Vai trò (Quan hệ Many-to-Many)
    java.util.List<User> findByRoles_Role(String roleName);

    // THÊM MỚI: Tìm người dùng bằng resetPasswordToken
    Optional<User> findByResetPasswordToken(String resetPasswordToken);
}
