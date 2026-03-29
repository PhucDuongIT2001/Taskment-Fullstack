import { useState } from 'react';
import AuthService from './AuthService';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Thêm state để lưu thông tin người dùng đang đăng nhập
  const [currentUser, setCurrentUser] = useState(null);

  // Hàm xử lý đăng nhập
  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      if (response.success) {
        setIsAuthenticated(true);
        setCurrentUser(response.user); // Lưu dữ liệu user từ Backend trả về
        alert("Đăng nhập thành công!");
        return true; // Trả về true báo hiệu form đã xử lý xong
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert(error.message || "Đăng nhập thất bại!");
    }
    return false;
  };

  // Hàm xử lý đăng ký
  const register = async (fullName, email, password, dateOfBirth, avatarUrl) => {
    try {
      const response = await AuthService.register(fullName, email, password, dateOfBirth, avatarUrl);
      if (response.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        return true;
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert(error.message || "Đăng ký thất bại!");
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null); // Xóa thông tin khi đăng xuất
  };

  // Nhớ trả về thêm currentUser
  return { isAuthenticated, currentUser, login, register, logout };
};

export default useAuth;