package com.example.Taskment.service;

import com.example.Taskment.dto.CustomerRequestDTO;
import com.example.Taskment.dto.TaskResponseDTO;
import com.example.Taskment.entity.*;
import com.example.Taskment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test: Kiểm tra chức năng thêm yêu cầu (Task) và xem Task của Khách hàng
 * ===============================================================================
 * Framework: JUnit 5 + Mockito
 * Các kịch bản được test:
 * 1. Khách hàng gửi yêu cầu hỗ trợ thành công
 * 2. Gửi yêu cầu thất bại khi người dùng không tồn tại
 * 3. Gửi yêu cầu thất bại khi không tìm được dữ liệu mặc định (Project/Status/...)
 * 4. Khách hàng xem danh sách yêu cầu đã tạo (My Requests)
 * 5. Khách hàng xem chi tiết một yêu cầu theo ID
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerTaskServiceTest - Kiểm tra Task của khách hàng")
class CustomerTaskServiceTest {

    // ====== MOCK DEPENDENCIES ======
    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private TaskStatusRepository taskStatusRepository;
    @Mock private PriorityRepository priorityRepository;
    @Mock private UserRepository userRepository;
    @Mock private SprintRepository sprintRepository;
    @Mock private IssueTypeRepository issueTypeRepository;
    @Mock private NotificationService notificationService;
    @Mock private TaskWatcherRepository taskWatcherRepository;
    @Mock private ActivityLogService activityLogService;

    @InjectMocks
    private TaskService taskService;

    // ====== TEST DATA ======
    private User customerUser;
    private Project defaultProject;
    private TaskStatus todoStatus;
    private Priority mediumPriority;
    private IssueType taskIssueType;
    private Task savedTask;
    private CustomerRequestDTO validRequestDTO;

    @BeforeEach
    void setUp() {
        // Khách hàng
        customerUser = new User();
        customerUser.setId(10L);
        customerUser.setUsername("customer");
        customerUser.setEmail("customer@taskment.com");
        customerUser.setFullName("Test Customer");
        customerUser.setEnabled(true);

        // Dữ liệu mặc định của hệ thống
        defaultProject = new Project();
        defaultProject.setId(1L);
        defaultProject.setName("Dự án Alpha");
        defaultProject.setLeader(customerUser);

        todoStatus = new TaskStatus("TO DO");
        todoStatus.setId(1L);

        mediumPriority = new Priority("MEDIUM", 2);
        mediumPriority.setId(2L);

        taskIssueType = new IssueType("Task");
        taskIssueType.setId(1L);

        // Task đã được lưu
        savedTask = new Task();
        savedTask.setId(200L);
        savedTask.setTitle("Tôi cần hỗ trợ về sản phẩm webBanHang");
        savedTask.setDescription("Mô tả chi tiết vấn đề cần hỗ trợ");
        savedTask.setProject(defaultProject);
        savedTask.setStatus(todoStatus);
        savedTask.setPriority(mediumPriority);
        savedTask.setAssignee(customerUser);
        savedTask.setReporter(customerUser);
        savedTask.setIssueType(taskIssueType);
        savedTask.setStoryPoints(0);

        // DTO gửi từ Frontend
        validRequestDTO = new CustomerRequestDTO();
        validRequestDTO.setTitle("Tôi cần hỗ trợ về sản phẩm webBanHang");
        validRequestDTO.setDescription("Mô tả chi tiết vấn đề cần hỗ trợ");
    }

