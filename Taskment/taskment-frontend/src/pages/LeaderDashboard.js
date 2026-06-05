import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import TaskCard from '../TaskCard';
import TaskService from '../services/TaskService';
import api from '../services/api';
import { toast } from 'react-toastify';
import TaskForm from '../TaskForm';

const LeaderDashboard = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
        TaskService.getAllTasks(),
        api.get('/statuses'),
        api.get('/priorities')
    ]).then(([tasksRes, statusesRes, prioritiesRes]) => {
        setTasks(tasksRes.data);
        setStatuses(statusesRes.data);
        setPriorities(prioritiesRes.data);
    }).catch(err => {
        toast.error("Không thể tải dữ liệu cho trang của Leader.");
    }).finally(() => {
        setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTask = async (formData) => {
      try {
          await TaskService.createTask(formData);
          toast.success("🚀 Đã tạo công việc mới!");
          setShowAddModal(false);
          fetchDashboardData();
      } catch (err) {
          toast.error("Lỗi khi tạo task: " + (err.response?.data?.message || err.message));
      }
  };

  const handleUpdateTask = async (formData) => {
      try {
          await TaskService.updateTask(editingTask.id, formData);
          toast.success("💾 Đã lưu thay đổi!");
          setEditingTask(null);
          fetchDashboardData();
      } catch (err) {
          toast.error("Lỗi khi cập nhật task: " + (err.response?.data?.message || err.message));
      }
  };

  const handleDelete = (id) => {
    if (window.confirm("Xác nhận xóa công việc này?")) {
      TaskService.deleteTask(id).then(() => {
        toast.warn("🗑️ Đã xóa công việc!");
        fetchDashboardData();
      }).catch(err => {
        toast.error("Lỗi khi xóa task: " + (err.response?.data?.message || err.message));
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchStatus = !filterStatus || task.statusName === filterStatus;
    const matchPriority = !filterPriority || task.priorityName === filterPriority;
    const matchSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  if (loading) {
    return <div className="loading-screen">⌛ Đang tải dữ liệu Leader...</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <div className="content-header">
        <h1 className="title">🎖️ Bảng Điều Khiển Trưởng Nhóm</h1>
        <button onClick={() => setShowAddModal(true)} className="add-task-btn">➕ Thêm Task Mới</button>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
        <div className="filter-bar" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input
                type="text"
                placeholder="🔍 Tìm kiếm công việc..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="">Tất cả độ ưu tiên</option>
                {priorities.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
        </div>
      </div>

      <div className="content-header" style={{ marginTop: '40px' }}>
        <h2 className="title">Toàn bộ công việc ({filteredTasks.length})</h2>
      </div>
      <div className="task-grid">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(t => (
            <Link to={`/task/${t.id}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}> {/* BỌC TaskCard BẰNG LINK */}
                <TaskCard
                  task={t}
                  onDelete={handleDelete}
                  onEdit={() => setEditingTask(t)}
                  canManage={true}
                />
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <p>🚫 Không tìm thấy công việc nào.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
          <TaskForm
              title="Tạo Công Việc Mới"
              onSubmit={handleCreateTask}
              onClose={() => setShowAddModal(false)}
          />
      )}
      {editingTask && (
          <TaskForm
              title="Sửa Công Việc"
              initialData={editingTask}
              onSubmit={handleUpdateTask}
              onClose={() => setEditingTask(null)}
          />
      )}
    </div>
  );
};

export default LeaderDashboard;
