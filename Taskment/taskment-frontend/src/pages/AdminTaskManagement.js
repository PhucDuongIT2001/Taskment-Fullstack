import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TaskService from '../services/TaskService';
import TaskForm from '../TaskForm';

const AdminTaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await TaskService.getAllTasks();
            setTasks(response.data);
        } catch (err) {
            toast.error("Không thể tải danh sách công việc hệ thống.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (taskData) => {
        try {
            await TaskService.createTask(taskData);
            toast.success("🚀 Đã tạo công việc mới!");
            setShowAddModal(false);
            fetchTasks();
        } catch (err) {
            toast.error("Lỗi khi tạo công việc: " + (err.response?.data || err.message));
        }
    };

    const handleUpdateTask = async (taskData) => {
        try {
            await TaskService.updateTask(selectedTask.id, taskData);
            toast.success("💾 Đã cập nhật công việc!");
            setSelectedTask(null);
            fetchTasks();
        } catch (err) {
            toast.error("Lỗi khi cập nhật công việc.");
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm("Admin: Bạn có chắc chắn muốn xóa công việc này không?")) {
            try {
                await TaskService.deleteTask(id);
                toast.success("🗑️ Đã xóa công việc khỏi hệ thống.");
                fetchTasks();
            } catch (err) {
                toast.error("Lỗi khi xóa công việc.");
            }
        }
    };

    if (loading) return <div className="loading-screen">⌛ Đang tải dữ liệu Task...</div>;

    return (
        <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Quản Lý Toàn Bộ Công Việc</h2>
                <button onClick={() => setShowAddModal(true)} className="add-task-btn">🚀 Thêm Công Việc</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f2f5', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Tiêu đề</th>
                        <th style={{ padding: '12px' }}>Người thực hiện</th>
                        <th style={{ padding: '12px' }}>Dự án</th>
                        <th style={{ padding: '12px' }}>Trạng thái</th>
                        <th style={{ padding: '12px' }}>Độ ưu tiên</th>
                        <th style={{ padding: '12px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                            <td style={{ padding: '12px' }}>{t.id}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{t.title}</td>
                            <td style={{ padding: '12px' }}>{t.assigneeName || 'CHƯA GIAO'}</td>
                            <td style={{ padding: '12px' }}>{t.projectName}</td>
                            <td style={{ padding: '12px' }}>
                                <span className={`badge badge-status-${t.statusName?.toLowerCase().replace(' ', '-')}`}>
                                    {t.statusName}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>{t.priorityName}</td>
                            <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                <button 
                                    className="edit-icon-btn" 
                                    onClick={() => setSelectedTask(t)}
                                    style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    ✏️ Sửa
                                </button>
                                <button 
                                    className="delete-icon-btn" 
                                    onClick={() => handleDeleteTask(t.id)}
                                    style={{ backgroundColor: '#fee2e2', border: '1px solid #ffccc7', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    🗑️ Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                                🚫 Hệ thống chưa có công việc nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* MODALS */}
            {showAddModal && (
                <TaskForm 
                    title="🚀 Tạo mới công việc hệ thống"
                    onSubmit={handleAddTask} 
                    onClose={() => setShowAddModal(false)} 
                />
            )}
            {selectedTask && (
                <TaskForm 
                    title="💾 Cập nhật công việc hệ thống"
                    initialData={selectedTask}
                    onSubmit={handleUpdateTask} 
                    onClose={() => setSelectedTask(null)} 
                />
            )}
        </div>
    );
};

export default AdminTaskManagement;
