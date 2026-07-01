import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiClock,
  FiUser,
  FiTag,
  FiFlag,
  FiCalendar,
  FiMessageSquare,
  FiActivity,
  FiPaperclip,
  FiSend,
  FiEdit2,
  FiCheckCircle,
} from 'react-icons/fi';
import taskService from '../services/taskService';
import attachmentService from '../services/attachmentService';
import api from '../services/api';
import { authService } from '../services/authService';
import TaskModal from '../components/TaskModal';
import FileUploadZone from '../components/FileUploadZone';
import AttachmentList from '../components/AttachmentList';
import '../styles/TaskDetail.css';

// =========================================================
// Helpers
// =========================================================
const formatDate = (dateStr) => {
  if (!dateStr) return 'Không có';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const getStatusBadgeClass = (statusName) => {
  if (!statusName) return 'badge-status-todo';
  const s = statusName.toLowerCase();
  if (s.includes('done') || s.includes('hoàn')) return 'badge-status-done';
  if (s.includes('progress') || s.includes('làm')) return 'badge-status-inprogress';
  return 'badge-status-todo';
};

const getPriorityBadgeClass = (priorityName) => {
  if (!priorityName) return 'badge-priority-medium';
  const p = priorityName.toLowerCase();
  if (p.includes('critical') || p.includes('khẩn cấp')) return 'badge-priority-critical';
  if (p.includes('high') || p.includes('cao')) return 'badge-priority-high';
  if (p.includes('low') || p.includes('thấp')) return 'badge-priority-low';
  return 'badge-priority-medium';
};

const getActivityDotClass = (type) => {
  if (!type) return 'activity-dot-info';
  switch (type.toUpperCase()) {
    case 'WARNING': return 'activity-dot-warning';
    case 'SUCCESS': return 'activity-dot-success';
    case 'ERROR':   return 'activity-dot-error';
    default:        return 'activity-dot-info';
  }
};

const getActivityIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'WARNING': return '⚠';
    case 'SUCCESS': return '✓';
    case 'ERROR':   return '✕';
    default:        return '●';
  }
};

