import api from './api';

const getWatchersByTaskId = (taskId) => {
    return api.get(`/tasks/${taskId}/watchers`);
};

const addWatcher = (taskId, userId) => {
    return api.post(`/tasks/${taskId}/watchers`, { userId });
};

const removeWatcher = (taskId, userId) => {
    return api.delete(`/tasks/${taskId}/watchers/${userId}`);
};

const TaskWatcherService = {
    getWatchersByTaskId,
    addWatcher,
    removeWatcher
};

export default TaskWatcherService;
