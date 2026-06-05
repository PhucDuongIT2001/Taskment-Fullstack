package com.example.Taskment.controller;

import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Test: Kiểm tra luồng hoàn chỉnh của KHÁCH HÀNG qua API REST
 * ==========================================================================
 * Framework: Spring Boot Test + MockMvc
 * Profile: "test" (dùng H2 in-memory database)
 *
 * Luồng test (end-to-end):
 * Step 1: [POST] /api/auth/register  → Đăng ký tài khoản khách hàng
 * Step 2: [POST] /api/auth/login     → Đăng nhập và lấy JWT token
 * Step 3: [POST] /api/tasks/customer-request → Tạo yêu cầu hỗ trợ (có JWT)
 * Step 4: [GET]  /api/tasks/my-requests       → Xem danh sách yêu cầu (có JWT)
 * Step 5: [GET]  /api/tasks/{id}              → Xem chi tiết một yêu cầu (có JWT)
 * Step 6: Kiểm tra bảo mật - truy cập không có JWT
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("CustomerApiIntegrationTest - Kiểm tra API đầu-cuối cho Khách hàng")
class CustomerApiIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskStatusRepository taskStatusRepository;
    @Autowired private PriorityRepository priorityRepository;
    @Autowired private IssueTypeRepository issueTypeRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Chia sẻ JWT token và taskId giữa các test theo thứ tự
    private static String jwtToken;
    private static Long createdTaskId;

    // Dữ liệu test cố định
    private static final String TEST_USERNAME = "khachhang_test_01";
    private static final String TEST_EMAIL    = "khachhang01@taskment.com";
    private static final String TEST_PASSWORD = "TestPass@123";

    // ====================================================================
    // SETUP: Seed dữ liệu cần thiết trước khi chạy test
    // ====================================================================
    @BeforeEach
    void setupRequiredData() {
        // 1. Seed roles nếu chưa có
        if (roleRepository.findByRole("ROLE_CUSTOMER").isEmpty()) {
            roleRepository.save(new Role("ROLE_CUSTOMER", "Khách hàng"));
        }
        if (roleRepository.findByRole("ROLE_ADMIN").isEmpty()) {
            roleRepository.save(new Role("ROLE_ADMIN", "Quản trị viên"));
        }

        // 2. Seed TaskStatus
        taskStatusRepository.findByName("TO DO").orElseGet(() ->
                taskStatusRepository.save(new TaskStatus("TO DO")));

        // 3. Seed Priority
        priorityRepository.findByName("MEDIUM").orElseGet(() ->
                priorityRepository.save(new Priority("MEDIUM", 2)));

        // 4. Seed IssueType
        issueTypeRepository.findByName("Task").orElseGet(() ->
                issueTypeRepository.save(new IssueType("Task")));

        // 5. Seed Project mặc định (ID=1 - dùng cho customer request)
        if (projectRepository.count() == 0) {
            User adminSeed = userRepository.findByUsername("admin_seed").orElseGet(() -> {
                User a = new User();
                a.setUsername("admin_seed");
                a.setEmail("admin_seed@taskment.com");
                a.setPassword(passwordEncoder.encode("Admin@123"));
                a.setFullName("Admin Seed");
                a.setEnabled(true);
                a.setRoles(Set.of(roleRepository.findByRole("ROLE_ADMIN").get()));
                return userRepository.save(a);
            });
            Project project = new Project();
            project.setName("Dự án Mặc Định");
            project.setDescription("Project để nhận yêu cầu từ khách hàng");
            project.setStatus("ACTIVE");
            project.setLeader(adminSeed);
            projectRepository.save(project);
        }
    }

    // ====================================================================
    // STEP 1: Đăng ký tài khoản khách hàng mới
    // ====================================================================
    @Test
    @Order(1)
    @DisplayName("IT-01: [POST /api/auth/register] Đăng ký khách hàng mới thành công")
    void step1_Register_ShouldReturn200_WithSuccessMessage() throws Exception {
        // Dọn dẹp nếu user test đã tồn tại từ lần chạy trước
        userRepository.findByUsername(TEST_USERNAME).ifPresent(u -> userRepository.delete(u));

        Map<String, Object> registerBody = new LinkedHashMap<>();
        registerBody.put("username", TEST_USERNAME);
        registerBody.put("email", TEST_EMAIL);
        registerBody.put("password", TEST_PASSWORD);
        registerBody.put("confirmPassword", TEST_PASSWORD);
        registerBody.put("fullName", "Khách Hàng Test 01");
        registerBody.put("firstName", "Test");
        registerBody.put("lastName", "Khách Hàng");
        registerBody.put("phoneNumber", "0912345678");
        registerBody.put("dateOfBirth", "2000-05-10");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        // Xác nhận user đã được tạo trong DB
        Optional<User> createdUser = userRepository.findByUsername(TEST_USERNAME);
        assertThat(createdUser).isPresent();
        assertThat(createdUser.get().getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(createdUser.get().isEnabled()).isTrue();
        System.out.println("✅ IT-01 PASS: Đăng ký thành công - User: " + TEST_USERNAME);
    }

    // ====================================================================
    // STEP 1b: Đăng ký với username trùng → phải thất bại
    // ====================================================================
    @Test
    @Order(2)
    @DisplayName("IT-02: [POST /api/auth/register] Đăng ký thất bại khi username đã tồn tại")
    void step2_Register_ShouldFail_WhenUsernameAlreadyTaken() throws Exception {
        // Đảm bảo user đã tồn tại (từ IT-01 hoặc seed trực tiếp)
        if (userRepository.findByUsername(TEST_USERNAME).isEmpty()) {
            User u = new User();
            u.setUsername(TEST_USERNAME);
            u.setEmail(TEST_EMAIL);
            u.setPassword(passwordEncoder.encode(TEST_PASSWORD));
            u.setFullName("Khách Hàng Test 01");
            u.setEnabled(true);
            u.setRoles(Set.of(roleRepository.findByRole("ROLE_CUSTOMER").orElseThrow()));
            userRepository.save(u);
        }

        Map<String, Object> duplicateRegisterBody = new LinkedHashMap<>();
        duplicateRegisterBody.put("username", TEST_USERNAME); // Username đã tồn tại
        duplicateRegisterBody.put("email", "another_email@test.com");
        duplicateRegisterBody.put("password", TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRegisterBody)))
                .andExpect(status().is4xxClientError()); // 4xx là Conflict hoặc Bad Request

        System.out.println("✅ IT-02 PASS: Từ chối đăng ký khi username đã tồn tại");
    }

    // ====================================================================
    // STEP 2: Đăng nhập để lấy JWT
    // ====================================================================
    @Test
    @Order(3)
    @DisplayName("IT-03: [POST /api/auth/login] Đăng nhập và lấy JWT token")
    void step3_Login_ShouldReturn200_WithJwtToken() throws Exception {
        // Seed user nếu chưa tồn tại
        if (userRepository.findByUsername(TEST_USERNAME).isEmpty()) {
            User u = new User();
            u.setUsername(TEST_USERNAME);
            u.setEmail(TEST_EMAIL);
            u.setPassword(passwordEncoder.encode(TEST_PASSWORD));
            u.setFullName("Khách Hàng Test 01");
            u.setEnabled(true);
            u.setRoles(Set.of(roleRepository.findByRole("ROLE_CUSTOMER").orElseThrow()));
            userRepository.save(u);
        }

        Map<String, String> loginBody = Map.of(
                "username", TEST_USERNAME,
                "password", TEST_PASSWORD
        );

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseBody, Map.class);
        jwtToken = (String) responseMap.get("accessToken");

        assertThat(jwtToken).isNotBlank();
        System.out.println("✅ IT-03 PASS: Đăng nhập thành công, JWT token đã lấy được");
    }

    // ====================================================================
    // STEP 3: Đăng nhập sai mật khẩu
    // ====================================================================
    @Test
    @Order(4)
    @DisplayName("IT-04: [POST /api/auth/login] Đăng nhập thất bại khi sai mật khẩu")
    void step4_Login_ShouldReturn401_WhenWrongPassword() throws Exception {
        Map<String, String> loginBody = Map.of(
                "username", TEST_USERNAME,
                "password", "WrongPassword!999"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isUnauthorized());

        System.out.println("✅ IT-04 PASS: Trả về 401 khi đăng nhập sai mật khẩu");
    }

    // ====================================================================
    // STEP 4: Tạo yêu cầu hỗ trợ (Customer Request)
    // ====================================================================
    @Test
    @Order(5)
    @DisplayName("IT-05: [POST /api/tasks/customer-request] Khách hàng tạo yêu cầu mới")
    void step5_CreateCustomerRequest_ShouldReturn201_WithTaskData() throws Exception {
        // Cần JWT từ IT-03 - bỏ qua nếu chưa có
        Assumptions.assumeTrue(jwtToken != null, "Bỏ qua IT-05 vì chưa có JWT (IT-03 thất bại)");

        Map<String, String> requestBody = Map.of(
                "title", "Cần hỗ trợ tính năng thanh toán",
                "description", "Tôi không thể thực hiện thanh toán bằng VNPAY, vui lòng kiểm tra giúp tôi."
        );

        MvcResult result = mockMvc.perform(post("/api/tasks/customer-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Cần hỗ trợ tính năng thanh toán"))
                .andExpect(jsonPath("$.statusName").value("TO DO"))
                .andExpect(jsonPath("$.priorityName").value("MEDIUM"))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Map<?, ?> taskMap = objectMapper.readValue(responseBody, Map.class);
        createdTaskId = Long.valueOf(taskMap.get("id").toString());

        assertThat(createdTaskId).isNotNull().isPositive();
        System.out.println("✅ IT-05 PASS: Tạo yêu cầu hỗ trợ thành công, Task ID = " + createdTaskId);
    }

    // ====================================================================
    // STEP 5: Tạo yêu cầu không có JWT → 403
    // ====================================================================
    @Test
    @Order(6)
    @DisplayName("IT-06: [POST /api/tasks/customer-request] Từ chối khi không có JWT")
    void step6_CreateCustomerRequest_ShouldReturn401_WhenNoJwt() throws Exception {
        Map<String, String> requestBody = Map.of(
                "title", "Yêu cầu từ người chưa đăng nhập"
        );

        mockMvc.perform(post("/api/tasks/customer-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().is4xxClientError()); // 401 hoặc 403

        System.out.println("✅ IT-06 PASS: Từ chối tạo task khi không có JWT");
    }

    // ====================================================================
    // STEP 6: Xem danh sách yêu cầu của mình
    // ====================================================================
    @Test
    @Order(7)
    @DisplayName("IT-07: [GET /api/tasks/my-requests] Lấy danh sách yêu cầu đã tạo")
    void step7_GetMyRequests_ShouldReturn200_WithTaskList() throws Exception {
        Assumptions.assumeTrue(jwtToken != null, "Bỏ qua IT-07 vì chưa có JWT");

        mockMvc.perform(get("/api/tasks/my-requests")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        System.out.println("✅ IT-07 PASS: Lấy danh sách My Requests thành công");
    }

    // ====================================================================
    // STEP 7: Xem chi tiết yêu cầu vừa tạo
    // ====================================================================
    @Test
    @Order(8)
    @DisplayName("IT-08: [GET /api/tasks/{id}] Xem chi tiết yêu cầu vừa tạo")
    void step8_GetTaskById_ShouldReturn200_WithCorrectData() throws Exception {
        Assumptions.assumeTrue(jwtToken != null, "Bỏ qua IT-08 vì chưa có JWT");
        Assumptions.assumeTrue(createdTaskId != null, "Bỏ qua IT-08 vì chưa tạo task (IT-05 thất bại)");

        mockMvc.perform(get("/api/tasks/" + createdTaskId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdTaskId))
                .andExpect(jsonPath("$.title").value("Cần hỗ trợ tính năng thanh toán"))
                .andExpect(jsonPath("$.reporterName").value(TEST_USERNAME));

        System.out.println("✅ IT-08 PASS: Xem chi tiết Task ID=" + createdTaskId + " thành công");
    }

    // ====================================================================
    // STEP 8: Xem task không tồn tại → 500/404
    // ====================================================================
    @Test
    @Order(9)
    @DisplayName("IT-09: [GET /api/tasks/{id}] Trả về lỗi khi task không tồn tại")
    void step9_GetTaskById_ShouldReturnError_WhenTaskNotFound() throws Exception {
        Assumptions.assumeTrue(jwtToken != null, "Bỏ qua IT-09 vì chưa có JWT");

        mockMvc.perform(get("/api/tasks/999999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().is4xxClientError()); // Backend maps RuntimeException to 400

        System.out.println("✅ IT-09 PASS: Trả về lỗi khi task ID=999999 không tồn tại");
    }

    // ====================================================================
    // STEP 9: Kiểm tra bảo mật - Customer không được vào /admin endpoint
    // ====================================================================
    @Test
    @Order(10)
    @DisplayName("IT-10: [GET /api/tasks/all] Customer bị từ chối truy cập dữ liệu admin")
    void step10_CustomerCannotAccessAdminData() throws Exception {
        Assumptions.assumeTrue(jwtToken != null, "Bỏ qua IT-10 vì chưa có JWT");

        // GET /api/projects yêu cầu ROLE_ADMIN, ROLE_STAFF_LEADER, hoặc ROLE_STAFF_MEMBER
        // Customer không có role này nên phải bị từ chối
        mockMvc.perform(get("/api/projects")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isForbidden()); // 403 Forbidden

        System.out.println("✅ IT-10 PASS: Customer bị từ chối truy cập endpoint admin");
    }
}
