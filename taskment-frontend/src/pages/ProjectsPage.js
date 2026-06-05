import React, { useState, useEffect } from 'react';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import projectService from '../services/projectService';
import { authService } from '../services/authService';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // Kiểm tra nếu là ADMIN thì lấy tất cả dự án, ngược lại lấy dự án cá nhân
      const currentUser = authService.getCurrentUser();
      const isAdmin = currentUser && currentUser.roles && currentUser.roles.some(r => r.role === 'ROLE_ADMIN');
      
      const data = isAdmin 
        ? await projectService.getAllProjects() 
        : await projectService.getMyProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Không thể tải danh sách dự án. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateOrUpdate = async (projectData) => {
    try {
      if (editingProject) {
        // Update
        await projectService.updateProject(editingProject.id, projectData);
      } else {
        // Create
        await projectService.createProject(projectData);
      }
      setIsModalOpen(false);
      loadProjects(); // Reload lại list
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Đã xảy ra lỗi khi lưu dự án: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.');
    if (!confirmDelete) return;

    try {
      await projectService.deleteProject(projectId);
      loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      if (err.response?.status === 403) {
        alert('Bạn không có quyền xóa dự án này! Chỉ Trưởng dự án (Leader) mới được phép xóa.');
      } else {
        alert('Đã xảy ra lỗi khi xóa dự án: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="loader">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Quản lý Dự án</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Quản lý và giám sát tiến độ các dự án của bạn.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <FiPlus /> Tạo Dự Án Mới
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--semantic-error)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Chưa có dự án nào</h3>
          <p style={{ color: 'var(--text-muted)', opacity: 0.8 }}>Bấm vào "Tạo Dự Án Mới" để bắt đầu.</p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateOrUpdate}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;
