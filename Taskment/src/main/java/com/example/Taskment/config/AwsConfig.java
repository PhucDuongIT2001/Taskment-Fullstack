package com.example.Taskment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * AwsConfig — Cấu hình AWS SDK v2.
 *
 * === CREDENTIAL CHAIN (Thứ tự ưu tiên của DefaultCredentialsProvider) ===
 * 1. Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * 2. Java system properties
 * 3. AWS credentials file (~/.aws/credentials)
 * 4. Container credentials (ECS Task Role) ← DÙNG TRÊN PRODUCTION
 * 5. Instance profile (EC2 Instance Role)
 *
 * Trên ECS Fargate production: ECS Task Role được gắn tự động.
 * Backend chỉ cần quyền s3:PutObject và s3:GetObject trên bucket riêng.
 * KHÔNG cần ACCESS_KEY / SECRET_KEY trên production — đây là best practice IAM.
 *
 * Trên local dev: set biến môi trường AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
 * hoặc dùng AWS CLI `aws configure`.
 */
@Configuration
public class AwsConfig {

    @Value("${aws.region:ap-southeast-1}")
    private String awsRegion;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(awsRegion))
                // DefaultCredentialsProvider tự động dùng ECS Task Role trên production
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
