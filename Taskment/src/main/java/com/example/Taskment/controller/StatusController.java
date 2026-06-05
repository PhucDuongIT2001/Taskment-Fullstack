package com.example.Taskment.controller;

import com.example.Taskment.entity.TaskStatus;
import com.example.Taskment.repository.TaskStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/statuses")
public class StatusController {

    @Autowired
    private TaskStatusRepository taskStatusRepository;

    @GetMapping
    public List<TaskStatus> getAllStatuses() {
        return taskStatusRepository.findAll();
    }
}
