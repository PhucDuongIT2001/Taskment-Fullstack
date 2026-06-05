import api from './api';
import AuthService from './AuthService';

const API_URL = "/users";

const getAllUsers = () => {
    return api.get(API_URL);
};

const getProfile = (userId) => {
    return api.get(`${API_URL}/${userId}/profile`);
};

const updateProfile = (userId, profileData) => {
    return api.put(`${API_URL}/${userId}/profile`, profileData);
};

const updateUser = (userId, userData) => {
    return api.put(`${API_URL}/${userId}`, userData);
};

const deleteUser = (userId) => {
    return api.delete(`${API_URL}/${userId}`);
};

const changePassword = (userId, passwordData) => {
    return api.post(`${API_URL}/${userId}/change-password`, passwordData);
};

// THÊM MỚI: Lấy danh sách dự án mà user là thành viên
const getUserProjects = (userId) => {
    return api.get(`${API_URL}/${userId}/projects`);
};


const UserService = {
    getAllUsers,
    getProfile,
    updateProfile,
    updateUser,
    deleteUser,
    changePassword,
    getUserProjects, // THÊM HÀM MỚI
    register: AuthService.register
};

export default UserService;
