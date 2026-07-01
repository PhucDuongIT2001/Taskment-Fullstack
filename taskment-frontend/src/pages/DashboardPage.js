import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiActivity, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import taskService from '../services/taskService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {};
  const isCustomer = user.roles && user.roles.some(r => r.role === 'ROLE_CUSTOMER');

  // Default Dashboard State
  const [stats, setStats] = useState({
    tasksActive: 0,
    tasksCompleted: 0,
    projectsActive: 0,
    teamMembers: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customer Dashboard State
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customerTasks, setCustomerTasks] = useState([]);
  const [custLoading, setCustLoading] = useState(true);

  // Fetch Admin/Staff Dashboard Data
  useEffect(() => {
    if (isCustomer) return; // Skip if customer

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const tasksRes = await api.get('/tasks');
        const tasks = tasksRes.data || [];
        
        setStats({
          tasksActive: tasks.length > 0 ? tasks.length : 12,
          tasksCompleted: 8,
          projectsActive: 3,
          teamMembers: 5
        });

        setRecentTasks(tasks.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isCustomer]);

  // Fetch Customer Requests Data
  const fetchCustomerData = async () => {
    try {
      setCustLoading(true);
      const data = await taskService.getMyRequests();
      setCustomerTasks(data || []);
    } catch (error) {
      console.error("Error fetching customer requests", error);
    } finally {
      setCustLoading(false);
    }
  };

  useEffect(() => {
    if (isCustomer) {
      fetchCustomerData();
    }
  }, [isCustomer]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!reqTitle.trim()) {
      alert('Vui lòng nhập tiêu đề yêu cầu.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: reqTitle.trim(),
        description: reqDesc.trim()
      };
      await taskService.createCustomerRequest(payload);
      alert('Gửi yêu cầu hỗ trợ thành công!');
      setReqTitle('');
      setReqDesc('');
      fetchCustomerData();
    } catch (error) {
      console.error("Error creating customer request", error);
      alert('Không thể gửi yêu cầu: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
    } finally {
      setSubmitting(false);
    }
  };

  const countByStatus = (statusName) => {
    return customerTasks.filter(t => t.statusName?.toLowerCase() === statusName.toLowerCase()).length;
  };

  const getStatusColor = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'done':
      case 'hoàn thành':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      case 'in progress':
      case 'đang làm':
        return { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b' };
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `rgba(${color}, 0.1)`, color: `rgba(${color}, 1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {icon}
      </div>
      <div>
        <h3 className="text-muted text-sm">{title}</h3>
        <p className="text-2xl" style={{ fontWeight: 700, margin: 0 }}>{value}</p>
      </div>
    </div>
  );

  // Render Customer Dashboard
  if (isCustomer) {
    const totalPending = countByStatus('To Do') + countByStatus('chưa làm') + countByStatus('In Progress') + countByStatus('đang làm');
    const totalCompleted = countByStatus('Done') + countByStatus('hoàn thành');
    
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="text-2xl" style={{ marginBottom: '0.25rem' }}>Bảng điều khiển Khách hàng</h1>
            <p className="text-muted text-sm">Chào mừng quý khách <strong>{user.fullName}</strong>! Quý khách có thể gửi yêu cầu hỗ trợ và theo dõi tiến độ tại đây.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <StatCard icon={<FiActivity />} title="Tổng yêu cầu đã gửi" value={customerTasks.length} color="99, 102, 241" />
          <StatCard icon={<FiClock />} title="Yêu cầu chờ xử lý" value={totalPending} color="245, 158, 11" />
          <StatCard icon={<FiCheckCircle />} title="Yêu cầu hoàn thành" value={totalCompleted} color="16, 185, 129" />
        </div>

        {/* Form and Recent Requests Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Form Create Request */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 600 }}>Gửi Yêu Cầu Hỗ Trợ</h3>
            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tiêu đề yêu cầu <span style={{color:'var(--semantic-error)'}}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Lỗi thanh toán hóa đơn, Yêu cầu đổi mật khẩu..."
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  disabled={submitting}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'white', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mô tả chi tiết</label>
                <textarea 
                  placeholder="Mô tả chi tiết vấn đề hoặc tính năng quý khách cần hỗ trợ. Quý khách có thể upload thêm tài liệu/hình ảnh sau khi tạo yêu cầu thành công."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  disabled={submitting}
                  rows={5}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: 'white', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting || !reqTitle.trim()}
                style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.75rem 1.5rem' }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          </div>

          {/* Recent Requests list */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Yêu Cầu Hỗ Trợ Gần Đây</h3>
              <button 
                className="text-sm" 
                style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/my-requests')}
              >
                Xem tất cả
              </button>
            </div>

            {custLoading ? (
              <p className="text-muted">Đang tải...</p>
            ) : customerTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Quý khách chưa gửi yêu cầu nào. Hãy gửi yêu cầu đầu tiên!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {customerTasks.slice(0, 5).map((task) => {
                  const statusColor = getStatusColor(task.statusName);
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '1rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</h4>
                        <span className="text-xs text-muted">Mã yêu cầu: #{task.id} • Ngày tạo: {new Date(task.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <span 
                        style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: statusColor.bg, 
                          color: statusColor.text, 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.statusName || 'TO DO'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Default Admin/Staff Dashboard
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl" style={{ marginBottom: '0.25rem' }}>Trang Chủ</h1>
          <p className="text-muted text-sm">Chào mừng trở lại! Dưới đây là tóm tắt công việc của bạn.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
          Quản lý Tasks
        </button>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <StatCard icon={<FiActivity />} title="Task Đang Chạy" value={stats.tasksActive} color="99, 102, 241" />
        <StatCard icon={<FiCheckCircle />} title="Task Hoàn Thành" value={stats.tasksCompleted} color="16, 185, 129" />
        <StatCard icon={<FiFolder />} title="Dự Án Đang Chạy" value={stats.projectsActive} color="245, 158, 11" />
        <StatCard icon={<FiUsers />} title="Thành Viên Đội Nhóm" value={stats.teamMembers} color="14, 165, 233" />
      </div>

      {/* CHARTS / RECENT ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Task Cập Nhật Mới Nhất</h3>
            <button className="text-sm" style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/tasks')}>Xem tất cả</button>
          </div>
          
          {loading ? (
             <p className="text-muted">Đang tải dữ liệu...</p>
          ) : recentTasks.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Chưa có task nào trong hệ thống.
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTasks.map((task, i) => (
                <div 
                  key={task.id || i} 
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--semantic-info)' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>{task.title}</h4>
                      <span className="text-xs text-muted">Dự án: {task.projectName || 'Chung'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                     <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>
                        {task.statusName || 'TO DO'}
                     </span>
                     <span className="text-muted text-sm"><FiClock /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
           <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Hoạt Động Đội Nhóm</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[1,2,3].map(item => (
                <div key={item} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>A</div>
                   <div>
                     <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Admin</strong> đã cập nhật trạng thái công việc.</p>
                     <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>2 giờ trước</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const FiFolder = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

export default DashboardPage;
