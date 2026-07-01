import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { authService } from '../services/authService';

const TaskItem = ({ task, onEdit, onDelete, onStatusChange }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isCustomer = currentUser && currentUser.roles && currentUser.roles.some(r => r.role === 'ROLE_CUSTOMER');

  // Màu sắc theo trạng thái
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

  // Click vào vùng card chính → điều hướng đến TaskDetailPage
  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  // Ngăn event bubble khi click vào action buttons
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div
      id={`task-card-${task.id}`}
      className="glass-panel"
      style={{
        padding: '1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: task.overdue
          ? '4px solid var(--semantic-error, #ef4444)'
          : '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        if (!task.overdue) e.currentTarget.style.borderLeftColor = 'rgba(99,102,241,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        if (!task.overdue) e.currentTarget.style.borderLeftColor = 'var(--border-color)';
      }}
      role="button"
      tabIndex={0}
      aria-label={`Xem chi tiết task: ${task.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.125rem', margin: '0 0 0.25rem 0', fontWeight: 600 }}>
            {task.title}
          </h3>
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            {task.projectName ? `Dự án: ${task.projectName}` : 'Chưa xếp vào dự án'}
          </p>
        </div>

        {!isCustomer && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
            onClick={stopPropagation}
          >
            {/* Nút sửa */}
            <button
              id={`btn-edit-task-${task.id}`}
              onClick={(e) => { stopPropagation(e); onEdit(task); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '0.25rem',
                borderRadius: '4px', transition: 'color 0.15s',
              }}
              title="Sửa task"
              aria-label={`Sửa task ${task.title}`}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <FiEdit2 />
            </button>

            {/* Nút xóa */}
            <button
              id={`btn-delete-task-${task.id}`}
              onClick={(e) => { stopPropagation(e); onDelete(task.id); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--semantic-error, #ef4444)', padding: '0.25rem',
                borderRadius: '4px', transition: 'opacity 0.15s',
              }}
              title="Xóa task"
              aria-label={`Xóa task ${task.title}`}
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-sm" style={{ margin: 0, color: 'var(--text-color)', opacity: 0.8 }}>
          {task.description.length > 120
            ? task.description.substring(0, 120) + '...'
            : task.description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
        <div
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          onClick={stopPropagation}
        >
          {/* Badge trạng thái – click để đổi nhanh */}
          <span
            style={{
              padding: '0.25rem 0.75rem',
              background: statusStyle.bg,
              color: statusStyle.text,
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: isCustomer ? 'default' : 'pointer',
              transition: 'opacity 0.15s',
            }}
            onClick={(e) => { stopPropagation(e); !isCustomer && onStatusChange(task); }}
            title={isCustomer ? "Trạng thái công việc" : "Nhấn để đổi trạng thái"}
          >
            {task.statusName || 'N/A'}
          </span>

          {/* Issue Type */}
          {task.issueTypeName && (
            <span
              className="text-xs"
              style={{
                padding: '0.15rem 0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-muted)',
              }}
            >
              {task.issueTypeName}
            </span>
          )}

          {/* Badge Customer Request */}
          {task.isCustomerRequest && (
            <span
              className="text-xs"
              style={{
                padding: '0.15rem 0.5rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f97316',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '4px',
                fontWeight: 600
              }}
            >
              Yêu cầu Khách hàng
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span
            className="text-sm text-muted"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              color: task.overdue ? 'var(--semantic-error, #ef4444)' : 'var(--text-muted)',
            }}
          >
            <FiClock />
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('vi-VN')
              : 'Không có hạn'}
          </span>

          {task.assigneeName && (
            <div
              title={`Người nhận: ${task.assigneeName}`}
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', color: 'white', fontWeight: 700,
              }}
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
