/*
package com.example.Taskment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    private final ChatClient chatClient;
    private final TaskService taskService;
    private final ObjectMapper objectMapper;

    public ChatbotService(@Qualifier("geminiChatClient") ChatClient chatClient,
                          TaskService taskService,
                          ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.taskService = taskService;
        this.objectMapper = objectMapper;
    }

    public String getReply(String username, String userMessage) {
        try {
            PromptTemplate promptTemplate = new PromptTemplate(""
                    Bạn là trợ lý AI thông minh tích hợp trong ứng dụng Taskment.
                    Người dùng hiện tại: {username}.
                    
                    Nhiệm vụ:
                    - Hỗ trợ người dùng quản lý công việc (tasks), lịch trình và dự án.
                    - Trả lời bằng tiếng Việt, phong cách chuyên nghiệp, ngắn gọn.
                    - Sử dụng công cụ 'get_my_tasks' nếu người dùng muốn xem danh sách việc cần làm.
                    
                    Câu hỏi: {message}
                    "");

            Prompt prompt = promptTemplate.create(Map.of(
                    "username", username,
                    "message", userMessage
            ));

            ChatResponse chatResponse = chatClient.prompt(prompt)
                    // Tên các hàm này phải khớp với @Bean bạn định nghĩa trong ChatbotTools
                    .function("get_my_tasks")
                    .function("create_task")
                    .call()
                    .chatResponse();

            if (chatResponse != null && chatResponse.getResult() != null) {
                return chatResponse.getResult().getOutput().getContent();
            }

            return "Gemini hiện không có phản hồi. Bạn thử lại nhé!";

        } catch (Exception e) {
            logger.error("Lỗi Gemini API cho user {}: ", username, e);

            if (e.getMessage().contains("exhausted") || e.getMessage().contains("429")) {
                return "Hệ thống AI đang tạm thời hết hạn mức (Quota). Vui lòng đợi 1-2 phút rồi thử lại nhé!";
            }
            return "Đã xảy ra lỗi kết nối với trợ lý AI. Vui lòng thử lại sau.";
        }
    }
}
*/