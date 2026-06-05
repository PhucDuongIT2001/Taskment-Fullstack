import api from './api';

const getMyNotifications = () => {
    return api.get('/notifications');
};

const markAllAsRead = () => {
    return api.post('/notifications/mark-as-read');
};

const NotificationService = {
    getMyNotifications,
    markAllAsRead,
};

export default NotificationService;
