import api from './api';

const API_URL = "/roles";

const getAllRoles = () => {
    return api.get(API_URL);
};

const RoleService = {
    getAllRoles
};

export default RoleService;