    // ============================================================
    // TEST 1: Gửi yêu cầu thành công
    // ============================================================
    @Test
    @DisplayName("TC06 - Khách hàng gửi yêu cầu hỗ trợ thành công")
    void createCustomerRequest_ShouldSucceed_WhenDataIsValid() {
        // ARRANGE
        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(defaultProject));
        when(taskStatusRepository.findByName("TO DO")).thenReturn(Optional.of(todoStatus));
        when(priorityRepository.findByName("MEDIUM")).thenReturn(Optional.of(mediumPriority));
        when(issueTypeRepository.findByName("Task")).thenReturn(Optional.of(taskIssueType));
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);
        doNothing().when(activityLogService).logActivity(anyString(), anyString());

        // ACT
        TaskResponseDTO result = taskService.createCustomerRequest(validRequestDTO, "customer");

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Tôi cần hỗ trợ về sản phẩm webBanHang");
        assertThat(result.getStatusName()).isEqualTo("TO DO");
        assertThat(result.getPriorityName()).isEqualTo("MEDIUM");
        assertThat(result.getProjectName()).isEqualTo("Dự án Alpha");

        // Xác nhận task được lưu
        verify(taskRepository, times(1)).save(any(Task.class));
        verify(activityLogService, times(1)).logActivity(eq("INFO"), contains("customer"));
        System.out.println("✅ TC06 PASS: Gửi yêu cầu hỗ trợ thành công");
    }

    // ============================================================
    // TEST 2: Gửi yêu cầu khi username không tồn tại
    // ============================================================
    @Test
    @DisplayName("TC07 - Gửi yêu cầu thất bại khi username không tồn tại")
    void createCustomerRequest_ShouldThrow_WhenUserNotFound() {
        // ARRANGE
        when(userRepository.findByUsername("ghost_user")).thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThatThrownBy(() -> taskService.createCustomerRequest(validRequestDTO, "ghost_user"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Người tạo không tồn tại");

        verify(taskRepository, never()).save(any(Task.class));
        System.out.println("✅ TC07 PASS: Ném lỗi khi user không tồn tại");
    }

    // ============================================================
    // TEST 3: Gửi yêu cầu khi không tìm thấy dự án mặc định
    // ============================================================
    @Test
    @DisplayName("TC08 - Gửi yêu cầu thất bại khi không có dự án mặc định (ID=1)")
    void createCustomerRequest_ShouldThrow_WhenDefaultProjectNotFound() {
        // ARRANGE
        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
        when(projectRepository.findById(1L)).thenReturn(Optional.empty()); // Project không tồn tại

        // ACT + ASSERT
        assertThatThrownBy(() -> taskService.createCustomerRequest(validRequestDTO, "customer"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy dự án mặc định");

        verify(taskRepository, never()).save(any(Task.class));
        System.out.println("✅ TC08 PASS: Ném lỗi khi không có dự án mặc định");
    }

    // ============================================================
    // TEST 4: Khách hàng xem danh sách yêu cầu đã tạo
    // ============================================================
    @Test
    @DisplayName("TC09 - Khách hàng xem danh sách yêu cầu của mình (My Requests)")
    void getMyRequests_ShouldReturnTasksByReporter() {
        // ARRANGE - Tạo danh sách 2 task do customer tạo
        Task task2 = new Task();
        task2.setId(201L);
        task2.setTitle("Yêu cầu hỗ trợ thứ hai");
        task2.setProject(defaultProject);
        task2.setStatus(todoStatus);
        task2.setPriority(mediumPriority);
        task2.setAssignee(customerUser);
        task2.setReporter(customerUser);
        task2.setIssueType(taskIssueType);
        task2.setStoryPoints(0);

        List<Task> myTasks = List.of(savedTask, task2);

        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
        when(taskRepository.findByReporterId(10L)).thenReturn(myTasks);

        // ACT
        List<TaskResponseDTO> result = taskService.getTasksByReporter("customer");

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Tôi cần hỗ trợ về sản phẩm webBanHang");
        assertThat(result.get(1).getTitle()).isEqualTo("Yêu cầu hỗ trợ thứ hai");

        verify(taskRepository, times(1)).findByReporterId(10L);
        System.out.println("✅ TC09 PASS: Lấy danh sách My Requests thành công (" + result.size() + " task)");
    }

    // ============================================================
    // TEST 5: Xem chi tiết một task theo ID
    // ============================================================
    @Test
    @DisplayName("TC10 - Khách hàng xem chi tiết yêu cầu theo ID")
    void getTaskById_ShouldReturnTaskDetail() {
        // ARRANGE
        when(taskRepository.findById(200L)).thenReturn(Optional.of(savedTask));

        // ACT
        TaskResponseDTO result = taskService.getTaskById(200L);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(200L);
        assertThat(result.getTitle()).isEqualTo("Tôi cần hỗ trợ về sản phẩm webBanHang");
        assertThat(result.getReporterName()).isEqualTo("customer");
        assertThat(result.getAssigneeName()).isEqualTo("customer");

        verify(taskRepository, times(1)).findById(200L);
        System.out.println("✅ TC10 PASS: Lấy chi tiết task ID=200 thành công");
    }

    // ============================================================
    // TEST 6: Xem chi tiết task không tồn tại
    // ============================================================
    @Test
    @DisplayName("TC11 - Xem chi tiết task thất bại khi ID không tồn tại")
    void getTaskById_ShouldThrow_WhenTaskNotFound() {
        // ARRANGE
        when(taskRepository.findById(9999L)).thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThatThrownBy(() -> taskService.getTaskById(9999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Không tìm thấy công việc");

        System.out.println("✅ TC11 PASS: Ném lỗi khi task ID=9999 không tồn tại");
    }

    // ============================================================
    // TEST 7: Xem danh sách rỗng khi chưa có yêu cầu nào
    // ============================================================
    @Test
    @DisplayName("TC12 - Trả về danh sách rỗng khi khách hàng chưa gửi yêu cầu nào")
    void getMyRequests_ShouldReturnEmptyList_WhenNoTasksExist() {
        // ARRANGE
        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(customerUser));
        when(taskRepository.findByReporterId(10L)).thenReturn(List.of());

        // ACT
        List<TaskResponseDTO> result = taskService.getTasksByReporter("customer");

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        System.out.println("✅ TC12 PASS: Trả về danh sách rỗng khi không có yêu cầu nào");
    }
}
