/*
package com.example.Taskment.controller;

import com.example.Taskment.dto.ChatbotRequest;
import com.example.Taskment.dto.ChatbotResponse;
import com.example.Taskment.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/send")
    public ResponseEntity<ChatbotResponse> sendMessage(
            @Valid @RequestBody ChatbotRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        String reply = chatbotService.getReply(username, request.getMessage());
        return ResponseEntity.ok(new ChatbotResponse(reply));
    }
}
*/