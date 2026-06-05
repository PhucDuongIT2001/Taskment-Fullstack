import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  FiHome, FiCheckSquare, FiFolder, FiUsers, 
  FiSettings, FiLogOut, FiMenu, FiBell, FiSearch,
  FiAlertTriangle, FiInfo, FiUser, FiCamera, FiX
} from 'react-icons/fi';
import Chatbot from '../components/Chatbot';
import { useNotification } from '../context/NotificationContext';
import userService from '../services/userService';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(() => authService.getCurrentUser() || { fullName: 'Guest', username: 'guest' });

  // Profile Modal states
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Sync user state on route change
  useEffect(() => {
    const currentUser = authService.getCurrentUser() || { fullName: 'Guest', username: 'guest' };
    if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
      setUser(currentUser);
    }
  }, [location.pathname, user]);

  const handleOpenProfile = async () => {
    setProfileOpen(true);
    setProfileLoading(true);
    try {
      const data = await userService.getProfile(user.id);
      setProfileData(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedFields) => {
    try {
      const result = await userService.updateProfile(user.id, {
        ...profileData,
        ...updatedFields
      });
      setProfileData(result);
      
      // Update local storage user info
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        fullName: result.fullName,
        email: result.email,
        humanInfo: {
          ...currentUser.humanInfo,
          ...result
        }
      };
      localStorage.setItem('taskment_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Không thể cập nhật hồ sơ: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const avatarUrl = await userService.uploadAvatar(user.id, file);
      
      setProfileData(prev => ({
        ...prev,
        avatarUrl: avatarUrl
      }));
      
      const currentUser = authService.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        humanInfo: {
          ...currentUser.humanInfo,
          avatarUrl: avatarUrl
        }
      };
      localStorage.setItem('taskment_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Tải ảnh đại diện thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleNotifClick = (notif) => {
    setDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else if (notif.taskId) {
      navigate(`/tasks?id=${notif.taskId}`);
    }
  };

  const formatRelativeTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } catch (e) {
      return '';
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATE':
        return <FiCheckSquare size={16} />;
      case 'PROJECT_ASSIGNED':
      case 'PROJECT_UPDATE':
        return <FiFolder size={16} />;
      case 'OVERDUE':
      case 'DEADLINE_WARNING':
        return <FiAlertTriangle size={16} />;
      default:
        return <FiInfo size={16} />;
    }
  };

  const getIconClass = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATE':
        return 'notif-icon-task';
      case 'PROJECT_ASSIGNED':
      case 'PROJECT_UPDATE':
        return 'notif-icon-project';
      case 'OVERDUE':
      case 'DEADLINE_WARNING':
        return 'notif-icon-warning';
      default:
        return 'notif-icon-system';
    }
  };

  // Helper: Convert absolute avatar URL (which may contain :8888 port) to relative /uploads/...
  // so that the browser loads it through Nginx (port 80) instead of the internal backend port.
  const cleanAvatarUrl = (url) => {
    if (!url) return null;
    // Already a relative path - nothing to do
    if (url.startsWith('/')) return url;
    try {
      const parsed = new URL(url);
      // Strip host/port, keep only pathname
      return parsed.pathname;
    } catch {
      return url;
    }
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
            <div className="notification-container" ref={dropdownRef}>
              <button 
                className={`notification-bell-btn ${dropdownOpen ? 'active' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="Thông báo"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <h3>Thông báo</h3>
                    {unreadCount > 0 && (
                      <button className="notif-mark-read-btn" onClick={handleMarkAllAsRead}>
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <span className="notif-empty-icon">🔔</span>
                        <span className="notif-empty-text">Không có thông báo nào</span>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`notif-item ${!notif.read ? 'notif-item-unread' : ''}`}
                          onClick={() => handleNotifClick(notif)}
                        >
                          <div className={`notif-item-icon-wrapper ${getIconClass(notif.type)}`}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="notif-content-wrapper">
                            <span className="notif-message">{notif.message}</span>
                            <span className="notif-timestamp">{formatRelativeTime(notif.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div 
              onClick={handleOpenProfile}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              title="Xem hồ sơ cá nhân"
            >
               <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                 {user.humanInfo?.avatarUrl || user.avatarUrl ? (
                   <img src={cleanAvatarUrl(user.humanInfo?.avatarUrl || user.avatarUrl)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                 )}
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
      
      {/* AI Chatbot */}
      <Chatbot />

      {/* Profile Modal */}
      {profileOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <h2 className="text-xl font-bold" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                <FiUser style={{ color: 'var(--accent-primary)' }} /> Hồ sơ cá nhân
              </h2>
              <button 
                onClick={() => setProfileOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                <FiX />
              </button>
            </div>

            {profileLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div style={{ color: 'white' }}>Đang tải...</div>
              </div>
            ) : (
              <div>
                {/* Avatar Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '90px', 
                      height: '90px', 
                      borderRadius: '50%', 
                      background: 'var(--accent-primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '2rem', 
                      overflow: 'hidden',
                      border: '3px solid rgba(99, 102, 241, 0.3)'
                    }}>
                      {profileData?.avatarUrl || user.humanInfo?.avatarUrl ? (
                        <img src={cleanAvatarUrl(profileData?.avatarUrl || user.humanInfo?.avatarUrl)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    {/* Camera icon badge */}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        border: '2px solid #0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                      }}
                      title="Thay đổi ảnh đại diện"
                    >
                      <FiCamera size={12} />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                  />
                  {uploadingAvatar && <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>Đang tải ảnh lên...</span>}
                  
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: '0.75rem', color: 'white' }}>{user.fullName}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{user.username}</span>
                </div>

                {/* Form fields */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updatedFields = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phoneNumber: formData.get('phoneNumber'),
                    address: formData.get('address'),
                    bio: formData.get('bio')
                  };
                  handleUpdateProfile(updatedFields);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Họ</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        defaultValue={profileData?.firstName || ''}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', color: 'white', outline: 'none' }} 
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tên</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        defaultValue={profileData?.lastName || ''}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', color: 'white', outline: 'none' }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      defaultValue={profileData?.email || user.email || ''}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', color: 'white', outline: 'none' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số điện thoại</label>
                    <input 
                      type="text" 
                      name="phoneNumber" 
                      defaultValue={profileData?.phoneNumber || ''}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', color: 'white', outline: 'none' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Địa chỉ</label>
                    <input 
                      type="text" 
                      name="address" 
                      defaultValue={profileData?.address || ''}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', color: 'white', outline: 'none' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Giới thiệu bản thân</label>
                    <textarea 
                      name="bio" 
                      defaultValue={profileData?.bio || ''}
                      style={{ width: '100%', minHeight: '60px', resize: 'vertical', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', color: 'white', outline: 'none' }} 
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'end', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setProfileOpen(false)}
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
