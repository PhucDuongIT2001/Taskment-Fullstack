import api from './api';

const attachmentService = {
  /**
   * Upload file đính kèm cho một task
   * @param {number} taskId - ID của task
   * @param {File} file - File object từ input/drag-drop
   * @param {function} onUploadProgress - Callback nhận progress (0-100)
   * @returns {Promise<AttachmentDTO>}
   */
  uploadAttachment: async (taskId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách file đính kèm của một task
   * @param {number} taskId - ID của task
   * @returns {Promise<AttachmentDTO[]>}
   */
  getAttachments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  /**
   * Xóa một file đính kèm
   * @param {number} taskId - ID của task
   * @param {number} attachmentId - ID của attachment cần xóa
   * @returns {Promise<string>}
   */
  deleteAttachment: async (taskId, attachmentId) => {
    const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  },
};

export default attachmentService;
