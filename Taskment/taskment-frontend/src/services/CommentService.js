import api from './api';

const getCommentsByTaskId = (taskId) => {
    return api.get(`/tasks/${taskId}/comments`);
};

const createComment = (taskId, content) => {
    return api.post(`/tasks/${taskId}/comments`, { content });
};

const CommentService = {
    getCommentsByTaskId,
    createComment
};

export default CommentService;
