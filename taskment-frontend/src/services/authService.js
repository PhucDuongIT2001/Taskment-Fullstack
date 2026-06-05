import api from './api';

export const authService = {
  // Login method
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Store user info and token for JWT
      if (response.data && response.data.accessToken) {
        localStorage.setItem('taskment_token', response.data.accessToken);
        localStorage.setItem('taskment_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error.response?.data || error.message || 'Lỗi đăng nhập không xác định';
    }
  },

  // Verify 2FA OTP method
  verify2FA: async (username, otp) => {
    try {
      const response = await api.post('/auth/verify-2fa', { username, otp });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('taskment_token', response.data.accessToken);
        localStorage.setItem('taskment_user', JSON.stringify(response.data.user));
      }
      
      return response.data.user;
    } catch (error) {
      console.error('2FA Verification Error:', error);
      throw error.response?.data || error.message || 'Mã OTP không chính xác hoặc đã hết hạn';
    }
  },

  // Resend 2FA OTP method
  resend2FA: async (username) => {
    try {
      const response = await api.post('/auth/resend-2fa', { username });
      return response.data;
    } catch (error) {
      console.error('2FA Resend Error:', error);
      throw error.response?.data || error.message || 'Không thể gửi lại mã OTP';
    }
  },

  // Google Login method
  loginWithGoogle: async (code) => {
    try {
      const response = await api.post('/auth/google', { code });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('taskment_token', response.data.accessToken);
        localStorage.setItem('taskment_user', JSON.stringify(response.data.user));
      }
      
      return response.data.user;
    } catch (error) {
      console.error('Google Login Error:', error);
      throw error.response?.data || error.message || 'Lỗi đăng nhập bằng Google thất bại!';
    }
  },

  // Register method
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register Error:', error);
      throw error.response?.data || error.message || 'Lỗi đăng ký không xác định';
    }
  },

  // Logout method
  logout: () => {
    localStorage.removeItem('taskment_user');
    localStorage.removeItem('taskment_token');
    // window.location.href = '/login'; 
  },

  // Get current logged in user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('taskment_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
