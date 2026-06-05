import api from './api';

const projectService = {
  /**
   * Lấy danh sách toàn bộ dự án
   * (Chỉ dành cho ADMIN hoặc LEADER nếu API yêu cầu)
   */
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  /**
   * Lấy danh sách dự án của người dùng hiện tại
   */
  getMyProjects: async () => {
    const response = await api.get('/projects/my');
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một dự án theo ID
   */
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  /**
   * Lấy danh sách task thuộc 1 dự án
   */
  getTasksByProjectId: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  /**
   * Tạo dự án mới
   * payload: { name, description, status, leaderId }
   */
  createProject: async (payload) => {
    const response = await api.post('/projects', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin dự án
   */
  updateProject: async (projectId, payload) => {
    const response = await api.put(`/projects/${projectId}`, payload);
    return response.data;
  },

  /**
   * Xóa dự án
   */
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  }
};

export default projectService;
