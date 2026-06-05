package com.example.Taskment.repository;

import com.example.Taskment.entity.User;
import com.example.Taskment.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user); // THÊM PHƯƠNG THỨC NÀY
}
