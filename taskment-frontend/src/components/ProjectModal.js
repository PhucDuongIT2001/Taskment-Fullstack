import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { authService } from '../services/authService';
import userService from '../services/userService';

const ProjectModal = ({ isOpen, onClose, onSave, project = null }) => {
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser ? currentUser.id : null; // Giả sử authService trả về object có id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    dueDate: '',
    leaderId: currentUserId || '' // Mặc định tự gán cho user đang tạo
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'ACTIVE',
        dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
        leaderId: project.leaderId || currentUserId || '' // API list đôi khi không trả id mà chỉ trả leaderUsername
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'ACTIVE',
        dueDate: '',
        leaderId: currentUserId || ''
      });
    }
  }, [project, isOpen, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập tên dự án!');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      dueDate: formData.dueDate ? formData.dueDate + "T23:59:59" : null,
      // Nếu API đòi ID leader, ta truyền vào. Nếu không truyền, BE thường lấy theo người đang login.
      leaderId: formData.leaderId ? parseInt(formData.leaderId) : null
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '500px', padding: '2rem',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{project ? 'Cập Nhật Dự Án' : 'Tạo Dự Án Mới'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.25rem' }}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tên Dự Án *</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              placeholder="VD: Taskment Frontend..."
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mô tả chi tiết</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} rows={4}
              placeholder="Mô tả mục tiêu của dự án..."
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Trạng thái Dự Án</label>
            <select name="status" value={formData.status} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}>
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="PLANNING">PLANNING (Đang lên kế hoạch)</option>
              <option value="INACTIVE">INACTIVE (Đã tạm dừng)</option>
              <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Trưởng nhóm / Người quản lý (Leader) *</label>
            <select 
              name="leaderId" 
              value={formData.leaderId} 
              onChange={handleChange} 
              required 
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', outline: 'none' }}
            >
              <option value="" style={{ background: '#0f172a', color: 'white' }}>-- Chọn Leader --</option>
              {users.map(u => {
                const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0].role.replace('ROLE_', '') : '';
                const roleLabel = primaryRole ? ` - [${primaryRole}]` : '';
                return (
                  <option key={u.id} value={u.id} style={{ background: '#0f172a', color: 'white' }}>
                    {u.fullName || u.username} (@{u.username}){roleLabel}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Hạn chót (Deadline)</label>
            <input 
              type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px' }}>
              {project ? 'Lưu Thay Đổi' : 'Khởi Tạo Dự Án'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
