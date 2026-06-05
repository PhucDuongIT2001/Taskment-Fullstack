import React, { useState, useEffect } from 'react';
import UserService from '../services/UserService';

function ProjectForm({ initialData, onSubmit, onClose, title }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ACTIVE',
        ownerId: ''
    });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Lấy danh sách người dùng để chọn owner
        UserService.getAllUsers()
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error("Không thể tải danh sách người dùng:", error);
            });

        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                status: initialData.status || 'ACTIVE',
                ownerId: initialData.owner?.id || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="close-x" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên Dự án</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nhập tên dự án..."
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea
                            name="description"
                            placeholder="Mô tả ngắn về mục tiêu của dự án..."
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Người quản lý (Owner)</label>
                        <select name="ownerId" value={formData.ownerId} onChange={handleChange} required>
                            <option value="">-- Chọn người quản lý --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn primary">
                            {initialData?.id ? '💾 Lưu thay đổi' : '🚀 Tạo Dự án'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProjectForm;
