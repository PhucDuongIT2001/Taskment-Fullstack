import api from './api';

const API_URL = "/staff";

const getAllStaff = () => {
    return api.get(API_URL);
};

const getStaffById = (id) => {
    return api.get(`${API_URL}/${id}`);
};

const StaffService = {
    getAllStaff,
    getStaffById
};

export default StaffService;
