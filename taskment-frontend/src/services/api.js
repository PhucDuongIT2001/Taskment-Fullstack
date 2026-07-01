import axios from 'axios';

const getBaseURL = () => {
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  return isProd ? '/api' : 'http://localhost:8888/api';
};

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || getBaseURL(), // Backend base URL dynamic for local/production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if we have one (preparation for JWT phase)
api.interceptors.request.use(
  (config) => {
    // Check if token exists in local storage
    const token = localStorage.getItem('taskment_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and maybe redirect to login
      localStorage.removeItem('taskment_token');
      localStorage.removeItem('taskment_user');
      // window.location.href = '/login'; // Optional: Redirect
    }
    return Promise.reject(error);
  }
);

export default api;
