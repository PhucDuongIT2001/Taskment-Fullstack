package com.example.Taskment.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    // Đường dẫn gốc của Frontend để gắn link vào Email
    private final String FRONTEND_URL = "http://localhost:3001";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendNotificationEmail(String toEmail, String recipientName, String type, String message, String linkPath) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);

            String subject = "Thông báo từ Taskment";
            String title = "Thông báo mới";
            String color = "#3b82f6"; // Màu xanh blue mặc định

            // Phân loại thông báo
            switch (type) {
                case "TASK_ASSIGNED":
                    subject = "📌 Bạn được giao một công việc mới";
                    title = "Công việc mới được giao";
                    color = "#10b981"; // Xanh lá
                    break;
                case "PROJECT_ASSIGNED":
                    subject = "🚀 Bạn đã được thêm vào dự án mới";
                    title = "Dự án mới";
                    color = "#8b5cf6"; // Tím
                    break;
                case "OVERDUE":
                    subject = "🔥 CẢNH BÁO: Công việc đã QUÁ HẠN!";
                    title = "Công việc Quá Hạn";
                    color = "#ef4444"; // Đỏ
                    break;
                case "DEADLINE_1H":
                    subject = "⏰ GẤP: Công việc sắp hết hạn trong 1 Giờ!";
                    title = "Sắp hết hạn (1 giờ)";
                    color = "#f97316"; // Cam
                    break;
                case "DEADLINE_12H":
                case "DEADLINE_24H":
                    subject = "⏳ NHẮC NHỞ: Công việc sắp tới hạn";
                    title = "Sắp hết hạn";
                    color = "#eab308"; // Vàng
                    break;
            }

            String fullLink = FRONTEND_URL + linkPath;

            String htmlContent = buildHtmlTemplate(recipientName, title, message, fullLink, color);

            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            System.out.println("Đã gửi email thông báo thành công tới: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Lỗi khi gửi email thông báo tới " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildHtmlTemplate(String name, String title, String message, String link, String color) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "<style>\n" +
                "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }\n" +
                "  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }\n" +
                "  .header { background-color: " + color + "; padding: 30px 20px; text-align: center; color: white; }\n" +
                "  .header h1 { margin: 0; font-size: 24px; font-weight: 600; }\n" +
                "  .content { padding: 30px; color: #374151; line-height: 1.6; font-size: 16px; }\n" +
                "  .content h2 { color: #111827; font-size: 20px; margin-top: 0; }\n" +
                "  .message-box { background-color: #f9fafb; border-left: 4px solid " + color + "; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; font-style: italic; }\n" +
                "  .button-container { text-align: center; margin: 35px 0 20px; }\n" +
                "  .button { display: inline-block; background-color: " + color + "; color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: opacity 0.2s; }\n" +
                "  .button:hover { opacity: 0.9; }\n" +
                "  .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }\n" +
                "</style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"container\">\n" +
                "    <div class=\"header\">\n" +
                "      <h1>Taskment Notification</h1>\n" +
                "    </div>\n" +
                "    <div class=\"content\">\n" +
                "      <h2>Xin chào " + name + ",</h2>\n" +
                "      <p>Hệ thống Taskment vừa ghi nhận một <strong>" + title.toLowerCase() + "</strong> dành cho bạn.</p>\n" +
                "      <div class=\"message-box\">\n" +
                "        \"" + message + "\"\n" +
                "      </div>\n" +
                "      <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và xử lý kịp thời.</p>\n" +
                "      <div class=\"button-container\">\n" +
                "        <a href=\"" + link + "\" class=\"button\">Xem Chi Tiết</a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    <div class=\"footer\">\n" +
                "      <p>Email này được gửi tự động từ hệ thống Taskment. Vui lòng không trả lời.</p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
