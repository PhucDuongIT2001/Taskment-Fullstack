package com.example.Taskment.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiChatService {

    @Value("${gemini.api.key:YOUR_GEMINI_API_KEY_HERE}")
    private String geminiApiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=";

    private final RestTemplate restTemplate;

    public GeminiChatService() {
        this.restTemplate = new RestTemplate();
    }

    @Retryable(value = {RestClientException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public String generateResponse(List<Map<String, String>> conversationHistory) {
        if (geminiApiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            return "Lỗi: Chưa cấu hình API Key của Gemini trong application.properties. Vui lòng thêm gemini.api.key=YOUR_KEY.";
        }

        String url = GEMINI_API_URL + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Construct the request body with context
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        for (Map<String, String> msg : conversationHistory) {
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("role", msg.get("role")); // "user" or "model"
            
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", msg.get("text"));
            parts.add(partMap);
            
            contentMap.put("parts", parts);
            contents.add(contentMap);
        }

        requestBody.put("contents", contents);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, requestEntity, Map.class);
            Map<String, Object> responseBody = responseEntity.getBody();

            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                    if (!resParts.isEmpty()) {
                        return (String) resParts.get(0).get("text");
                    }
                }
            }
            return "Không thể nhận câu trả lời từ Gemini.";

        } catch (Exception e) {
            e.printStackTrace();
            throw new RestClientException("Lỗi kết nối Gemini API: " + e.getMessage());
        }
    }
}
