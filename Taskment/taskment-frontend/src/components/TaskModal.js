import React, { useState, useEffect } from 'react';
import './TaskModal.css'; // Sẽ tạo file CSS này sau

const TaskModal = ({ task, isOpen, onClose, onSave, projectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeId: '',
        priorityId: '',
        statusId: '',
        storyPoints: 0,
    });

    // Khi prop `task` thay đổi (khi mở modal để chỉnh sửa), cập nhật form
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                assigneeId: task.assigneeId || '',
                priorityId: task.priorityId || '',
                statusId: task.statusId || '',
                storyPoints: task.storyPoints || 0,
            });
        } else {
            // Reset form khi mở modal để tạo mới
            setFormData({
                title: '',
                description: '',
                assigneeId: '',
                priorityId: '',
                statusId: '',
                storyPoints: 0,
            });
        }
    }, [task, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskDataToSave = {
            ...formData,
            projectId: task ? task.projectId : projectId, // Lấy projectId từ task có sẵn hoặc từ prop
        };
        onSave(taskDataToSave, task ? task.id : null);
    };

    // Dữ liệu giả cho các dropdown - Sẽ thay thế bằng API call sau
    const users = [{ id: 1, name: 'User A' }, { id: 2, name: 'User B' }];
    const priorities = [{ id: 1, name: 'High' }, { id: 2, name: 'Medium' }];
    const statuses = [{ id: 1, name: 'TO DO' }, { id: 2, name: 'IN PROGRESS' }];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{task ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tiêu đề</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Người thực hiện</label>
                            <select name="assigneeId" value={formData.assigneeId} onChange={handleChange}>
                                <option value="">-- Chọn người --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Độ ưu tiên</label>
                            <select name="priorityId" value={formData.priorityId} onChange={handleChange}>
                                <option value="">-- Chọn độ ưu tiên --</option>
                                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="form-row">
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="statusId" value={formData.statusId} onChange={handleChange}>
                                <option value="">-- Chọn trạng thái --</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Story Points</label>
                            <input type="number" name="storyPoints" value={formData.storyPoints} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-save">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
