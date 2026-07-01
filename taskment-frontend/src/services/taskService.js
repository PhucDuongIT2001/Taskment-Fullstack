import api from './api';

const taskService = {
  /**
   * Lấy danh sách task của người dùng
   */
  getMyTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  /**
   * Lấy danh sách toàn bộ task trong hệ thống (ADMIN)
   */
  getAllTasks: async () => {
    const response = await api.get('/tasks/all');
    return response.data;
  },

  /**
   * Lấy task theo Project ID
   */
  getTasksByProjectId: async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  /**
   * Lấy chi tiết một task
   */
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Tạo task mới
   * payload: { title, description, dueDate, projectId, statusId, priorityId, issueTypeId, assigneeId... }
   */
  createTask: async (payload) => {
    const response = await api.post('/tasks', payload);
    return response.data;
  },

  /**
   * Cập nhật toàn bộ task
   */
  updateTask: async (taskId, payload) => {
    const response = await api.put(`/tasks/${taskId}`, payload);
    return response.data;
  },

  /**
   * Cập nhật trạng thái nhanh
   * payload: { newStatusId }
   */
  updateTaskStatus: async (taskId, newStatusId) => {
    const response = await api.put(`/tasks/${taskId}/status`, { newStatusId });
    return response.data;
  },

  /**
   * Xóa task
   */
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Lấy danh sách yêu cầu của khách hàng hiện tại
   */
  getMyRequests: async () => {
    const response = await api.get('/tasks/my-requests');
    return response.data;
  },

  /**
   * Tạo yêu cầu khách hàng mới
   */
  createCustomerRequest: async (payload) => {
    const response = await api.post('/tasks/customer-request', payload);
    return response.data;
  }
};

export default taskService;
