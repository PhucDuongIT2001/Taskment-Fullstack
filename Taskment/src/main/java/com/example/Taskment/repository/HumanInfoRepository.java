package com.example.Taskment.repository;

import com.example.Taskment.entity.HumanInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HumanInfoRepository extends JpaRepository<HumanInfo, Long> {

    // Spring Data JPA sẽ tự động tạo câu lệnh query để tìm HumanInfo bằng user_id
    Optional<HumanInfo> findByUserId(Long userId);
}
