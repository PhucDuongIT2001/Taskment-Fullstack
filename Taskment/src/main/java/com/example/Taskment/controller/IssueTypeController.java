package com.example.Taskment.controller;

import com.example.Taskment.entity.IssueType;
import com.example.Taskment.service.IssueTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/issueTypes")
public class IssueTypeController {

    private final IssueTypeService issueTypeService;

    public IssueTypeController(IssueTypeService issueTypeService) {
        this.issueTypeService = issueTypeService;
    }

    @GetMapping
    public ResponseEntity<List<IssueType>> getAllIssueTypes() {
        return ResponseEntity.ok(issueTypeService.getAllIssueTypes());
    }
}
