import api from './api';

const getProjectMembers = (projectId) => {
    return api.get(`/projects/${projectId}/members`);
};

const addProjectMember = (projectId, userId, role) => {
    return api.post(`/projects/${projectId}/members`, { userId, role });
};

const removeProjectMember = (projectId, userId) => {
    return api.delete(`/projects/${projectId}/members/${userId}`);
};

const ProjectMemberService = {
    getProjectMembers,
    addProjectMember,
    removeProjectMember
};

export default ProjectMemberService;
