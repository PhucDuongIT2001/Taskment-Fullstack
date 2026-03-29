// Nơi tập trung toàn bộ các hàm gọi API liên quan đến Authentication
const API_BASE_URL = "http://localhost:8080/api/auth";

const AuthService = {
  login: async (email, password) => {
    console.log("Gọi API Login tại AuthService:", email, password);
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Vì backend đang nhận username, ta tạm map email vào username
      body: JSON.stringify({ username: email, password: password })
    });

    if (!response.ok) {
      // Nếu lỗi (sai mật khẩu, không tồn tại...), ném lỗi ra để hiển thị thông báo
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return { success: true, user: data };
  },

  register: async (fullName, email, password) => {
    console.log("Gọi API Register tại AuthService:", fullName, email, password);
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, fullName: fullName, email: email, password: password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return { success: true };
  }
};

export default AuthService;