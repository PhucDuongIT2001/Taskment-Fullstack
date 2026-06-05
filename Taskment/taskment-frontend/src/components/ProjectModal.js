import React, { useState, useEffect } from 'react';
import './TaskModal.css'; // Tận dụng lại CSS của TaskModal

const ProjectModal = ({ project, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dueDate: '',
        ownerId: '' // Giả sử chúng ta cần chọn owner cho dự án
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
                ownerId: project.ownerId || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                dueDate: '',
                ownerId: ''
            });
        }
    }, [project, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            dueDate: formData.dueDate ? formData.dueDate + "T23:59:59" : null
        };
        onSave(submitData, project ? project.id : null);
    };

    // Dữ liệu giả cho dropdown owner - Sẽ thay thế bằng API call sau
    const users = [{ id: 1, fullName: 'Admin' }, { id: 2, fullName: 'Leader A' }];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{project ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên dự án</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Hạn chót (Deadline)</label>
                        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Người quản lý (Owner)</label>
                        <select name="ownerId" value={formData.ownerId} onChange={handleChange} required>
                            <option value="">-- Chọn người quản lý --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                        </select>
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

export default ProjectModal;
