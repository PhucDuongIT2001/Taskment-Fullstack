import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, User as UserIcon, Calendar, MessageSquare, Edit2, Trash2, UserPlus, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import TaskService from '../services/TaskService';
import CommentService from '../services/CommentService';
import ProjectMemberService from '../services/ProjectMemberService';
import TaskWatcherService from '../services/TaskWatcherService';
import UserService from '../services/UserService';
import AttachmentService from '../services/AttachmentService';
import { toast } from 'react-toastify';
import useAuth from '../useAuth';
import TaskForm from '../TaskForm';
import { Badge } from '../components/ui/Badge';

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [watchers, setWatchers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const commentListRef = useRef(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [projectMembers, setProjectMembers] = useState([]);
    const [showAddWatcher, setShowAddWatcher] = useState(false);
    const [selectedWatcherId, setSelectedWatcherId] = useState('');

    const fetchTaskData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [taskRes, commentsRes, watchersRes, usersRes, attachmentsRes] = await Promise.all([
                TaskService.getTaskById(taskId),
                CommentService.getCommentsByTaskId(taskId),
                TaskWatcherService.getWatchersByTaskId(taskId),
                UserService.getAllUsers(),
                AttachmentService.getAttachmentsByTaskId(taskId)
            ]);
            setTask(taskRes.data);
            setComments(commentsRes.data);
            setWatchers(watchersRes.data);
            setAllUsers(usersRes.data);
            setAttachments(attachmentsRes.data);

            if (taskRes.data.projectId) {
                const membersRes = await ProjectMemberService.getProjectMembers(taskRes.data.projectId);
                setProjectMembers(membersRes.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Không thể tải chi tiết công việc. Công việc không tồn tại hoặc bạn không có quyền truy cập.");
            toast.error("Không thể tải dữ liệu công việc.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskData();
    }, [taskId]);

    useEffect(() => {
        if (commentListRef.current) {
            commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
        }
    }, [comments]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await CommentService.createComment(taskId, newComment);
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            toast.error("Lỗi khi gửi bình luận.");
        }
    };

    const handleUpdateTask = async (formData) => {
        try {
            await TaskService.updateTask(taskId, formData);
            toast.success("Đã cập nhật công việc!");
            setShowEditModal(false);
            fetchTaskData();
        } catch (err) {
            toast.error("Lỗi khi cập nhật công việc: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteTask = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
            try {
                await TaskService.deleteTask(taskId);
                toast.success("Đã xóa công việc.");
                navigate(-1);
            } catch (err) {
                toast.error("Lỗi khi xóa công việc: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleAssigneeChange = async (e) => {
        const newAssigneeId = parseInt(e.target.value, 10);
        if (isNaN(newAssigneeId)) return;

        try {
            const updateData = { ...task, assigneeId: newAssigneeId };
            await TaskService.updateTask(taskId, updateData);
            toast.success("Đã cập nhật người thực hiện!");
            fetchTaskData();
        } catch (err) {
            toast.error("Lỗi khi cập nhật người thực hiện: " + (err.response?.data?.message || err.message));
        }
    };

    const handleAddWatcher = async (e) => {
        e.preventDefault();
        if (!selectedWatcherId) {
            toast.warn("Vui lòng chọn một người dùng để theo dõi.");
            return;
        }
        try {
            await TaskWatcherService.addWatcher(taskId, selectedWatcherId);
            toast.success("Đã thêm người theo dõi!");
            fetchTaskData();
            setShowAddWatcher(false);
            setSelectedWatcherId('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thêm người theo dõi.");
        }
    };

    const handleRemoveWatcher = async (userId) => {
        if (window.confirm("Bạn có chắc muốn xóa người theo dõi này?")) {
            try {
                await TaskWatcherService.removeWatcher(taskId, userId);
                toast.info("Đã xóa người theo dõi.");
                fetchTaskData();
            } catch (err) {
                toast.error("Lỗi khi xóa người theo dõi.");
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Giới hạn 10MB
        if (file.size > 10 * 1024 * 1024) {
            toast.warn("Kích thước file không được vượt quá 10MB");
            return;
        }

        setUploading(true);
        try {
            const response = await AttachmentService.uploadAttachment(taskId, file);
            setAttachments([...attachments, response.data]);
            toast.success("Tải file lên thành công!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi tải file lên.");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = null;
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
            try {
                await AttachmentService.deleteAttachment(attachmentId);
                setAttachments(attachments.filter(a => a.id !== attachmentId));
                toast.success("Đã xóa tài liệu đính kèm.");
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi khi xóa tài liệu.");
            }
        }
    };

    const nonWatcherUsers = allUsers.filter(user => !watchers.some(watcher => watcher.userId === user.id));
    const canManage = currentUser?.roles?.some(r => r.role === 'ROLE_ADMIN' || r.role === 'ROLE_STAFF_LEADER');

    const getStatusVariant = (name) => {
        if (!name) return 'default';
        const n = name.toLowerCase();
        if (n.includes('hoàn thành') || n.includes('done')) return 'success';
        if (n.includes('đang làm') || n.includes('in progress')) return 'primary';
        if (n.includes('overdue') || n.includes('quá hạn')) return 'danger';
        return 'warning';
    };

    const getPriorityVariant = (name) => {
        if (!name) return 'default';
        const n = name.toLowerCase();
        if (n.includes('cao') || n.includes('high')) return 'danger';
        if (n.includes('trung') || n.includes('medium')) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse mb-6"></div>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-2/3 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                    <div className="lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-sm border border-red-100 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi truy cập</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Quay lại trang trước
                </button>
            </div>
        );
    }

    if (!task) return null;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> Quay lại
            </button>

            {task.overdue && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-bold">Công việc đã quá hạn!</h3>
                        <p className="text-red-700 text-sm mt-1">Công việc này đã vượt qua thời hạn {formatDistanceToNow(parseISO(task.dueDate), { locale: vi })} trước. Vui lòng cập nhật tiến độ ngay lập tức.</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Main Content */}
                <div className="w-full lg:w-2/3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-100">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge variant={getStatusVariant(task.statusName)} className="text-xs px-2.5 py-1">{task.statusName}</Badge>
                                <Badge variant={getPriorityVariant(task.priorityName)} className="text-xs px-2.5 py-1">{task.priorityName}</Badge>
                                {task.issueTypeName && (
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                                        {task.issueTypeName}
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{task.title}</h1>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-1.5">
                                    <UserIcon className="w-4 h-4" />
                                    Tạo bởi <span className="font-medium text-gray-700">{task.reporterName}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {format(parseISO(task.createdAt), 'dd/MM/yyyy HH:mm')}
                                </div>
                            </div>
                            
                            {canManage && (
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button onClick={() => setShowEditModal(true)} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
                                        <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                                    </button>
                                    <button onClick={handleDeleteTask} className="flex items-center px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors">
                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa công việc
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Mô tả chi tiết</h3>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {task.description || <span className="text-gray-400 italic">Công việc này không có mô tả chi tiết.</span>}
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="p-6 md:p-8 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    Tài liệu đính kèm ({attachments.length})
                                </h3>
                                <div>
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="hidden" 
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <label 
                                        htmlFor="file-upload" 
                                        className={`cursor-pointer flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {uploading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Đang tải...
                                            </span>
                                        ) : (
                                            <span>+ Tải file lên</span>
                                        )}
                                    </label>
                                </div>
                            </div>
                            
                            {attachments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {attachments.map(att => {
                                        const isImage = att.fileName.match(/\.(jpeg|jpg|gif|png)$/i);
                                        return (
                                            <div key={att.id} className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg group">
                                                <div className="w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {isImage ? (
                                                        <img src={att.fileUrl} alt={att.fileName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="ml-3 flex-1 min-w-0">
                                                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                                                        {att.fileName}
                                                    </a>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        bởi {att.uploadedByFullName || att.uploadedByUsername} • {formatDistanceToNow(new Date(att.createdAt), { addSuffix: true, locale: vi })}
                                                    </p>
                                                </div>
                                                {(att.uploadedByUsername === currentUser.username || currentUser?.roles?.some(r => r.role === 'ROLE_ADMIN')) && (
                                                    <button 
                                                        onClick={() => handleDeleteAttachment(att.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Xóa tài liệu"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center py-4">Chưa có tài liệu đính kèm nào.</p>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-900">Bình luận ({comments.length})</h3>
                        </div>
                        
                        <div className="space-y-6 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" ref={commentListRef}>
                            {comments.length > 0 ? comments.map(comment => {
                                const isOwn = comment.username === currentUser.username;
                                return (
                                    <div key={comment.id} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                            {comment.userFullName?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">{isOwn ? 'Bạn' : comment.userFullName}</span>
                                                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
                                            </div>
                                            <div className={`px-4 py-3 rounded-2xl text-sm ${isOwn ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-8 text-gray-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</div>
                            )}
                        </div>
                        
                        <form onSubmit={handleCommentSubmit} className="relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận..."
                                className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Gửi
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">Chi tiết công việc</h4>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Dự án</p>
                                <Link to={`/project/${task.projectId}`} className="font-medium text-blue-600 hover:underline">{task.projectName}</Link>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Thời hạn (Deadline)</p>
                                {task.dueDate ? (
                                    <div className={`flex items-center gap-2 font-medium ${task.overdue ? 'text-red-600' : task.remainingHours < 24 ? 'text-yellow-600' : 'text-gray-900'}`}>
                                        <Clock className="w-4 h-4" />
                                        {format(parseISO(task.dueDate), 'dd/MM/yyyy HH:mm')}
                                        {!task.overdue && task.remainingHours > 0 && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-1 font-normal">
                                                Còn {task.remainingHours}h
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">Không có thời hạn</span>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Người thực hiện</p>
                                {canManage ? (
                                    <select 
                                        value={task.assigneeId || ''} 
                                        onChange={handleAssigneeChange}
                                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Chưa giao --</option>
                                        {projectMembers.map(member => (
                                            <option key={member.userId} value={member.userId}>
                                                {member.fullName || member.username}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                            {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <span className="font-medium text-gray-900">{task.assigneeName || 'Chưa giao'}</span>
                                    </div>
                                )}
                            </div>

                            {task.storyPoints != null && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Story Points</p>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-sm border border-amber-200">
                                        {task.storyPoints}
                                    </div>
                                </div>
                            )}
                            
                            {task.sprintName && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Sprint</p>
                                    <span className="font-medium text-gray-900">{task.sprintName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Watchers Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-gray-500" />
                                Theo dõi ({watchers.length})
                            </h4>
                            {canManage && (
                                <button 
                                    onClick={() => setShowAddWatcher(!showAddWatcher)} 
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    {showAddWatcher ? 'Hủy' : '+ Thêm'}
                                </button>
                            )}
                        </div>

                        {canManage && showAddWatcher && (
                            <form onSubmit={handleAddWatcher} className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <select 
                                    value={selectedWatcherId} 
                                    onChange={e => setSelectedWatcherId(e.target.value)} 
                                    className="flex-1 text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">-- Chọn người dùng --</option>
                                    {nonWatcherUsers.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                                </select>
                                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                                    Thêm
                                </button>
                            </form>
                        )}

                        <div className="space-y-3">
                            {watchers.length > 0 ? (
                                watchers.map(watcher => (
                                    <div key={watcher.userId} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                {(watcher.fullName || watcher.username).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-700 text-sm">{watcher.fullName || watcher.username}</span>
                                        </div>
                                        {canManage && (
                                            <button 
                                                onClick={() => handleRemoveWatcher(watcher.userId)} 
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                title="Xóa người theo dõi"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm italic text-center py-2">Chưa có người theo dõi nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <TaskForm
                    title="Sửa Công Việc"
                    initialData={task}
                    onSubmit={handleUpdateTask}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};

export default TaskDetailPage;
