import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import taskService from '../services/taskService';
import TaskItem from '../components/TaskItem';

const MyRequestsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await taskService.getMyRequests();
      setTasks(data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách yêu cầu:', error);
      alert('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter & Search logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isCompleted = task.statusName?.toLowerCase() === 'done' || task.statusName?.toLowerCase() === 'hoàn thành';
    
    if (filterTab === 'pending') {
      return matchesSearch && !isCompleted;
    }
    if (filterTab === 'completed') {
      return matchesSearch && isCompleted;
    }
    return matchesSearch; // 'all'
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl" style={{ marginBottom: '0.25rem' }}>Yêu Cầu Hỗ Trợ Của Tôi</h1>
          <p className="text-muted text-sm">Danh sách các yêu cầu quý khách đã gửi lên hệ thống và tiến độ xử lý.</p>
        </div>
        <button 
          className="btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
          onClick={fetchRequests}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Tabs */}
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <button 
            className="text-sm" 
            onClick={() => setFilterTab('all')}
            style={{ 
              background: 'none', border: 'none', 
              color: filterTab === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)', 
              fontWeight: filterTab === 'all' ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            Tất cả ({tasks.length})
          </button>
          <button 
            className="text-sm" 
            onClick={() => setFilterTab('pending')}
            style={{ 
              background: 'none', border: 'none', 
              color: filterTab === 'pending' ? 'var(--accent-primary)' : 'var(--text-muted)', 
              fontWeight: filterTab === 'pending' ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            Chờ xử lý ({tasks.filter(t => t.statusName?.toLowerCase() !== 'done' && t.statusName?.toLowerCase() !== 'hoàn thành').length})
          </button>
          <button 
            className="text-sm" 
            onClick={() => setFilterTab('completed')}
            style={{ 
              background: 'none', border: 'none', 
              color: filterTab === 'completed' ? 'var(--accent-primary)' : 'var(--text-muted)', 
              fontWeight: filterTab === 'completed' ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            Đã hoàn thành ({tasks.filter(t => t.statusName?.toLowerCase() === 'done' || t.statusName?.toLowerCase() === 'hoàn thành').length})
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '300px' }}>
          <FiSearch className="text-muted" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tiêu đề, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Không tìm thấy yêu cầu nào phù hợp.
          </div>
        ) : (
          <div>
            {filteredTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={() => {}} 
                onDelete={() => {}} 
                onStatusChange={() => {}} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
