import React from 'react';
import { FiClock, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';

const TaskItem = ({ task, onEdit, onDelete, onStatusChange }) => {
  // Mock function to determine color based on status or priority
  const getStatusColor = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'done':
      case 'hoàn thành':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--semantic-success, #10b981)' };
      case 'in progress':
      case 'đang làm':
        return { bg: 'rgba(99, 102, 241, 0.1)', text: 'var(--accent-primary, #6366f1)' };
      case 'to do':
      case 'chưa làm':
        return { bg: 'rgba(100, 116, 139, 0.1)', text: 'var(--text-muted, #64748b)' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.1)', text: 'var(--accent-primary, #6366f1)' };
    }
  };

  const statusStyle = getStatusColor(task.statusName);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '1.25rem', 
        marginBottom: '1rem',
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: task.overdue ? '4px solid var(--semantic-error, #ef4444)' : '1px solid var(--border-color)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', margin: '0 0 0.25rem 0', fontWeight: 600 }}>{task.title}</h3>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            {task.projectName ? `Dự án: ${task.projectName}` : 'Chưa xếp vào dự án'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Nút sửa */}
          <button 
            onClick={() => onEdit(task)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
            title="Sửa"
          >
            <FiEdit2 />
          </button>
          
          {/* Nút xóa */}
          <button 
            onClick={() => onDelete(task.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--semantic-error, #ef4444)', padding: '0.25rem' }}
            title="Xóa"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm" style={{ margin: 0, color: 'var(--text-color)', opacity: 0.8 }}>
          {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Trạng thái */}
          <span 
            style={{ 
              padding: '0.25rem 0.75rem', 
              background: statusStyle.bg, 
              color: statusStyle.text, 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.75rem', 
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => onStatusChange(task)}
            title="Nhấn để đổi trạng thái"
          >
            {task.statusName || 'N/A'}
          </span>

          {/* Issue Type (nếu có) */}
          {task.issueTypeName && (
             <span className="text-xs" style={{ padding: '0.15rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
               {task.issueTypeName}
             </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: task.overdue ? 'var(--semantic-error, #ef4444)' : 'var(--text-muted)' }}>
            <FiClock /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}
          </span>
          {task.assigneeName && (
             <div 
               title={`Người nhận: ${task.assigneeName}`}
               style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'white' }}
             >
               {task.assigneeName.charAt(0).toUpperCase()}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
