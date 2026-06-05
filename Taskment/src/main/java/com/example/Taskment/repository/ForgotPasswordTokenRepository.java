package com.example.Taskment.repository;

import com.example.Taskment.entity.ForgotPasswordToken;
import com.example.Taskment.entity.User; // THÊM MỚI
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForgotPasswordTokenRepository extends JpaRepository<ForgotPasswordToken, Long> {
    Optional<ForgotPasswordToken> findByToken(String token);
    Optional<ForgotPasswordToken> findByUser(User user); // THÊM PHƯƠNG THỨC NÀY
}
