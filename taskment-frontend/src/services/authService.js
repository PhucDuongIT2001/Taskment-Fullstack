import api from './api';

export const authService = {
  // Login method
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Store user info and token (for later phase with JWT)
      // Note: Currently backend returns the whole User object.
      // We will pretend we get a token or store the raw user for now.
      if (response.data) {
        // Just store the user as json string for now
        localStorage.setItem('taskment_user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error.response?.data || error.message || 'Lỗi đăng nhập không xác định';
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
