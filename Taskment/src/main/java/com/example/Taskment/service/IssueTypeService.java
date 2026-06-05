package com.example.Taskment.service;

import com.example.Taskment.entity.IssueType;
import com.example.Taskment.repository.IssueTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IssueTypeService {

    private final IssueTypeRepository issueTypeRepository;

    public IssueTypeService(IssueTypeRepository issueTypeRepository) {
        this.issueTypeRepository = issueTypeRepository;
    }

    public List<IssueType> getAllIssueTypes() {
        return issueTypeRepository.findAll();
    }
}
