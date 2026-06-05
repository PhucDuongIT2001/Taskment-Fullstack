import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProjectService from '../services/ProjectService';
import TaskService from '../services/TaskService';
import api from '../services/api'; // Import api để lấy statuses
import { toast } from 'react-toastify';
import TaskCard from '../TaskCard';
import ProjectMembers from '../components/ProjectMembers';
import KanbanBoard from '../components/KanbanBoard';

const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]); // State cho các cột Kanban
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'kanban'

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            ProjectService.getProjectById(projectId),
            TaskService.getTasksByProjectId(projectId),
            api.get('/statuses') // Lấy danh sách các trạng thái
        ]).then(([projectRes, tasksRes, statusesRes]) => {
            setProject(projectRes.data);
            setTasks(tasksRes.data);
            setStatuses(statusesRes.data);
        }).catch(err => {
            toast.error("Không thể tải dữ liệu chi tiết dự án.");
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleExportReport = async () => {
        try {
            const response = await ProjectService.exportProjectReport(projectId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bao_cao_du_an_${projectId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Tải báo cáo thành công!");
        } catch (error) {
            toast.error("Không thể xuất báo cáo.");
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    if (loading) {
        return <div className="loading-screen">⌛ Đang tải chi tiết dự án...</div>;
    }

    if (!project) {
        return (
            <div className="empty-state">
                <h2>🚫 Không tìm thấy dự án</h2>
                <p>Dự án bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <Link to="/" className="submit-btn primary">Quay lại trang chủ</Link>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div className="content-header">
                <div>
                    <h1 className="title">🏗️ {project.name}</h1>
                    <p style={{ color: '#65676b' }}>{project.description}</p>
                </div>
            </div>

            <div className="project-detail-layout">
                <div className="project-main-content">
                    <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0 }}>Thông tin chi tiết</h3>
                        <p><strong>Người quản lý:</strong> {project.ownerUsername}</p>
                        <p><strong>Trạng thái:</strong> <span className={`badge status-${project.status?.toLowerCase()}`}>{project.status}</span></p>
                        <p><strong>Ngày tạo:</strong> {new Date(project.createAt).toLocaleDateString()}</p>
                    </div>

                    <div className="content-header" style={{ marginTop: '20px' }}>
                        <h2 className="title">Công việc trong dự án ({tasks.length})</h2>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={handleExportReport} className="submit-btn primary" style={{ margin: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                📥 Xuất Báo Cáo
                            </button>
                            <div className="view-mode-toggle">
                                <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>Lưới</button>
                                <button onClick={() => setViewMode('kanban')} className={viewMode === 'kanban' ? 'active' : ''}>Bảng</button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="task-grid">
                            {tasks.length > 0 ? (
                                tasks.map(t => (
                                    <TaskCard
                                        key={t.id}
                                        task={t}
                                        canManage={true}
                                    />
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>Dự án này chưa có công việc nào.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <KanbanBoard initialTasks={tasks} statuses={statuses} fetchData={fetchData} />
                    )}
                    
                </div>
                <div className="project-sidebar-content">
                    <ProjectMembers projectId={projectId} />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;
