import React, { useState, useEffect } from 'react';
import ProjectService from './services/ProjectService';
import UserService from './services/UserService';
import api from './services/api';

/**
 * TaskForm - Component Giao diện thuần (Pure UI) cho việc nhập liệu.
 * Dùng chung cho cả Thêm mới và Chỉnh sửa.
 */
function TaskForm({ initialData, onSubmit, onClose, title }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        storyPoints: '',
        dueDate: '',
        projectId: '',
        statusId: '',
        priorityId: '',
        assigneeId: '',
        sprintId: '', // Thêm các trường mới
        issueTypeId: '',
        ...initialData
    });

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);

    useEffect(() => {
        // Load các danh mục cần thiết cho Dropdown
        Promise.all([
            ProjectService.getAllProjects().catch(() => ({ data: [] })),
            UserService.getAllUsers().catch(() => ({ data: [] })),
            api.get('/statuses').catch(() => ({ data: [] })),
            api.get('/priorities').catch(() => ({ data: [] })),
            // Tạm thời bỏ lỗi nạp Sprints và IssueTypes vì backend chưa có controller cho 2 cái này
            api.get('/sprints').catch(() => ({ data: [] })),
            api.get('/issueTypes').catch(() => ({ data: [] }))
        ]).then(([projRes, userRes, statRes, prioRes, sprintRes, issueRes]) => {
            setProjects(projRes.data || []);
            setUsers(userRes.data || []);
            setStatuses(statRes.data || []);
            setPriorities(prioRes.data || []);
            setSprints(sprintRes.data || []);
            setIssueTypes(issueRes.data || []);
        }).catch(err => console.error("Lỗi nạp dữ liệu form:", err));

        if (initialData) {
            setFormData(prev => ({ 
                ...prev, 
                ...initialData,
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : ''
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Chuẩn bị dữ liệu gửi đi: chuyển ID sang số (nếu có) hoặc null
        const submitData = {
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate ? formData.dueDate + "T23:59:59" : null,
            storyPoints: formData.storyPoints ? parseInt(formData.storyPoints, 10) : null,
            projectId: formData.projectId ? parseInt(formData.projectId, 10) : null,
            statusId: formData.statusId ? parseInt(formData.statusId, 10) : null,
            priorityId: formData.priorityId ? parseInt(formData.priorityId, 10) : null,
            assigneeId: formData.assigneeId ? parseInt(formData.assigneeId, 10) : null,
            sprintId: formData.sprintId ? parseInt(formData.sprintId, 10) : null,
            issueTypeId: formData.issueTypeId ? parseInt(formData.issueTypeId, 10) : null
        };

        onSubmit(submitData);
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
                        <label>Tiêu đề công việc</label>
                        <input 
                            type="text" 
                            name="title" 
                            placeholder="Tên công việc là gì?"
                            value={formData.title} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mô tả chi tiết</label>
                        <textarea 
                            name="description" 
                            placeholder="Mô tả cụ thể nhiệm vụ..."
                            value={formData.description} 
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Dự án</label>
                            <select name="projectId" value={formData.projectId} onChange={handleChange} required>
                                <option value="">-- Chọn dự án --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Loại công việc (Issue Type)</label>
                            <select name="issueTypeId" value={formData.issueTypeId} onChange={handleChange}>
                                <option value="">-- Chọn loại --</option>
                                {issueTypes.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="statusId" value={formData.statusId} onChange={handleChange} required>
                                <option value="">-- Chọn trạng thái --</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Độ ưu tiên</label>
                            <select name="priorityId" value={formData.priorityId} onChange={handleChange} required>
                                <option value="">-- Chọn độ ưu tiên --</option>
                                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Sprint (Chu kỳ làm việc)</label>
                            <select name="sprintId" value={formData.sprintId} onChange={handleChange}>
                                <option value="">-- Chọn Sprint (Tùy chọn) --</option>
                                {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Hạn chót (Deadline)</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Người thực hiện</label>
                            <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} required>
                                <option value="">-- Giao cho ai? --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Story Points (Điểm độ khó)</label>
                            <input
                                type="number"
                                name="storyPoints"
                                placeholder="VD: 3, 5, 8"
                                value={formData.storyPoints}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn primary">
                            {initialData?.id ? '💾 Lưu thay đổi' : '🚀 Tạo mới ngay'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskForm;
