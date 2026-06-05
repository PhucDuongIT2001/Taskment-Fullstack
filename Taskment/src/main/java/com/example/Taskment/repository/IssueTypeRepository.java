package com.example.Taskment.repository;

import com.example.Taskment.entity.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IssueTypeRepository extends JpaRepository<IssueType, Long> {
    Optional<IssueType> findByName(String name);
    Optional<IssueType> findByNameIgnoreCase(String name);
}
