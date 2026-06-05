package com.example.Taskment.controller;

import com.example.Taskment.entity.Priority;
import com.example.Taskment.repository.PriorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/priorities")
public class PriorityController {

    @Autowired
    private PriorityRepository priorityRepository;

    @GetMapping
    public List<Priority> getAllPriorities() {
        return priorityRepository.findAll();
    }
}
