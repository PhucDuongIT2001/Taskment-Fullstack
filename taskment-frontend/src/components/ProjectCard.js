import React from 'react';
import { FiEdit2, FiTrash2, FiUsers, FiCalendar, FiActivity } from 'react-icons/fi';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  // Helper to get color based on status
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'COMPLETED';

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--semantic-success, #10b981)' };
      case 'INACTIVE':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--semantic-error, #ef4444)' };
      case 'PLANNING':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--semantic-warning, #f59e0b)' };
      case 'COMPLETED':
        return { bg: 'rgba(99, 102, 241, 0.1)', text: 'var(--accent-primary, #6366f1)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: 'var(--text-muted, #64748b)' };
    }
  };

  const statusStyle = getStatusStyle(project.status);

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
            {project.name}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => onEdit(project)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              title="Sửa Dự án"
            >
              <FiEdit2 />
            </button>
            <button 
              onClick={() => onDelete(project.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--semantic-error, #ef4444)' }}
              title="Xóa Dự án"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.8, margin: 0, minHeight: '2.5rem' }}>
          {project.description && project.description.length > 80 
            ? `${project.description.substring(0, 80)}...` 
            : project.description || 'Chưa có mô tả'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span 
            style={{ 
              padding: '0.25rem 0.75rem', 
              background: statusStyle.bg, 
              color: statusStyle.text, 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.75rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <FiActivity size={12} /> {project.status || 'UNKNOWN'}
          </span>
          <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             <FiCalendar size={14} /> 
             {project.createAt ? new Date(project.createAt).toLocaleDateString('vi-VN') : 'N/A'}
             {project.dueDate && (
               <>
                 <span style={{ margin: '0 4px' }}>-</span>
                 <span style={{ color: isOverdue ? 'var(--semantic-error)' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                   Deadline: {new Date(project.dueDate).toLocaleDateString('vi-VN')}
                 </span>
               </>
             )}
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div 
            title="Quản lý dự án"
            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: 'white', fontWeight: 500 }}
          >
            {project.leaderUsername ? project.leaderUsername.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-sm text-muted" style={{ fontWeight: 500 }}>
             Leader: <span style={{ color: 'var(--text-color)' }}>{project.leaderUsername || 'Unknown'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
