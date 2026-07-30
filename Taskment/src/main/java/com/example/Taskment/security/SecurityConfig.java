package com.example.Taskment.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — Cấu hình bảo mật trung tâm.
 *
 * Nguyên tắc AWS Security Pillar được áp dụng:
 * 1. Stateless JWT (không có server-side session)
 * 2. CORS chỉ cho phép origin hợp lệ từ biến môi trường (không hardcode localhost)
 * 3. Các API nhạy cảm (users, roles) yêu cầu xác thực
 * 4. Phân quyền theo Role (ADMIN, STAFF_LEADER, CUSTOMER)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Danh sách origin được phép — lấy từ biến môi trường.
     * Ví dụ: ALLOWED_ORIGINS=https://taskment.yourdomain.com,https://www.yourdomain.com
     * Khi local dev: ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
     */
    @Value("${app.allowed-origins:http://localhost:3000,http://localhost:3001,http://localhost:3002}")
    private String allowedOriginsRaw;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints công khai
                .requestMatchers("/api/auth/**").permitAll()
                // Actuator health check (ECS health check sử dụng endpoint này)
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                // WebSocket endpoint
                .requestMatchers("/ws/**").permitAll()
                // Error handler
                .requestMatchers("/error").permitAll()

                // --- Danh mục tham chiếu: chỉ cho phép GET, yêu cầu xác thực ---
                // LÝ DO SỬA: Trước đây /api/users/** GET permit all → lộ toàn bộ user list
                // Giờ yêu cầu phải login mới xem được
                .requestMatchers(HttpMethod.GET, "/api/issueTypes/**", "/api/statuses/**", "/api/priorities/**").authenticated()

                // --- Projects: cần xác thực, phân quyền theo role ---
                .requestMatchers(HttpMethod.GET, "/api/projects/**", "/api/sprints/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/projects/**").hasAnyRole("ADMIN", "STAFF_LEADER")
                .requestMatchers(HttpMethod.PUT, "/api/projects/**").hasAnyRole("ADMIN", "STAFF_LEADER")
                .requestMatchers(HttpMethod.DELETE, "/api/projects/**").hasRole("ADMIN")

                // --- Users & Roles: chỉ Admin mới xem được danh sách đầy đủ ---
                .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/roles/**").hasRole("ADMIN")

                // --- Tasks ---
                .requestMatchers(HttpMethod.POST, "/api/tasks/customer-request").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/api/tasks/**").hasAnyRole("ADMIN", "STAFF_LEADER")
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasAnyRole("ADMIN", "STAFF_LEADER")

                // Tất cả các request còn lại yêu cầu xác thực
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Parse danh sách origin từ env var (phân cách bằng dấu phẩy)
        List<String> allowedOrigins = List.of(allowedOriginsRaw.split(","));

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "X-Requested-With",
            "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(List.of("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
