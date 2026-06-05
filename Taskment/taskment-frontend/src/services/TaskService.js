// TaskService.js - Tập trung toàn bộ các hàm gọi API liên quan đến Task (CRUD)
import api from './api';

// Đường dẫn gốc của API Task trên backend
const API_URL = "/tasks";

// [READ ALL] Lấy danh sách tất cả task của người dùng đang đăng nhập
const getMyTasks = () => {
    return api.get(API_URL);
};

// [READ ALL - REPORTER] Lấy danh sách task do người dùng hiện tại tạo ra
const getMyRequests = () => {
    return api.get(`${API_URL}/my-requests`);
};

// [ADMIN - READ ALL] Lấy danh sách toàn bộ task trong hệ thống
const getAllTasks = () => {
    return api.get(`${API_URL}/all`);
};

// [READ ALL - PROJECT] Lấy danh sách task theo Project ID
const getTasksByProjectId = (projectId) => {
    return api.get(`${API_URL}/project/${projectId}`);
};

// [READ ONE] Lấy thông tin chi tiết của một task theo ID
const getTaskById = (taskId) => {
    return api.get(`${API_URL}/${taskId}`);
};

// [CREATE] Tạo mới một task với dữ liệu truyền vào
const createTask = (taskData) => {
    return api.post(API_URL, taskData);
};

// [CREATE - CUSTOMER REQUEST] Tạo một yêu cầu mới từ khách hàng
const createCustomerRequest = (requestData) => {
    return api.post(`${API_URL}/customer-request`, requestData);
};

// [UPDATE] Cập nhật thông tin của task theo ID
const updateTask = (taskId, taskData) => {
    return api.put(`${API_URL}/${taskId}`, taskData);
};

// [DELETE] Xóa một task theo ID
const deleteTask = (taskId) => {
    return api.delete(`${API_URL}/${taskId}`);
};

// Xuất tất cả các hàm dưới dạng một object duy nhất để dễ import
const TaskService = {
    getMyTasks,
    getMyRequests,
    getAllTasks,
    getTasksByProjectId,
    getTaskById,
    createTask,
    createCustomerRequest, // THÊM HÀM MỚI
    updateTask,
    deleteTask
};

export default TaskService;
