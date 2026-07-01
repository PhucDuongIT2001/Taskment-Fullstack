import React from 'react';
import {
  FiDownload,
  FiTrash2,
  FiFileText,
  FiFile,
  FiMonitor,
  FiGrid,
  FiPaperclip,
} from 'react-icons/fi';
import { authService } from '../services/authService';
import attachmentService from '../services/attachmentService';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getExtension = (fileName) => fileName?.split('.').pop()?.toLowerCase() || '';

/**
 * Trả về class CSS và icon theo loại file
 */
const getFileDisplay = (fileName) => {
  const ext = getExtension(fileName);
  switch (ext) {
    case 'pdf':
      return { iconClass: 'attachment-icon-pdf', icon: <FiFileText />, label: 'PDF' };
    case 'doc':
    case 'docx':
      return { iconClass: 'attachment-icon-docx', icon: <FiFile />, label: 'DOCX' };
    case 'ppt':
    case 'pptx':
      return { iconClass: 'attachment-icon-pptx', icon: <FiMonitor />, label: 'PPTX' };
    case 'xls':
    case 'xlsx':
      return { iconClass: 'attachment-icon-xlsx', icon: <FiGrid />, label: 'XLSX' };
    default:
      return { iconClass: 'attachment-icon-other', icon: <FiPaperclip />, label: ext.toUpperCase() };
  }
};

/**
 * AttachmentList – Danh sách file đính kèm của một task
 *
 * Props:
 *   taskId       – ID task
 *   attachments  – Mảng AttachmentDTO
 *   onDeleted    – Callback(attachmentId) khi xóa thành công
 */
const AttachmentList = ({ taskId, attachments = [], onDeleted }) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roles?.some((r) => r.role === 'ROLE_ADMIN');

  const handleDownload = (attachment) => {
    // Mở URL download trong tab mới
    window.open(attachment.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (attachment) => {
    const confirm = window.confirm(
      `Bạn có chắc chắn muốn xóa file "${attachment.fileName}"?`
    );
    if (!confirm) return;

    try {
      await attachmentService.deleteAttachment(taskId, attachment.id);
      if (onDeleted) onDeleted(attachment.id);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể xóa file';
      alert(`Lỗi: ${msg}`);
    }
  };

  /**
   * Kiểm tra quyền xóa file:
   * - Admin: toàn quyền
   * - Người đã upload file: được xóa
   */
  const canDelete = (attachment) => {
    if (isAdmin) return true;
    return attachment.uploadedByUsername === currentUser?.username;
  };

  if (attachments.length === 0) {
    return (
      <div className="attachment-empty">
        <FiPaperclip style={{ fontSize: '1.5rem', opacity: 0.4, marginBottom: '0.5rem' }} />
        <p>Chưa có tài liệu nào được đính kèm</p>
      </div>
    );
  }

  return (
    <div className="attachment-list" id="attachment-list">
      {attachments.map((attachment) => {
        const { iconClass, icon, label } = getFileDisplay(attachment.fileName);
        return (
          <div key={attachment.id} className="attachment-item" id={`attachment-${attachment.id}`}>
            {/* File icon */}
            <div className={`attachment-icon ${iconClass}`} title={label}>
              {icon}
            </div>

            {/* File info */}
            <div className="attachment-info">
              <div className="attachment-name" title={attachment.fileName}>
                {attachment.fileName}
              </div>
              <div className="attachment-meta">
                {attachment.uploadedByFullName || attachment.uploadedByUsername}
                {attachment.fileSize ? ` • ${formatBytes(attachment.fileSize)}` : ''}
                {attachment.createdAt ? ` • ${formatDate(attachment.createdAt)}` : ''}
              </div>
            </div>

            {/* Actions */}
            <div className="attachment-actions">
              <button
                id={`btn-download-${attachment.id}`}
                className="attachment-btn"
                onClick={() => handleDownload(attachment)}
                title="Tải xuống"
                aria-label={`Tải xuống ${attachment.fileName}`}
              >
                <FiDownload />
                <span style={{ fontSize: '0.78rem' }}>Tải về</span>
              </button>

              {canDelete(attachment) && (
                <button
                  id={`btn-delete-attachment-${attachment.id}`}
                  className="attachment-btn delete"
                  onClick={() => handleDelete(attachment)}
                  title="Xóa file"
                  aria-label={`Xóa file ${attachment.fileName}`}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentList;
