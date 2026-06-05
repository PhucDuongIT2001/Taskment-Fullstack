package com.example.Taskment.service;

import com.example.Taskment.exception.ResourceConflictException;
import com.example.Taskment.exception.BadRequestException;

import com.example.Taskment.dto.ChangePasswordDto;
import com.example.Taskment.dto.RegisterRequest;
import com.example.Taskment.dto.UserProfileDto;
import com.example.Taskment.entity.ForgotPasswordToken;
import com.example.Taskment.entity.HumanInfo;
import com.example.Taskment.entity.Role;
import com.example.Taskment.entity.User;
import com.example.Taskment.entity.VerificationToken;
import com.example.Taskment.repository.ForgotPasswordTokenRepository;
import com.example.Taskment.repository.HumanInfoRepository;
import com.example.Taskment.repository.RoleRepository;
import com.example.Taskment.repository.UserRepository;
import com.example.Taskment.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Random;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private HumanInfoRepository humanInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private ForgotPasswordTokenRepository forgotPasswordTokenRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private NotificationService notificationService;

    /**
     * Đăng ký tài khoản, tạo Profile (HumanInfo) và MÃ HÓA mật khẩu
     */
    @Transactional
    public User register(RegisterRequest request, String frontendUrl) {
        // Validate confirmPassword only if it is provided
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu không khớp.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceConflictException("Tên đăng nhập đã tồn tại trong hệ thống.");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("Email đã được đăng ký trong hệ thống.");
        }
        
        // 1. TẠO USER
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true); // Kích hoạt ngay (không cần xác thực email trong môi trường dev)

        // Gán Role
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role customerRole = roleRepository.findByRole("ROLE_CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy vai trò mặc định ROLE_CUSTOMER"));
            user.setRoles(Set.of(customerRole));
        } else {
            Set<Role> roles = request.getRoles().stream()
                .map(r -> roleRepository.findByRole(r.getRole())
                    .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy vai trò " + r.getRole())))
                .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        
        // Lưu User trước để có ID
        User savedUser = userRepository.save(user);

        // 2. TẠO TỰ ĐỘNG THÔNG TIN PROFILE (HumanInfo)
        HumanInfo profile = new HumanInfo();
        profile.setUser(savedUser);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        
        // Gán ngày sinh nếu có
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
            try {
                profile.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (Exception e) {
                // Nếu format sai thì bỏ qua hoặc log lại
            }
        }
        
        // Lưu Profile
        humanInfoRepository.save(profile);

        // Gửi thông báo đến toàn bộ Admin
        try {
            java.util.List<User> admins = userRepository.findByRoles_Role("ROLE_ADMIN");
            for (User admin : admins) {
                notificationService.sendDetailedNotification(
                    admin,
                    "Thành viên mới @" + savedUser.getUsername() + " (" + savedUser.getFullName() + ") vừa đăng ký tài khoản.",
                    "/team",
                    "SYSTEM",
                    null
                );
            }
        } catch (Exception e) {
            System.err.println("[ERROR] Lỗi khi gửi thông báo thành viên mới cho Admin: " + e.getMessage());
        }

        // 3. TẠO VÀ GỬI EMAIL XÁC THỰC
        sendVerificationEmail(savedUser, frontendUrl);
        
        return savedUser;
    }

    /**
     * Gửi email xác thực tài khoản (hiện tại chỉ log ra console)
     */
    @Transactional
    public void sendVerificationEmail(User user, String frontendUrl) {
        // Xóa token cũ nếu có
        verificationTokenRepository.findByUser(user).ifPresent(verificationTokenRepository::delete);

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUser(user);
        verificationTokenRepository.save(verificationToken);

        String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken.getToken();
        // TODO: Bật lại khi có cấu hình SMTP thật
        System.out.println("[DEV] Token xác thực cho " + user.getEmail() + " là: " + verificationToken.getToken());
        System.out.println("[DEV] Liên kết xác thực: " + verificationLink);
    }

    /**
     * Xác thực tài khoản bằng token
     */
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token xác thực không hợp lệ hoặc đã hết hạn!"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(verificationToken); // Xóa token hết hạn
            throw new RuntimeException("Token xác thực đã hết hạn!");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true); // Kích hoạt tài khoản
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken); // Xóa token sau khi sử dụng
    }

    /**
     * Gửi lại email xác thực
     */
    @Transactional
    public void resendVerificationEmail(String email, String frontendUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        if (user.isEnabled()) {
            throw new RuntimeException("Tài khoản này đã được kích hoạt.");
        }

        // Xóa token cũ nếu có
        verificationTokenRepository.findByUser(user).ifPresent(verificationTokenRepository::delete);

        // Tạo và gửi token mới
        sendVerificationEmail(user, frontendUrl);
    }

    /**
     * Lấy thông tin hồ sơ người dùng
     */
    public UserProfileDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        return new UserProfileDto(user.getUsername(), user.getEmail());
    }

    /**
     * Cập nhật thông tin hồ sơ người dùng (username, email)
     */
    @Transactional
    public UserProfileDto updateUserProfile(String currentUsername, UserProfileDto userProfileDto) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // Kiểm tra username mới nếu có thay đổi
        if (!user.getUsername().equals(userProfileDto.getUsername())) {
            if (userRepository.existsByUsername(userProfileDto.getUsername())) {
                throw new RuntimeException("Lỗi: Tên đăng nhập mới đã có người sử dụng!");
            }
            user.setUsername(userProfileDto.getUsername());
        }

        // Kiểm tra email mới nếu có thay đổi
        if (!user.getEmail().equals(userProfileDto.getEmail())) {
            if (userRepository.existsByEmail(userProfileDto.getEmail())) {
                throw new RuntimeException("Lỗi: Email mới đã được đăng ký!");
            }
            user.setEmail(userProfileDto.getEmail());
        }
        
        userRepository.save(user);
        return new UserProfileDto(user.getUsername(), user.getEmail());
    }

    /**
     * Thay đổi mật khẩu người dùng
     */
    @Transactional
    public void changePassword(String username, ChangePasswordDto changePasswordDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(changePasswordDto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        // Mã hóa và cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Yêu cầu đặt lại mật khẩu: Tạo token và gửi email
     */
    @Transactional
    public void forgotPassword(String email, String frontendUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này!"));

        forgotPasswordTokenRepository.findByUser(user).ifPresent(forgotPasswordTokenRepository::delete);

        ForgotPasswordToken token = new ForgotPasswordToken();
        token.setUser(user);
        forgotPasswordTokenRepository.save(token);

        String resetUrl = frontendUrl + "/reset-password?token=" + token.getToken();
        // TODO: Bật lại khi có cấu hình SMTP thật
        System.out.println("[DEV] Token reset password cho " + user.getEmail() + " là: " + token.getToken());
        System.out.println("[DEV] Liên kết đặt lại: " + resetUrl);
    }

    /**
     * Đặt lại mật khẩu bằng token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        ForgotPasswordToken resetToken = forgotPasswordTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            forgotPasswordTokenRepository.delete(resetToken);
            throw new RuntimeException("Token đặt lại mật khẩu đã hết hạn.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        forgotPasswordTokenRepository.delete(resetToken);
    }

    /**
     * Tạo mã OTP 2FA và gửi qua Email
     */
    @Transactional
    public void generateAndSend2FAOtp(User user) {
        // Tạo OTP 6 số ngẫu nhiên
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpValue);

        // Lưu vào User, hết hạn sau 5 phút
        user.setTwoFactorOtp(otp);
        user.setTwoFactorOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // In ra console để debug (hoặc khi chưa cấu hình SMTP)
        System.out.println("[DEV] Mã OTP 2FA cho " + user.getEmail() + " là: " + otp);

        // Gửi qua Email (nếu đã cấu hình SMTP)
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                String targetEmail = user.getEmail();
                if (targetEmail != null && targetEmail.endsWith("@taskment.com")) {
                    targetEmail = "duongduyphuc20801@gmail.com";
                }
                message.setTo(targetEmail);
                message.setSubject("Mã xác thực đăng nhập (2FA) - Taskment");
                message.setText("Chào " + user.getUsername() + ",\n\nMã xác thực (OTP) của bạn là: " + otp + "\n\nMã này sẽ hết hạn sau 5 phút.\nNếu bạn không yêu cầu đăng nhập, vui lòng đổi mật khẩu ngay lập tức.");
                mailSender.send(message);
                System.out.println("[INFO] Đã gửi email OTP thành công tới: " + targetEmail);
            } catch (Exception e) {
                System.err.println("[ERROR] Lỗi khi gửi email OTP: " + e.getMessage() + ". Vui lòng kiểm tra lại cấu hình SMTP.");
            }
        }
    }
}
