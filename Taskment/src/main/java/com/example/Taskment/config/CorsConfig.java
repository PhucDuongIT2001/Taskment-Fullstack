package com.example.Taskment.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Cho phép tất cả các đường dẫn bắt đầu bằng /api/
                .allowedOrigins("http://localhost:3000") // Chỉ cho phép frontend từ localhost:3000 gọi vào
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức được phép
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}