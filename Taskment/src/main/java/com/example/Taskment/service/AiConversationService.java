package com.example.Taskment.service;

import com.example.Taskment.entity.AiConversation;
import com.example.Taskment.entity.AiMessage;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.AiConversationRepository;
import com.example.Taskment.repository.AiMessageRepository;
import com.example.Taskment.repository.UserRepository;
import com.example.Taskment.repository.ProjectRepository;
import com.example.Taskment.repository.ProjectMemberRepository;
import com.example.Taskment.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiConversationService {

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GeminiChatService geminiChatService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;

    public AiConversationService(AiConversationRepository conversationRepository, 
                                 AiMessageRepository messageRepository, 
                                 UserRepository userRepository, 
                                 GeminiChatService geminiChatService,
                                 ProjectRepository projectRepository,
                                 ProjectMemberRepository projectMemberRepository,
                                 TaskRepository taskRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.geminiChatService = geminiChatService;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public AiConversation getOrCreateConversation(String username, Long conversationId) {
        if (conversationId != null) {
            return conversationRepository.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found"));
        }
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        AiConversation conversation = new AiConversation();
        conversation.setUser(user);
        return conversationRepository.save(conversation);
    }

    private String getProjectAndTaskContext(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return "Chưa đăng nhập.";

        java.util.Set<com.example.Taskment.entity.Project> ownedProjects = projectRepository.findByLeader(user);
        java.util.Set<com.example.Taskment.entity.Project> memberProjects = projectMemberRepository.findByUser(user).stream()
                .map(com.example.Taskment.entity.ProjectMember::getProject)
                .collect(java.util.stream.Collectors.toSet());

        java.util.Set<com.example.Taskment.entity.Project> allProjects = new java.util.HashSet<>(ownedProjects);
        allProjects.addAll(memberProjects);

        StringBuilder sb = new StringBuilder();
        sb.append("DANH SÁCH DỰ ÁN & CÔNG VIỆC CỦA NGƯỜI DÙNG: ").append(user.getFullName()).append(" (Username: ").append(username).append(")\n\n");

        if (allProjects.isEmpty()) {
            sb.append("Người dùng này hiện chưa tham gia dự án nào.");
            return sb.toString();
        }

        for (com.example.Taskment.entity.Project project : allProjects) {
            sb.append("📁 DỰ ÁN: ").append(project.getName())
              .append("\n- ID: ").append(project.getId())
              .append("\n- Mô tả: ").append(project.getDescription() != null ? project.getDescription() : "Không có")
              .append("\n- Trạng thái dự án: ").append(project.getStatus())
              .append("\n- Quản lý (Leader): ").append(project.getLeader() != null ? project.getLeader().getFullName() : "Không có")
              .append("\n- Hạn chót dự án: ").append(project.getDueDate() != null ? project.getDueDate().toString() : "Không hạn");

            List<com.example.Taskment.entity.Task> tasks = taskRepository.findByProjectId(project.getId());
            sb.append("\n- Các công việc (Tasks) trong dự án này:");
            if (tasks.isEmpty()) {
                sb.append(" (Chưa có công việc nào)\n\n");
            } else {
                sb.append("\n");
                for (com.example.Taskment.entity.Task task : tasks) {
                    sb.append("   📌 Task ID ").append(task.getId()).append(": ").append(task.getTitle())
                      .append(" | Trạng thái: ").append(task.getStatus() != null ? task.getStatus().getName() : "To Do")
                      .append(" | Loại: ").append(task.getIssueType() != null ? task.getIssueType().getName() : "Task")
                      .append(" | Độ ưu tiên: ").append(task.getPriority() != null ? task.getPriority().getName() : "Medium")
                      .append(" | Người thực hiện: ").append(task.getAssignee() != null ? task.getAssignee().getFullName() : "Chưa phân công")
                      .append("\n");
                }
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    @Transactional
    public com.example.Taskment.dto.ChatResponseDTO sendMessage(String username, Long conversationId, String messageContent) {
        AiConversation conversation = getOrCreateConversation(username, conversationId);

        // Save User Message
        AiMessage userMessage = new AiMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole("user");
        userMessage.setContent(messageContent);
        messageRepository.save(userMessage);

        // Fetch conversation history
        List<AiMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Map<String, String>> promptContext = new ArrayList<>();
        
        for (AiMessage msg : history) {
            Map<String, String> map = new HashMap<>();
            map.put("role", msg.getRole());
            map.put("text", msg.getContent());
            promptContext.add(map);
        }

        // Add dynamic database context
        String dbContext = getProjectAndTaskContext(username);
        Map<String, String> systemContext = new HashMap<>();
        systemContext.put("role", "user");
        systemContext.put("text", "HỆ THỐNG CUNG CẤP BỐI CẢNH CƠ SỞ DỮ LIỆU THỰC TẾ (REAL-TIME DATABASE CONTEXT):\n" +
                                  dbContext + "\n\n" +
                                  "HƯỚNG DẪN TRẢ LỜI CHO AI:\n" +
                                  "- Bạn đóng vai trò là Trợ lý AI tích hợp trong hệ thống quản lý công việc Taskment.\n" +
                                  "- Hãy dựa vào bối cảnh dữ liệu thực tế bên trên để trả lời trực tiếp, chính xác, ngắn gọn các câu hỏi của người dùng liên quan đến các dự án, công việc của họ.\n" +
                                  "- KHÔNG được nói rằng bạn không có quyền truy cập dữ liệu, vì hệ thống đã cung cấp dữ liệu thực tế này cho bạn rồi.\n" +
                                  "- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.");
        
        Map<String, String> systemAck = new HashMap<>();
        systemAck.put("role", "model");
        systemAck.put("text", "Đã hiểu! Tôi đã cập nhật dữ liệu thời gian thực về các dự án và công việc từ hệ thống MySQL của người dùng. Tôi sẵn sàng trả lời chính xác dựa trên thông tin này.");

        // Prepend context to the front of promptContext
        promptContext.add(0, systemContext);
        promptContext.add(1, systemAck);

        // Get AI Response
        String aiResponseText = geminiChatService.generateResponse(promptContext);

        // Save AI Message
        AiMessage aiMessage = new AiMessage();
        aiMessage.setConversation(conversation);
        aiMessage.setRole("model");
        aiMessage.setContent(aiResponseText);
        messageRepository.save(aiMessage);
        
        // Update conversation time
        conversationRepository.save(conversation);

        return new com.example.Taskment.dto.ChatResponseDTO(aiResponseText, conversation.getId());
    }

    public List<AiConversation> getUserConversations(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
    }

    public List<AiMessage> getConversationMessages(Long conversationId, String username) {
        AiConversation conversation = conversationRepository.findById(conversationId).orElseThrow();
        if (!conversation.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access to conversation");
        }
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }
}
