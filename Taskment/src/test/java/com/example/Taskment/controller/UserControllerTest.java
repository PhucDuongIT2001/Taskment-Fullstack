package com.example.Taskment.controller;

import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Lớp kiểm thử (Unit Test) cho UserController.
 * Sử dụng @WebMvcTest để giả lập môi trường web (MockMvc) và kiểm thử các API RESTful.
 * UserRepository được giả lập (mock) để cô lập logic của Controller, không phụ thuộc vào Database thật.
 */
@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository; // Giả lập Database

    /**
     * Kịch bản kiểm thử: Lấy danh sách tất cả người dùng thành công.
     * Môi trường giả lập: Database trả về một danh sách chứa 2 người dùng.
     * Kết quả mong đợi: API trả về mã trạng thái 200 (OK) và mảng JSON có đúng 2 phần tử.
     */
    @Test
    public void testGetAllUsers() throws Exception {
        User user1 = new User();
        user1.setUsername("user1");
        User user2 = new User();
        user2.setUsername("user2");

        // Trả về danh sách chứa 2 user
        Mockito.when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2));
    }

    /**
     * Kịch bản kiểm thử: Lấy thông tin chi tiết một người dùng theo ID thành công.
     * Môi trường giả lập: Database tìm thấy và trả về đối tượng User có ID = 1.
     * Kết quả mong đợi: API trả về mã 200 (OK) và trường username trong JSON khớp với dữ liệu giả lập.
     */
    @Test
    public void testGetUserById_Found() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    /**
     * Kịch bản kiểm thử: Lấy thông tin người dùng theo ID thất bại do không tồn tại.
     * Môi trường giả lập: Database không tìm thấy User (trả về Optional.empty()).
     * Kết quả mong đợi: API trả về mã lỗi 404 (Not Found).
     */
    @Test
    public void testGetUserById_NotFound() throws Exception {
        // Giả lập Database không tìm thấy User với ID = 99
        Mockito.when(userRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound()); // Mong đợi trả về mã lỗi 404
    }

    /**
     * Kịch bản kiểm thử: Xóa người dùng theo ID thành công.
     * Môi trường giả lập: Kiểm tra ID = 1 tồn tại trong database (trả về true).
     * Kết quả mong đợi: API gọi hàm xóa thành công, trả về mã 200 (OK) kèm thông báo xác nhận.
     */
    @Test
    public void testDeleteUser_Success() throws Exception {
        Mockito.when(userRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Đã xóa người dùng thành công!"));
    }
    
    /**
     * Kịch bản kiểm thử: Xóa người dùng thất bại do ID không tồn tại.
     * Môi trường giả lập: Kiểm tra ID = 99 không tồn tại trong database (trả về false).
     * Kết quả mong đợi: API không thực hiện xóa, trả về mã lỗi 404 (Not Found).
     */
    @Test
    public void testDeleteUser_NotFound() throws Exception {
        Mockito.when(userRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/users/99"))
                .andExpect(status().isNotFound());
    }
}