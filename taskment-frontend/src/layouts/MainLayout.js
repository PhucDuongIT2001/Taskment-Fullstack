import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  FiHome, FiCheckSquare, FiFolder, FiUsers, 
  FiSettings, FiLogOut, FiMenu, FiBell, FiSearch
} from 'react-icons/fi';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser() || { fullName: 'Guest', username: 'guest' };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'My Tasks', path: '/tasks', icon: <FiCheckSquare /> },
    { name: 'Projects', path: '/projects', icon: <FiFolder /> },
    { name: 'Team', path: '/team', icon: <FiUsers /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside 
        style={{
          width: sidebarOpen ? '260px' : '80px',
          background: 'var(--bg-sidebar)',
          borderRight: 'var(--glass-border)',
          transition: 'width var(--transition-normal)',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(20px)',
          zIndex: 10
        }}
      >
        {/* Logo Area */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {sidebarOpen && <h2 className="text-xl text-gradient" style={{ margin: 0 }}>Taskment.ai</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted" style={{ fontSize: '1.25rem' }}>
            <FiMenu />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                to={item.path} 
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
                title={!sidebarOpen ? item.name : ''}
              >
                <span style={{ fontSize: '1.25rem', marginRight: sidebarOpen ? '1rem' : '0', color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span style={{ fontWeight: isActive ? 500 : 400 }}>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            className="btn btn-secondary w-full" 
            style={{ 
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: sidebarOpen ? '0.75rem 1rem' : '0.75rem 0',
              borderColor: 'transparent',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--semantic-error)'
            }}
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <FiLogOut size={18} style={{ marginRight: sidebarOpen ? '0.75rem' : '0' }} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar */}
        <header 
          style={{
            height: '70px',
            background: 'rgba(11, 15, 25, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: 'var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', width: '300px', border: '1px solid var(--border-color)' }}>
            <FiSearch className="text-muted" />
            <input type="text" placeholder="Tìm kiếm task, project..." style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '0.5rem', width: '100%', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button className="text-secondary" style={{ position: 'relative' }}>
              <FiBell size={20} />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--semantic-error)', borderRadius: '50%' }}></span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                 {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.fullName}</span>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</span>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <div style={{ padding: '2rem', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
