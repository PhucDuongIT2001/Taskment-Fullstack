import api from './api';

const API_URL = "/customers";

const getAllCustomers = () => {
    return api.get(API_URL);
};

const getCustomerById = (id) => {
    return api.get(`${API_URL}/${id}`);
};

const CustomerService = {
    getAllCustomers,
    getCustomerById
};

export default CustomerService;
