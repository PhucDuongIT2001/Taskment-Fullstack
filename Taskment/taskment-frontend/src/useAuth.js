import { useState, useEffect } from 'react';
import AuthService, { extractErrorMessage } from './services/AuthService';
import { toast } from 'react-toastify';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token")); // Loading if we have a token to verify

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await AuthService.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (e) {
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Hàm xử lý đăng nhập
  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      if (response.requires2FA) {
        return { requires2FA: true, username: response.username, message: response.message };
      }
      if (response.success) {
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        return true;
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return extractErrorMessage(error, "Đăng nhập thất bại!");
    }
    return "Đăng nhập thất bại!";
  };

  const verify2FA = async (username, otp) => {
    try {
      const response = await AuthService.verify2FA(username, otp);
      if (response.success) {
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        return true;
      }
    } catch (error) {
      console.error("Lỗi xác thực 2FA:", error);
      return extractErrorMessage(error, "Xác thực OTP thất bại!");
    }
    return "Xác thực OTP thất bại!";
  };

  // Hàm xử lý đăng ký
  const register = async (username, fullName, email, password, confirmPassword, dateOfBirth, firstName, lastName, phoneNumber, address, roleName) => {
    try {
      const response = await AuthService.register(username, fullName, email, password, confirmPassword, dateOfBirth, firstName, lastName, phoneNumber, address, roleName);
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      return extractErrorMessage(error, "Đăng ký thất bại!");
    }
    return "Đăng ký thất bại!";
  };

  const logout = () => {
    localStorage.removeItem("token"); // XÓA TOKEN KHI ĐĂNG XUẤT
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast.info("Đã đăng xuất thành công!", {
      icon: "🚪",
      style: { borderRadius: '10px', fontWeight: 'bold' }
    });
  };

  // Nhớ trả về thêm currentUser
  return { isAuthenticated, currentUser, login, verify2FA, register, logout, loading };
};

export default useAuth;