import api from './api';

class AttachmentService {
    uploadAttachment(taskId, file) {
        const formData = new FormData();
        formData.append('file', file);

        return api.post(`/tasks/${taskId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    getAttachmentsByTaskId(taskId) {
        return api.get(`/tasks/${taskId}/attachments`);
    }

    deleteAttachment(attachmentId) {
        return api.delete(`/attachments/${attachmentId}`);
    }
}

export default new AttachmentService();
