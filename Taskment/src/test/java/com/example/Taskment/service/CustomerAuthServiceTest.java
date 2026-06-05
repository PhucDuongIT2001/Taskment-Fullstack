package com.example.Taskment.service;

import com.example.Taskment.dto.RegisterRequest;
import com.example.Taskment.entity.Role;
import com.example.Taskment.entity.User;
import com.example.Taskment.entity.VerificationToken;
import com.example.Taskment.exception.BadRequestException;
import com.example.Taskment.exception.ResourceConflictException;
import com.example.Taskment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test: Kiểm tra chức năng đăng ký tài khoản cho vai trò KHÁCH HÀNG
 * =========================================================================
 * Framework: JUnit 5 + Mockito
 * Các kịch bản được test:
 * 1. Đăng ký thành công với dữ liệu hợp lệ
 * 2. Lỗi khi username đã tồn tại
 * 3. Lỗi khi email đã tồn tại
 * 4. Lỗi khi confirmPassword không khớp
 * 5. Gán đúng role ROLE_CUSTOMER mặc định
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerAuthServiceTest - Kiểm tra đăng ký khách hàng")
class CustomerAuthServiceTest {

    // ====== MOCK DEPENDENCIES ======
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private HumanInfoRepository humanInfoRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private ForgotPasswordTokenRepository forgotPasswordTokenRepository;
    @Mock private VerificationTokenRepository verificationTokenRepository;

    @InjectMocks
    private AuthService authService;

    // ====== TEST DATA ======
    private RegisterRequest validRequest;
    private Role customerRole;
    private User savedUser;
    private static final String FRONTEND_URL = "http://localhost:3000";

    @BeforeEach
    void setUp() {
        // Chuẩn bị dữ liệu dùng chung
        customerRole = new Role("ROLE_CUSTOMER", "Khách hàng");

        validRequest = new RegisterRequest();
        validRequest.setUsername("nguyenvanba");
        validRequest.setEmail("nguyenvanba@gmail.com");
        validRequest.setPassword("Password@123");
        validRequest.setConfirmPassword("Password@123");
        validRequest.setFullName("Nguyen Van Ba");
        validRequest.setFirstName("Ba");
        validRequest.setLastName("Nguyen Van");
        validRequest.setPhoneNumber("0901234567");
        validRequest.setAddress("123 Đường ABC, TP.HCM");
        validRequest.setDateOfBirth("2000-01-15");

        savedUser = new User();
        savedUser.setId(100L);
        savedUser.setUsername("nguyenvanba");
        savedUser.setEmail("nguyenvanba@gmail.com");
        savedUser.setPassword("encoded_password");
        savedUser.setEnabled(true);
        savedUser.setRoles(Set.of(customerRole));

        // Chuẩn bị mock cho VerificationToken
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(savedUser);
        verificationToken.setToken("test-verification-token");
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        lenient().when(verificationTokenRepository.findByUser(any())).thenReturn(Optional.empty());
        lenient().when(verificationTokenRepository.save(any())).thenReturn(verificationToken);
    }

