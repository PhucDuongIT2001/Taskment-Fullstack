package com.example.Taskment.repository;

import com.example.Taskment.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PriorityRepository extends JpaRepository<Priority, Long> {
    Optional<Priority> findByName(String name);
    Optional<Priority> findByNameIgnoreCase(String name);
}