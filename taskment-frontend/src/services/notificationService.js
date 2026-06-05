import api from './api';

const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   */
  getMyNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-as-read');
    return response.data;
  }
};

export default notificationService;
