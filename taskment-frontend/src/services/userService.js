import api from './api';

const userService = {
  /**
   * Lấy danh sách toàn bộ người dùng trong hệ thống
   */
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  /**
   * Lấy thông tin hồ sơ của người dùng theo ID
   */
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  /**
   * Cập nhật thông tin và phân quyền người dùng (Dành cho Admin)
   */
  updateUser: async (userId, payload) => {
    const response = await api.put(`/users/${userId}`, payload);
    return response.data;
  },

  /**
   * Xóa người dùng khỏi hệ thống (Dành cho Admin)
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Tạo người dùng mới qua API register (Dành cho Admin)
   */
  createUser: async (payload) => {
    // payload: { username, email, password, fullName, roles: [{ role: 'ROLE_...' }] }
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ của người dùng (HumanInfo)
   */
  updateProfile: async (userId, payload) => {
    const response = await api.put(`/users/${userId}/profile`, payload);
    return response.data;
  },

  /**
   * Tải ảnh đại diện (avatar) của người dùng
   */
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default userService;
