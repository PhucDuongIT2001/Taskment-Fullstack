package com.example.Taskment.repository;

import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.ProjectMember;
import com.example.Taskment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectAndUser(Project project, User user);
    
    List<ProjectMember> findByUser(User user);
}
