package com.example.Taskment.controller;

import com.example.Taskment.dto.ChatRequestDTO;
import com.example.Taskment.dto.ChatResponseDTO;
import com.example.Taskment.entity.AiConversation;
import com.example.Taskment.entity.AiMessage;
import com.example.Taskment.service.AiConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiConversationService aiConversationService;

    public ChatController(AiConversationService aiConversationService) {
        this.aiConversationService = aiConversationService;
    }

    @PostMapping
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO requestDTO, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            String username = authentication.getName();
            ChatResponseDTO response = aiConversationService.sendMessage(username, requestDTO.getConversationId(), requestDTO.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(503).body(new ChatResponseDTO("AI service temporarily unavailable. Please try again."));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AiConversation>> getConversations(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        return ResponseEntity.ok(aiConversationService.getUserConversations(username));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<AiMessage>> getMessages(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        return ResponseEntity.ok(aiConversationService.getConversationMessages(id, username));
    }
}
