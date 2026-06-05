package com.example.Taskment.service;

import com.example.Taskment.entity.Role;
import com.example.Taskment.entity.User;
import com.example.Taskment.repository.RoleRepository;
import com.example.Taskment.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Set;
import java.util.UUID;

@Service
public class OAuth2Service {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    private final String GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";
    private final String GOOGLE_USERINFO_URI = "https://www.googleapis.com/oauth2/v3/userinfo";
    // Redirect URI phải khớp với cấu hình trên Google Console.
    // Dùng biến môi trường APP_BASE_URL để tự động chọn URL đúng (local hoặc production).
    @Value("${app.base-url:http://taskment.54.179.62.168.nip.io}")
    private String appBaseUrl;

    private String getRedirectUri() {
        return appBaseUrl + "/auth/callback";
    }

    @Transactional
    public User processGoogleLogin(String authorizationCode) {
        // 1. Dùng authorization_code để lấy access_token từ Google
        String accessToken = getAccessToken(authorizationCode);

        // 2. Dùng access_token để lấy thông tin người dùng từ Google
        JsonNode userInfo = getUserInfo(accessToken);

        String email = userInfo.get("email").asText();
        String fullName = userInfo.get("name").asText();
        String pictureUrl = userInfo.get("picture").asText(); // Có thể dùng để làm avatar

        // 3. Xử lý logic đăng nhập hoặc đăng ký
        return userRepository.findByEmail(email)
                .orElseGet(() -> registerNewUserFromGoogle(email, fullName, pictureUrl));
    }

    private String getAccessToken(String authorizationCode) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", authorizationCode);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", getRedirectUri());
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(GOOGLE_TOKEN_URI, request, JsonNode.class);
        return response.getBody().get("access_token").asText();
    }

    private JsonNode getUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>("", headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(GOOGLE_USERINFO_URI, HttpMethod.GET, request, JsonNode.class);
        return response.getBody();
    }

    private User registerNewUserFromGoogle(String email, String fullName, String pictureUrl) {
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        // Username có thể là phần đầu của email hoặc một UUID để đảm bảo tính duy nhất
        newUser.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4));
        // Mật khẩu ngẫu nhiên, vì người dùng sẽ không dùng nó để đăng nhập
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        
        // Gán vai trò mặc định
        Role customerRole = roleRepository.findByRole("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy vai trò mặc định ROLE_CUSTOMER"));
        newUser.setRoles(Set.of(customerRole));

        // TODO: Có thể lưu pictureUrl vào HumanInfo nếu muốn
        
        return userRepository.save(newUser);
    }
}
