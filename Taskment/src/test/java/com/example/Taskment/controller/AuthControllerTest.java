package com.example.Taskment.controller;

import com.example.Taskment.entity.User;
import com.example.Taskment.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc; // Công cụ giả lập gửi HTTP Request

    @MockitoBean
    private AuthService authService; // Giả lập AuthService (không chọc vào DB thật)

    @Autowired
    private ObjectMapper objectMapper; // Công cụ chuyển đổi Object thành JSON

    @Test
    public void testRegister_Success() throws Exception {
        User requestUser = new User();
        requestUser.setUsername("testuser");
        requestUser.setPassword("password123");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");

        // Giả lập: Khi gọi hàm register, trả về savedUser
        Mockito.when(authService.register(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    public void testLogin_Success() throws Exception {
        User loginRequest = new User();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setEmail("test@gmail.com");

        // Giả lập: Đăng nhập đúng username/password -> trả về User
        Mockito.when(authService.login(anyString(), anyString())).thenReturn(mockUser);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@gmail.com"));
    }

    @Test
    public void testLogin_WrongPassword() throws Exception {
        User loginRequest = new User();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("wrongpass");

        // Giả lập: Service ném ra Exception nếu sai pass
        Mockito.when(authService.login(anyString(), anyString())).thenThrow(new RuntimeException("Sai mật khẩu!"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized()) // Mong đợi mã 401
                .andExpect(content().string("Sai mật khẩu!"));
    }
}