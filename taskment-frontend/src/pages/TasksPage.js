import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiRefreshCw } from 'react-icons/fi';
import taskService from '../services/taskService';
import { authService } from '../services/authService';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      const isAdmin = currentUser && currentUser.roles && currentUser.roles.some(r => r.role === 'ROLE_ADMIN');
      
      const data = isAdmin 
        ? await taskService.getAllTasks() 
        : await taskService.getMyTasks();
      setTasks(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách công việc:', error);
      alert('Không thể tải danh sách công việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handlers for TaskItem
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } catch (error) {
        console.error('Lỗi khi xóa task:', error);
        alert('Không thể xóa công việc.');
      }
    }
  };

  const handleStatusChangeClick = async (task) => {
    // Đổi trạng thái vòng lặp: To Do (1) -> In Progress (2) -> Done (3) -> To Do (1)
    const currentStatusId = task.statusId || 1;
    let nextStatusId = currentStatusId + 1;
    if (nextStatusId > 3) nextStatusId = 1;

    try {
      const updatedTask = await taskService.updateTaskStatus(task.id, nextStatusId);
      // Cập nhật lại list
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái:', error);
      alert('Không thể đổi trạng thái công việc.');
    }
  };

  // Handler cho Modal
  const handleOpenNewModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    try {
      if (taskToEdit) {
        // Edit mode
        const updatedTask = await taskService.updateTask(taskToEdit.id, payload);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else {
        // Create mode
        const newTask = await taskService.createTask(payload);
        setTasks(prev => [newTask, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu task:', error);
      alert('Đã xảy ra lỗi khi lưu công việc. Vui lòng thử lại.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl" style={{ marginBottom: '0.25rem' }}>Quản lý Công việc</h1>
          <p className="text-muted text-sm">Danh sách các công việc bạn cần hoàn thành.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
            onClick={fetchTasks}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleOpenNewModal}>
            <FiPlus /> Tạo Task Mới
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="text-sm" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600 }}>Tất cả</button>
            <button className="text-sm text-muted" style={{ background: 'none', border: 'none' }}>Chưa hoàn thành</button>
            <button className="text-sm text-muted" style={{ background: 'none', border: 'none' }}>Đã hoàn thành</button>
          </div>
          <button className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none' }}>
            <FiFilter /> Lọc
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Chưa có công việc nào. Hãy tạo một công việc mới!
          </div>
        ) : (
          <div>
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChangeClick}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveModal} 
        task={taskToEdit} 
      />
    </div>
  );
};

export default TasksPage;
