import axios from 'axios';

// Đã đổi port sang 8888 để khớp với cấu hình mới của Backend
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8888/api'
});

export const getWebSocketUrl = () => {
    const apiURL = process.env.REACT_APP_API_URL;
    if (apiURL) {
        if (apiURL.startsWith('/')) {
            const protocol = window.location.protocol;
            const host = window.location.host;
            return `${protocol}//${host}/ws`;
        }
        return apiURL.replace(/\/api$/, '') + '/ws';
    }
    return 'http://localhost:8888/ws';
};

// Interceptor cho yêu cầu (Request)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho phản hồi (Response)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Có thể thêm logic tự động logout hoặc refresh token tại đây
            console.error("Xác thực thất bại hoặc quyền hạn bị từ chối:", error.response.data);
            // localStorage.removeItem("token");
            // window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