// =========================================================
// Main Component
// =========================================================
const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data state
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'activity'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const commentListRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const isCustomer = currentUser && currentUser.roles && currentUser.roles.some(r => r.role === 'ROLE_CUSTOMER');

  // ---- Data fetching ----
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [taskData, commentData, activityData, attachmentData] = await Promise.all([
        taskService.getTaskById(id),
        api.get(`/tasks/${id}/comments`).then(r => r.data).catch(() => []),
        api.get(`/tasks/${id}/activities`).then(r => r.data).catch(() => []),
        attachmentService.getAttachments(id).catch(() => []),
      ]);
      setTask(taskData);
      setComments(commentData);
      setActivities(activityData);
      setAttachments(attachmentData);
    } catch (err) {
      setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-scroll comments to bottom khi có comment mới
  useEffect(() => {
    if (commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [comments]);

  // ---- Comment handler ----
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/tasks/${id}/comments`, { content: commentText.trim() });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      alert('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setCommentLoading(false);
    }
  };

  // ---- Attachment handlers ----
  const handleAttachmentUploaded = (dto) => {
    setAttachments((prev) => [dto, ...prev]);
  };

  const handleAttachmentDeleted = (attachmentId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  // ---- Edit task ----
  const handleSaveEdit = async (payload) => {
    try {
      const updated = await taskService.updateTask(id, payload);
      setTask(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      alert('Không thể cập nhật công việc.');
    }
  };

  // =========================================================
  // Render
  // =========================================================
  if (loading) {
    return (
      <div className="task-detail-loading">
        <div className="spinner" />
        <span>Đang tải thông tin công việc...</span>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-detail-error">
        <p>{error || 'Không tìm thấy công việc'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')} style={{ marginTop: '1rem' }}>
          Quay về danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="task-detail-page animate-fade-in">
      {/* ---- Breadcrumb ---- */}
      <nav className="task-detail-breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => navigate('/tasks')} aria-label="Quay về danh sách task">
          <FiArrowLeft style={{ marginRight: '0.25rem' }} /> Danh sách
        </button>
        <span className="sep">/</span>
        {task.projectName && (
          <>
            <span>{task.projectName}</span>
            <span className="sep">/</span>
          </>
        )}
        <span style={{ color: 'var(--text-secondary)' }}>#{task.id}</span>
      </nav>

      {/* ---- Header ---- */}
      <div className="task-detail-header">
        <div style={{ flex: 1 }}>
          <h1 className="task-detail-title">{task.title}</h1>
          <div className="task-detail-badges">
            {task.statusName && (
              <span className={`badge ${getStatusBadgeClass(task.statusName)}`}>
                <FiCheckCircle /> {task.statusName}
              </span>
            )}
            {task.priorityName && (
              <span className={`badge ${getPriorityBadgeClass(task.priorityName)}`}>
                <FiFlag /> {task.priorityName}
              </span>
            )}
            {task.issueTypeName && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                <FiTag /> {task.issueTypeName}
              </span>
            )}
            {task.isCustomerRequest && (
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f97316', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}>
                Yêu cầu Khách hàng
              </span>
            )}
            {task.overdue && (
              <span className="badge badge-priority-high">
                <FiClock /> Quá hạn
              </span>
            )}
          </div>
        </div>
        {!isCustomer && (
          <button
            id="btn-edit-task"
            className="btn btn-secondary"
            onClick={() => setIsEditModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
            aria-label="Chỉnh sửa công việc"
          >
            <FiEdit2 /> Chỉnh sửa
          </button>
        )}
      </div>

      {/* ---- Main Grid ---- */}
      <div className="task-detail-grid">
        {/* =========== LEFT COLUMN =========== */}
        <div>
          {/* Description */}
          <div className="task-section">
            <h2 className="task-section-title">
              <FiTag /> Mô tả
            </h2>
            {task.description ? (
              <p className="task-description">{task.description}</p>
            ) : (
              <p className="task-description-empty">Chưa có mô tả cho công việc này.</p>
            )}
          </div>

          {/* Comments & Activity tabs */}
          <div className="task-section">
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              {[
                { key: 'comments', label: 'Bình luận', icon: <FiMessageSquare />, count: comments.length },
                { key: 'activity', label: 'Lịch sử', icon: <FiActivity />, count: activities.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                    padding: '0.5rem 1rem',
                    fontWeight: activeTab === tab.key ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.875rem',
                    transition: 'all var(--transition-fast)',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.icon} {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      background: activeTab === tab.key ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                      borderRadius: '10px', fontSize: '0.7rem', padding: '1px 6px', fontWeight: 600,
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Comments */}
            {activeTab === 'comments' && (
              <>
                <div className="comment-list" ref={commentListRef} id="comment-list">
                  {comments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem 0' }}>
                      Chưa có bình luận nào. Hãy là người đầu tiên!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">
                          {(comment.userFullName || comment.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-body">
                          <div className="comment-header">
                            <span className="comment-author">
                              {comment.userFullName || comment.username}
                            </span>
                            <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                          </div>
                          <div className="comment-content">{comment.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment form */}
                <form className="comment-form" onSubmit={handleAddComment} id="comment-form">
                  <div className="comment-avatar" style={{ flexShrink: 0, marginBottom: '0.2rem' }}>
                    {(currentUser?.fullName || currentUser?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-input-wrap">
                    <textarea
                      id="comment-input"
                      className="comment-textarea"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Viết bình luận..."
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment(e);
                      }}
                      aria-label="Nhập bình luận"
                    />
                  </div>
                  <button
                    id="btn-submit-comment"
                    type="submit"
                    className="btn btn-primary"
                    disabled={!commentText.trim() || commentLoading}
                    style={{ marginBottom: '0.2rem', padding: '0.65rem 1rem' }}
                    aria-label="Gửi bình luận"
                  >
                    <FiSend />
                  </button>
                </form>
              </>
            )}

            {/* Tab: Activity */}
            {activeTab === 'activity' && (
              <div className="activity-timeline" id="activity-timeline">
                {activities.length === 0 ? (
                  <p className="activity-empty">Chưa có hoạt động nào được ghi nhận.</p>
                ) : (
                  activities.map((log) => (
                    <div key={log.id} className="activity-item">
                      <div className={`activity-dot ${getActivityDotClass(log.type)}`}>
                        {getActivityIcon(log.type)}
                      </div>
                      <div>
                        <p className="activity-text">{log.message}</p>
                        <p className="activity-time">{timeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="task-section">
            <h2 className="task-section-title">
              <FiPaperclip /> Tài liệu đính kèm
              {attachments.length > 0 && (
                <span style={{
                  marginLeft: '0.5rem', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
                  borderRadius: '10px', fontSize: '0.72rem', padding: '1px 7px', fontWeight: 600,
                }}>
                  {attachments.length}
                </span>
              )}
            </h2>

            <AttachmentList
              taskId={parseInt(id)}
              attachments={attachments}
              onDeleted={handleAttachmentDeleted}
            />

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Thêm tài liệu mới (PDF, DOCX, PPTX, XLSX – tối đa 20MB)
              </p>
              <FileUploadZone
                taskId={parseInt(id)}
                onUploaded={handleAttachmentUploaded}
              />
            </div>
          </div>
        </div>

        {/* =========== RIGHT COLUMN – Info Panel =========== */}
        <div>
          <div className="task-section">
            <h2 className="task-section-title">
              <FiUser /> Thông tin chi tiết
            </h2>

            <div className="info-row">
              <span className="info-label">Trạng thái</span>
              <span className={`badge ${getStatusBadgeClass(task.statusName)}`} style={{ width: 'fit-content' }}>
                {task.statusName || 'Chưa xác định'}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Độ ưu tiên</span>
              <span className={`badge ${getPriorityBadgeClass(task.priorityName)}`} style={{ width: 'fit-content' }}>
                <FiFlag /> {task.priorityName || 'Chưa xác định'}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Người phụ trách</span>
              {task.assigneeName ? (
                <div className="assignee-chip">
                  <div className="assignee-avatar">{task.assigneeName.charAt(0).toUpperCase()}</div>
                  <span className="info-value">{task.assigneeName}</span>
                </div>
              ) : (
                <span className="info-value" style={{ color: 'var(--text-muted)' }}>Chưa phân công</span>
              )}
            </div>

            <div className="info-row">
              <span className="info-label">Người báo cáo</span>
              {task.reporterName ? (
                <div className="assignee-chip">
                  <div className="assignee-avatar" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                    {task.reporterName.charAt(0).toUpperCase()}
                  </div>
                  <span className="info-value">{task.reporterName}</span>
                </div>
              ) : (
                <span className="info-value" style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </div>

            <div className="info-row">
              <span className="info-label">Dự án</span>
              <span className="info-value">{task.projectName || '—'}</span>
            </div>

            {task.sprintName && (
              <div className="info-row">
                <span className="info-label">Sprint</span>
                <span className="info-value">{task.sprintName}</span>
              </div>
            )}

            <div className="info-row">
              <span className="info-label"><FiCalendar style={{ marginRight: 3 }} /> Ngày tạo</span>
              <span className="info-value">{formatDate(task.createdAt)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <FiClock style={{ marginRight: 3, color: task.overdue ? 'var(--semantic-error)' : undefined }} />
                Hạn hoàn thành
              </span>
              <span
                className="info-value"
                style={{ color: task.overdue ? 'var(--semantic-error)' : undefined }}
              >
                {task.dueDate ? formatDate(task.dueDate) : 'Không có hạn'}
                {task.overdue && ' ⚠ Quá hạn'}
              </span>
            </div>

            {task.storyPoints != null && (
              <div className="info-row">
                <span className="info-label">Story Points</span>
                <span className="info-value">{task.storyPoints} SP</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        task={task}
      />
    </div>
  );
};

export default TaskDetailPage;
