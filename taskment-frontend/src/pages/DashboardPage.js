import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiActivity, FiUsers } from 'react-icons/fi';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    tasksActive: 0,
    tasksCompleted: 0,
    projectsActive: 0,
    teamMembers: 0
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real app we fetch these from multiple endpoints
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch actual tasks if backend provides it
        const tasksRes = await api.get('/tasks');
        const tasks = tasksRes.data || [];
        
        // Mocking the stats for demonstration based on the length
        setStats({
          tasksActive: tasks.length > 0 ? tasks.length : 12, // fallback fake data if DB empty
          tasksCompleted: 8,
          projectsActive: 3,
          teamMembers: 5
        });

        // Set recent
        setRecentTasks(tasks.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl" style={{ marginBottom: '0.25rem' }}>Trang Chủ</h1>
          <p className="text-muted text-sm">Chào mừng trở lại! Dưới đây là tóm tắt công việc của bạn.</p>
        </div>
        <button className="btn btn-primary">
          + Tạo Task Mới
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
            <button className="text-sm" style={{ color: 'var(--accent-primary)', background: 'none' }}>Xem tất cả</button>
          </div>
          
          {loading ? (
             <p className="text-muted">Đang tải dữ liệu...</p>
          ) : recentTasks.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Chưa có task nào trong hệ thống. Hãy tạo task đầu tiên!
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTasks.map((task, i) => (
                <div key={task.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--semantic-info)' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>{task.title}</h4>
                      <span className="text-xs text-muted">Dự án: {task.project?.name || 'Chung'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                     <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>
                        {task.status?.name || 'TO DO'}
                     </span>
                     <span className="text-muted text-sm"><FiClock /> {task.dueDate || 'Hôm nay'}</span>
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
              {/* Mock Activity */}
              {[1,2,3].map(item => (
                <div key={item} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>A</div>
                   <div>
                     <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Admin</strong> đã thay đổi trạng thái của thẻ <strong>Sửa lỗi API login</strong> sang <em>Done</em>.</p>
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

// Simple Mock missing Icon
const FiFolder = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

export default DashboardPage;
