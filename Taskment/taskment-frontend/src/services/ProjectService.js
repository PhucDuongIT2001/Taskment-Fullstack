import api from './api';

const API_URL = "/projects";

const getAllProjects = () => {
    return api.get(API_URL);
};

const getMyProjects = () => {
    return api.get(`${API_URL}/my`);
};

const getProjectById = (projectId) => {
    return api.get(`${API_URL}/${projectId}`);
};

const createProject = (projectData) => {
    return api.post(API_URL, projectData);
};

const updateProject = (projectId, projectData) => {
    return api.put(`${API_URL}/${projectId}`, projectData);
};

const deleteProject = (projectId) => {
    return api.delete(`${API_URL}/${projectId}`);
};

const exportProjectReport = (projectId) => {
    return api.get(`${API_URL}/${projectId}/export`, {
        responseType: 'blob' // Quan trọng để nhận file
    });
};

const ProjectService = {
    getAllProjects,
    getMyProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    exportProjectReport
};

export default ProjectService;
