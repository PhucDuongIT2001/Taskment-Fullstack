import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ProjectService from '../services/ProjectService';
import ProjectModal from '../components/ProjectModal'; // THAY ĐỔI: Sử dụng ProjectModal

const AdminProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await ProjectService.getAllProjects();
            setProjects(response.data);
        } catch (err) {
            toast.error("Không thể tải danh sách dự án.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenModal = (project = null) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedProject(null);
        setIsModalOpen(false);
    };

    const handleSaveProject = async (projectData, projectId) => {
        try {
            if (projectId) {
                // Cập nhật dự án
                await ProjectService.updateProject(projectId, projectData);
                toast.success("💾 Đã cập nhật dự án!");
            } else {
                // Tạo dự án mới
                await ProjectService.createProject(projectData);
                toast.success("🚀 Đã tạo dự án mới!");
            }
            handleCloseModal();
            fetchProjects();
        } catch (err) {
            toast.error("Lỗi khi lưu dự án: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dự án này không? Mọi task liên quan cũng có thể bị ảnh hưởng.")) {
            try {
                await ProjectService.deleteProject(id);
                toast.success("🗑️ Đã xóa dự án.");
                fetchProjects();
            } catch (err) {
                toast.error("Lỗi khi xóa dự án.");
            }
        }
    };

    if (loading) return <div className="loading-screen">⌛ Đang tải dữ liệu Dự án...</div>;

    return (
        <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🏗️ Quản Lý Dự Án</h2>
                <button onClick={() => handleOpenModal()} className="add-task-btn">🚀 Tạo Dự Án Mới</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f2f5', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Tên Dự Án</th>
                        <th style={{ padding: '12px' }}>Mô Tả</th>
                        <th style={{ padding: '12px' }}>Người Quản Lý</th>
                        <th style={{ padding: '12px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                            <td style={{ padding: '12px' }}>{p.id}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>
                                <Link to={`/project/${p.id}`} className="project-link">{p.name}</Link>
                            </td>
                            <td style={{ padding: '12px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</td>
                            <td style={{ padding: '12px' }}>{p.ownerUsername || 'N/A'}</td>
                            <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                <button
                                    className="edit-icon-btn"
                                    onClick={() => handleOpenModal(p)}
                                    style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    ✏️ Sửa
                                </button>
                                <button
                                    className="delete-icon-btn"
                                    onClick={() => handleDeleteProject(p.id)}
                                    style={{ backgroundColor: '#fee2e2', border: '1px solid #ffccc7', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    🗑️ Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {projects.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                🚫 Chưa có dự án nào. Hãy tạo một dự án mới!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProject}
                project={selectedProject}
            />
        </div>
    );
};

export default AdminProjectManagement;
