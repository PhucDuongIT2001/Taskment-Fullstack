# ============================================================
# Giai đoạn 1: Build artifact (Maven)
# ============================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy POM trước để tận dụng Docker layer cache
# (nếu code thay đổi nhưng pom.xml không đổi, layer này không build lại)
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

COPY src ./src
RUN mvn clean package -DskipTests -B --no-transfer-progress

# ============================================================
# Giai đoạn 2: Runtime image (chỉ chứa JRE, không có Maven/JDK)
# ============================================================
FROM eclipse-temurin:17-jre-alpine

# --- AWS Well-Architected Security: Chạy với non-root user ---
# Tạo group và user riêng cho ứng dụng
# LÝ DO: Container root user có thể leo thang đặc quyền nếu có lỗ hổng
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy artifact từ build stage
COPY --from=build /app/target/*.jar app.jar

# Đổi owner sang appuser
RUN chown -R appuser:appgroup /app

# Chuyển sang non-root user
USER appuser

# Port expose (phải khớp với ECS Task Definition containerPort)
EXPOSE 8080

# --- JVM flags tối ưu cho Container ---
# -XX:+UseContainerSupport: JVM tự phát hiện memory limit của container (không dùng host RAM)
# -XX:MaxRAMPercentage=75.0: Dùng tối đa 75% RAM của container cho JVM heap
# -Djava.security.egd=file:/dev/./urandom: Tăng tốc khởi động (không block khi thiếu entropy)
# -Dspring.profiles.active=prod: Kích hoạt profile production
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
