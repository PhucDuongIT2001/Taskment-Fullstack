package com.example.Taskment.repository;

import com.example.Taskment.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Tìm vai trò theo mã (ví dụ: "ROLE_CUSTOMER", "ROLE_ADMIN")
    Optional<Role> findByRole(String role);

    // Tìm vai trò theo tên hiển thị (ví dụ: "customer")
    Optional<Role> findByName(String name);
}