    // ============================================================
    // TEST 1: Đăng ký thành công
    // ============================================================
    @Test
    @DisplayName("TC01 - Đăng ký thành công với dữ liệu hợp lệ")
    void register_ShouldSucceed_WhenValidRequest() {
        // ARRANGE - Thiết lập môi trường
        when(userRepository.existsByUsername("nguyenvanba")).thenReturn(false);
        when(userRepository.existsByEmail("nguyenvanba@gmail.com")).thenReturn(false);
        when(roleRepository.findByRole("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(humanInfoRepository.save(any())).thenReturn(null);

        // ACT - Gọi phương thức đăng ký
        User result = authService.register(validRequest, FRONTEND_URL);

        // ASSERT - Kiểm tra kết quả
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("nguyenvanba");
        assertThat(result.getEmail()).isEqualTo("nguyenvanba@gmail.com");
        assertThat(result.isEnabled()).isTrue();

        // Xác nhận các service được gọi đúng
        verify(userRepository, times(1)).existsByUsername("nguyenvanba");
        verify(userRepository, times(1)).existsByEmail("nguyenvanba@gmail.com");
        verify(passwordEncoder, times(1)).encode("Password@123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(humanInfoRepository, times(1)).save(any());
        System.out.println("✅ TC01 PASS: Đăng ký thành công với dữ liệu hợp lệ");
    }

    // ============================================================
    // TEST 2: Username đã tồn tại
    // ============================================================
    @Test
    @DisplayName("TC02 - Đăng ký thất bại khi username đã tồn tại")
    void register_ShouldThrow_WhenUsernameAlreadyExists() {
        // ARRANGE
        when(userRepository.existsByUsername("nguyenvanba")).thenReturn(true);

        // ACT + ASSERT
        assertThatThrownBy(() -> authService.register(validRequest, FRONTEND_URL))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("Tên đăng nhập đã tồn tại");

        // Đảm bảo không cố lưu User khi username đã tồn tại
        verify(userRepository, never()).save(any(User.class));
        System.out.println("✅ TC02 PASS: Ném lỗi khi username đã tồn tại");
    }

    // ============================================================
    // TEST 3: Email đã tồn tại
    // ============================================================
    @Test
    @DisplayName("TC03 - Đăng ký thất bại khi email đã được sử dụng")
    void register_ShouldThrow_WhenEmailAlreadyExists() {
        // ARRANGE
        when(userRepository.existsByUsername("nguyenvanba")).thenReturn(false);
        when(userRepository.existsByEmail("nguyenvanba@gmail.com")).thenReturn(true);

        // ACT + ASSERT
        assertThatThrownBy(() -> authService.register(validRequest, FRONTEND_URL))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessageContaining("Email đã được đăng ký");

        verify(userRepository, never()).save(any(User.class));
        System.out.println("✅ TC03 PASS: Ném lỗi khi email đã tồn tại");
    }

    // ============================================================
    // TEST 4: Mật khẩu không khớp
    // ============================================================
    @Test
    @DisplayName("TC04 - Đăng ký thất bại khi confirmPassword không khớp")
    void register_ShouldThrow_WhenPasswordsMismatch() {
        // ARRANGE - Đặt confirmPassword sai
        validRequest.setConfirmPassword("DifferentPassword@999");

        // ACT + ASSERT
        assertThatThrownBy(() -> authService.register(validRequest, FRONTEND_URL))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Xác nhận mật khẩu không khớp");

        verify(userRepository, never()).save(any(User.class));
        System.out.println("✅ TC04 PASS: Ném lỗi khi mật khẩu không khớp");
    }

    // ============================================================
    // TEST 5: Không cung cấp role → tự động gán ROLE_CUSTOMER
    // ============================================================
    @Test
    @DisplayName("TC05 - Tự động gán ROLE_CUSTOMER khi không chỉ định role")
    void register_ShouldAssignCustomerRole_WhenNoRoleProvided() {
        // ARRANGE - Không set roles
        validRequest.setRoles(null);

        when(userRepository.existsByUsername("nguyenvanba")).thenReturn(false);
        when(userRepository.existsByEmail("nguyenvanba@gmail.com")).thenReturn(false);
        when(roleRepository.findByRole("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(any())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(humanInfoRepository.save(any())).thenReturn(null);

        // ACT
        User result = authService.register(validRequest, FRONTEND_URL);

        // ASSERT - Kiểm tra ROLE_CUSTOMER được gán
        assertThat(result.getRoles()).isNotEmpty();
        assertThat(result.getRoles())
                .anyMatch(r -> r.getRole().equals("ROLE_CUSTOMER"));

        // Xác nhận roleRepository được gọi để tìm ROLE_CUSTOMER
        verify(roleRepository, times(1)).findByRole("ROLE_CUSTOMER");
        System.out.println("✅ TC05 PASS: Tự động gán ROLE_CUSTOMER thành công");
    }
}
