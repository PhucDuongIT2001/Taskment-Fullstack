package com.example.Taskment.service;

import com.example.Taskment.dto.ChangePasswordDto;
import com.example.Taskment.dto.HumanInfoDTO;
import com.example.Taskment.dto.ProjectResponseDTO;
import com.example.Taskment.dto.UserUpdateRequestDTO;
import com.example.Taskment.entity.HumanInfo;
import com.example.Taskment.entity.Role;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.HumanInfoRepository;
import com.example.Taskment.repository.ProjectMemberRepository;
import com.example.Taskment.repository.RoleRepository;
import com.example.Taskment.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final HumanInfoRepository humanInfoRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProjectMemberRepository projectMemberRepository;

    public UserService(UserRepository userRepository, HumanInfoRepository humanInfoRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, ProjectMemberRepository projectMemberRepository) {
        this.userRepository = userRepository;
        this.humanInfoRepository = humanInfoRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.projectMemberRepository = projectMemberRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // THÊM MỚI: Tìm User theo username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + username));
    }

    @Transactional
    public User updateUser(Long userId, UserUpdateRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        user.setFullName(requestDTO.getFullName());
        user.setEmail(requestDTO.getEmail());

        if (StringUtils.hasText(requestDTO.getPassword())) {
            user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        if (requestDTO.getRoleNames() != null && !requestDTO.getRoleNames().isEmpty()) {
            Set<Role> roles = requestDTO.getRoleNames().stream()
                    .map(roleName -> roleRepository.findByRole(roleName)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền: " + roleName)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordDto changePasswordDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        if (!passwordEncoder.matches(changePasswordDto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng.");
        }

        user.setPassword(passwordEncoder.encode(changePasswordDto.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        humanInfoRepository.findByUserId(userId).ifPresent(humanInfoRepository::delete);
        userRepository.deleteById(userId);
    }

    public HumanInfoDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy User ID: " + userId));
        HumanInfo info = humanInfoRepository.findByUserId(userId).orElse(new HumanInfo());
        
        return convertToDTO(user, info);
    }

    @Transactional
    public HumanInfoDTO updateProfile(Long userId, HumanInfoDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy User ID: " + userId));

        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Lỗi: Email này đã được sử dụng!");
            }
            user.setEmail(dto.getEmail());
        }
        
        user.setFullName(dto.getFullName());
        userRepository.save(user);

        HumanInfo info = humanInfoRepository.findByUserId(userId).orElseGet(() -> {
            HumanInfo newInfo = new HumanInfo();
            newInfo.setUser(user);
            return newInfo;
        });

        info.setFirstName(dto.getFirstName());
        info.setLastName(dto.getLastName());
        info.setPhoneNumber(dto.getPhoneNumber());
        info.setAddress(dto.getAddress());
        info.setDateOfBirth(dto.getDateOfBirth());
        info.setAvatarUrl(dto.getAvatarUrl());
        info.setGender(dto.getGender());
        info.setBio(dto.getBio());

        HumanInfo savedInfo = humanInfoRepository.save(info);
        return convertToDTO(user, savedInfo);
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy User ID: " + userId));

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        String uploadDir = "uploads";

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetLocation = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = "/uploads/" + uniqueFileName;

            HumanInfo info = humanInfoRepository.findByUserId(userId).orElseGet(() -> {
                HumanInfo newInfo = new HumanInfo();
                newInfo.setUser(user);
                return newInfo;
            });

            info.setAvatarUrl(fileDownloadUri);
            humanInfoRepository.save(info);

            return fileDownloadUri;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu file avatar. Vui lòng thử lại!", ex);
        }
    }

    public List<ProjectResponseDTO> getUserProjects(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy User ID: " + userId));
        
        return projectMemberRepository.findByUser(user).stream()
                .map(pm -> {
                    ProjectResponseDTO dto = new ProjectResponseDTO();
                    dto.setId(pm.getProject().getId());
                    dto.setName(pm.getProject().getName());
                    dto.setDescription(pm.getProject().getDescription());
                    dto.setStatus(pm.getProject().getStatus());
                    dto.setLeaderUsername(pm.getProject().getLeader().getUsername());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private HumanInfoDTO convertToDTO(User user, HumanInfo entity) {
        HumanInfoDTO dto = new HumanInfoDTO();
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setAddress(entity.getAddress());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setAvatarUrl(entity.getAvatarUrl());
        dto.setGender(entity.getGender());
        dto.setBio(entity.getBio());
        return dto;
    }
}
