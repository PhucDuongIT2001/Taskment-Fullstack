package com.example.Taskment.service;

import com.example.Taskment.entity.User;
import com.example.Taskment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

// @Service đánh dấu class này là một component chứa logic nghiệp vụ (Business Logic).
// Nhờ annotation này, Spring Boot sẽ tự động khởi tạo và quản lý class này.
@Service
public class AuthService {

    // @Autowired giúp tự động tiêm (inject) UserRepository vào AuthService.
    // Qua đó, ta có thể gọi các hàm thao tác với Database như save(), existsByUsername()...
    @Autowired
    private UserRepository userRepository;

    /**
     * Hàm xử lý logic Đăng ký tài khoản mới.
     * @param user Đối tượng chứa thông tin đăng ký (username, email, password...).
     * @return Đối tượng User sau khi đã lưu thành công vào Database.
     */
    public User register(User user) {
        // 1. Kiểm tra xem tên đăng nhập đã tồn tại trong Database chưa.
        // Nếu existsByUsername trả về true -> ném lỗi để dừng quá trình đăng ký ngay lập tức.
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Lỗi: Tên đăng nhập này đã có người sử dụng!");
        }
        
        // 2. Kiểm tra xem email đã được đăng ký bởi tài khoản khác chưa.
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Lỗi: Email này đã được đăng ký!");
        }
        
        // 3. Nếu mọi thông tin đều hợp lệ, tiến hành lưu tài khoản mới vào Database.
        // LƯU Ý: Hiện tại đang lưu mật khẩu thô (plaintext) để dễ test. 
        // Khi làm thực tế, bạn nên sử dụng BCryptPasswordEncoder để mã hóa mật khẩu ở bước này.
        return userRepository.save(user);
    }

    /**
     * Hàm xử lý logic Đăng nhập.
     * @param username Tên đăng nhập do người dùng nhập vào.
     * @param password Mật khẩu do người dùng nhập vào.
     * @return Đối tượng User lấy từ Database nếu thông tin chính xác.
     */
    public User login(String username, String password) {
        // Tìm kiếm user trong DB bằng username. 
        // Dùng Optional để bọc kết quả, giúp code an toàn và tránh lỗi NullPointerException.
        Optional<User> userOpt = userRepository.findByUsername(username);

        // Kiểm tra xem có tìm thấy user nào trùng khớp với username không
        if (userOpt.isPresent()) {
            User user = userOpt.get(); // Trích xuất đối tượng User thực tế từ Optional
            
            // So sánh mật khẩu người dùng nhập vào với mật khẩu lưu trong DB
            if (user.getPassword().equals(password)) {
                return user; // Đăng nhập thành công
            } else {
                // Sai mật khẩu -> ném ra lỗi để Controller bắt và trả về cho Frontend
                throw new RuntimeException("Lỗi: Sai mật khẩu!");
            }
        }
        
        // Nếu không tìm thấy username trong DB -> ném ra lỗi để báo không tìm thấy người dùng
        throw new RuntimeException("Lỗi: Không tìm thấy người dùng này!");
    }
}