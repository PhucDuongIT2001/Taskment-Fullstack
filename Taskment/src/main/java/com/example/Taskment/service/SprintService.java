package com.example.Taskment.service;

import com.example.Taskment.dto.SprintRequestDTO;
import com.example.Taskment.entity.Project;
import com.example.Taskment.entity.Sprint;
import com.example.Taskment.repository.ProjectRepository;
import com.example.Taskment.repository.SprintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintService(SprintRepository sprintRepository, ProjectRepository projectRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public List<Sprint> getSprintsByProjectId(Long projectId) {
        return sprintRepository.findByProjectId(projectId);
    }

    public Sprint createSprint(SprintRequestDTO sprintRequestDTO) {
        Project project = projectRepository.findById(sprintRequestDTO.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + sprintRequestDTO.getProjectId()));

        Sprint sprint = new Sprint();
        sprint.setName(sprintRequestDTO.getName());
        sprint.setStatus(sprintRequestDTO.getStatus());
        sprint.setProject(project);

        return sprintRepository.save(sprint);
    }
}
