import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import projectService from '../services/projectService';
import userService from '../services/userService';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    projectId: '', // Dùng string rỗng thay vì null để select controlled
    statusId: 1,   // Mặc định là 1 (VD: To Do)
    priorityId: '',
    assigneeId: '',
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsersAndPriorities, setLoadingUsersAndPriorities] = useState(false);

  // Load projects, users và priorities từ API khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const data = await projectService.getMyProjects();
          setProjects(data || []);
          
          // Nếu tạo mới và có dự án, tự chọn dự án đầu tiên
          if (!task && data && data.length > 0) {
            setFormData(prev => ({ ...prev, projectId: data[0].id.toString() }));
          }
        } catch (error) {
          console.error('Error fetching projects in TaskModal:', error);
        } finally {
          setLoadingProjects(false);
        }
      };

      const fetchUsersAndPriorities = async () => {
        try {
          setLoadingUsersAndPriorities(true);
          const usersData = await userService.getAllUsers();
          setUsers(usersData || []);

          const prioritiesData = await api.get('/priorities');
          setPriorities(prioritiesData.data || []);
        } catch (error) {
          console.error('Error fetching users or priorities in TaskModal:', error);
        } finally {
          setLoadingUsersAndPriorities(false);
        }
      };

      fetchProjects();
      fetchUsersAndPriorities();
    }
  }, [isOpen, task]);

  // Load task data khi mở modal (nếu là edit)
  useEffect(() => {
    if (task) {
      // Format datetime cho thẻ input type="datetime-local"
      let formattedDate = '';
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        // Chỉnh offset timezone để không bị lệch giờ khi toISOString
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        formattedDate = d.toISOString().slice(0, 16);
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: formattedDate,
        projectId: task.projectId ? task.projectId.toString() : '',
        statusId: task.statusId || 1,
        priorityId: task.priorityId ? task.priorityId.toString() : '',
        assigneeId: task.assigneeId ? task.assigneeId.toString() : '',
      });
    } else {
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        dueDate: '',
        projectId: projects.length > 0 ? projects[0].id.toString() : '',
        statusId: 1,
        priorityId: '',
        assigneeId: '',
      }));
    }
  }, [task, isOpen, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }
    if (!formData.projectId) {
      alert('Vui lòng chọn một dự án! Công việc phải được liên kết với một dự án thực tế.');
      return;
    }
    
    // Parse lại payload
    const payload = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      projectId: formData.projectId ? parseInt(formData.projectId) : null,
      statusId: parseInt(formData.statusId),
      priorityId: formData.priorityId ? parseInt(formData.priorityId) : null,
      assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
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
        width: '100%', maxWidth: '520px', padding: '2rem',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{task ? 'Sửa Công Việc' : 'Tạo Mới Công Việc'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.25rem' }}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tiêu đề *</label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleChange} required
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mô tả</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} rows={3}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Hạn chót</label>
            <input 
              type="datetime-local" name="dueDate" value={formData.dueDate} onChange={handleChange}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Dự án *</label>
              {loadingProjects ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Đang tải danh sách dự án...</span>
              ) : projects.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--semantic-error)', fontWeight: 500 }}>
                  Bạn chưa có dự án nào! Vui lòng tạo dự án trước.
                </span>
              ) : (
                <select 
                  name="projectId" 
                  value={formData.projectId} 
                  onChange={handleChange} 
                  required
                  style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', width: '100%' }}
                >
                  <option value="" disabled>-- Chọn dự án --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Trạng thái</label>
              <select name="statusId" value={formData.statusId} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', width: '100%' }}>
                <option value="1">To Do</option>
                <option value="2">In Progress</option>
                <option value="3">Done</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Người nhận việc</label>
              {loadingUsersAndPriorities ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Đang tải thành viên...</span>
              ) : (
                <select 
                  name="assigneeId" 
                  value={formData.assigneeId} 
                  onChange={handleChange} 
                  style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', width: '100%' }}
                >
                  <option value="">-- Chưa gán (Mặc định: Bạn) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName || u.username} ({u.username})</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mức độ ưu tiên</label>
              {loadingUsersAndPriorities ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Đang tải độ ưu tiên...</span>
              ) : (
                <select 
                  name="priorityId" 
                  value={formData.priorityId} 
                  onChange={handleChange} 
                  style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', width: '100%' }}
                >
                  <option value="">-- Mặc định (Medium) --</option>
                  {priorities.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)', cursor: 'pointer' }}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={projects.length === 0}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', opacity: projects.length === 0 ? 0.5 : 1 }}
            >
              Lưu Công Việc
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TaskModal;
