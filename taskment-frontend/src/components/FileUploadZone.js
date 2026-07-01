import React, { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiX, FiFile, FiLoader } from 'react-icons/fi';
import attachmentService from '../services/attachmentService';

// Loại file được phép
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getExtension = (name) => name?.split('.').pop()?.toLowerCase() || '';

/**
 * FileUploadZone – Drag & Drop zone để upload file đính kèm cho task
 *
 * Props:
 *   taskId       – ID của task
 *   onUploaded   – Callback nhận AttachmentDTO khi upload thành công
 */
const FileUploadZone = ({ taskId, onUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState([]); // [{file, id, error}]
  const [uploadingId, setUploadingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  // ---- Validate file client-side ----
  const validateFile = (file) => {
    const ext = getExtension(file.name);
    if (!ALLOWED_EXT.includes(ext)) {
      return `Loại file không hợp lệ (.${ext}). Chỉ chấp nhận: PDF, DOCX, PPTX, XLSX`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File quá lớn (${formatBytes(file.size)}). Tối đa 20MB`;
    }
    return null;
  };

  const addFilesToQueue = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      error: validateFile(file),
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  // ---- Drag events ----
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    addFilesToQueue(e.dataTransfer.files);
  }, []);

  const onInputChange = (e) => {
    addFilesToQueue(e.target.files);
    e.target.value = ''; // reset để có thể chọn lại cùng file
  };

  const removeFromQueue = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // ---- Upload một file ----
  const uploadFile = async (item) => {
    if (item.error) return;
    setUploadingId(item.id);
    setProgress(0);

    try {
      const dto = await attachmentService.uploadAttachment(taskId, item.file, setProgress);
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
      if (onUploaded) onUploaded(dto);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload thất bại';
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, error: msg } : q))
      );
    } finally {
      setUploadingId(null);
      setProgress(0);
    }
  };

  // Upload tất cả file hợp lệ trong queue
  const uploadAll = async () => {
    for (const item of queue) {
      if (!item.error) {
        await uploadFile(item);
      }
    }
  };

  const validCount = queue.filter((q) => !q.error).length;

  return (
    <div>
      {/* Drop Zone */}
      <div
        id="file-drop-zone"
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Khu vực tải lên file, nhấn hoặc kéo thả file vào đây"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onChange={onInputChange}
          style={{ display: 'none' }}
          id="file-upload-input"
        />
        <div className="upload-zone-icon">
          <FiUploadCloud />
        </div>
        <p className="upload-zone-text">
          <strong>Kéo thả file vào đây</strong> hoặc nhấn để chọn
        </p>
        <p className="upload-zone-hint">
          PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX – Tối đa 20MB mỗi file
        </p>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="upload-queue">
          {queue.map((item) => (
            <div key={item.id} className="upload-queue-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <FiFile style={{ flexShrink: 0, color: item.error ? 'var(--semantic-error)' : 'var(--accent-primary)' }} />
                <span className="upload-queue-name">{item.file.name}</span>
                <span className="upload-queue-size">{formatBytes(item.file.size)}</span>
                <button
                  className="upload-queue-remove"
                  onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                  title="Xóa khỏi danh sách"
                  aria-label={`Xóa file ${item.file.name}`}
                >
                  <FiX />
                </button>
              </div>
              {item.error && (
                <p style={{ fontSize: '0.75rem', color: 'var(--semantic-error)', marginTop: '0.2rem', marginLeft: '1.75rem' }}>
                  ⚠ {item.error}
                </p>
              )}
              {uploadingId === item.id && (
                <div className="upload-progress-bar-wrap" style={{ width: '100%', marginTop: '0.35rem' }}>
                  <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          ))}

          {/* Upload button */}
          {validCount > 0 && (
            <button
              id="btn-upload-all"
              className="btn btn-primary"
              onClick={uploadAll}
              disabled={uploadingId !== null}
              style={{ alignSelf: 'flex-end', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              aria-label={`Tải lên ${validCount} file`}
            >
              {uploadingId ? <FiLoader className="spin" /> : <FiUploadCloud />}
              {uploadingId ? 'Đang tải...' : `Tải lên (${validCount} file)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
