import React, { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiMail, FiUser, FiShield, FiAlertCircle, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import userService from '../services/userService';
import { authService } from '../services/authService';

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('ROLE_STAFF_MEMBER');
  const [saving, setSaving] = useState(false);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.some(r => r.role === 'ROLE_ADMIN');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách thành viên. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setFullName('');
    setPassword('');
    setRoleName('ROLE_STAFF_MEMBER');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setFullName(user.fullName || '');
    setPassword('');
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0].role : 'ROLE_STAFF_MEMBER';
    setRoleName(primaryRole);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa thành viên này? Hành động này không thể hoàn tác.');
    if (!confirmDelete) return;

    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Lỗi khi xóa thành viên: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!fullName || !email || (!editingUser && (!username || !password))) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Edit User DTO
        const payload = {
          fullName,
          email,
          roleNames: [roleName]
        };
        if (password) {
          payload.password = password;
        }
        await userService.updateUser(editingUser.id, payload);
      } else {
        // RegisterRequest DTO
        const payload = {
          username,
          email,
          password,
          fullName,
          roles: [{ role: roleName }]
        };
        await userService.createUser(payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Lỗi khi lưu thông tin: ' + (err.response?.data?.message || err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term))
    );
  });

  const getRoleBadgeStyle = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'ROLE_STAFF_LEADER':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'ROLE_STAFF_MEMBER':
        return { background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      default:
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
    }
  };

  const getRoleDisplayName = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return 'Quản trị viên (Admin)';
      case 'ROLE_STAFF_LEADER':
        return 'Trưởng nhóm (Leader)';
      case 'ROLE_STAFF_MEMBER':
        return 'Nhân viên (Staff)';
      case 'ROLE_CUSTOMER':
        return 'Khách hàng (Customer)';
      default:
        return roleName.replace('ROLE_', '');
    }
  };

  // Counting roles
  const counts = {
    total: users.length,
    admin: users.filter(u => u.roles?.some(r => r.role === 'ROLE_ADMIN')).length,
    leader: users.filter(u => u.roles?.some(r => r.role === 'ROLE_STAFF_LEADER')).length,
    member: users.filter(u => u.roles?.some(r => r.role === 'ROLE_STAFF_MEMBER')).length,
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="loader" style={{ color: 'var(--text-muted)' }}>Đang tải danh sách thành viên...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-2xl" style={{ margin: '0 0 0.5rem 0' }}>Thành viên Hệ thống</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Quản lý, phân quyền và giám sát danh sách toàn bộ thành viên trong tổ chức.</p>
        </div>
        
        {/* Actions for Admin */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}>
              <FiPlus /> Thêm Thành Viên
            </button>
          )}

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '280px', maxWidth: '100%' }}>
            <FiSearch className="text-muted" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--semantic-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Role summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FiUsers />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng số thành viên</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{counts.total}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FiShield />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quản trị (Admin)</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{counts.admin}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FiUser />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trưởng nhóm (Leader)</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{counts.leader}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            <FiUsers />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nhân viên (Staff)</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{counts.member}</p>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredUsers.length === 0 && !error ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>Không tìm thấy thành viên nào</h3>
          <p style={{ color: 'var(--text-muted)', opacity: 0.8, margin: 0 }}>Thử nhập từ khóa tìm kiếm khác.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredUsers.map((u) => {
            const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0].role : 'ROLE_CUSTOMER';
            const badgeStyle = getRoleBadgeStyle(primaryRole);
            return (
              <div 
                key={u.id} 
                className="glass-panel" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Admin options overlay */}
                {isAdmin && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleOpenEditModal(u)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '0.35rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="Sửa / Phân quyền"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', padding: '0.35rem', cursor: 'pointer', color: '#ef4444' }}
                      title="Xóa Thành viên"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                )}

                {/* Avatar */}
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                  {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                {/* Info */}
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 600 }}>{u.fullName || 'Chưa cập nhật'}</h3>
                <span className="text-xs text-muted" style={{ marginBottom: '1rem' }}>@{u.username}</span>

                {/* Role Badge */}
                <span 
                  style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem', 
                    fontWeight: 500,
                    marginBottom: '1.25rem',
                    ...badgeStyle
                  }}
                >
                  {getRoleDisplayName(primaryRole)}
                </span>

                {/* Contacts */}
                <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <FiMail size={14} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }} title={u.email}>{u.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD / Role Assign Modal for Admin */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <h2 className="text-xl" style={{ margin: 0 }}>
                {editingUser ? 'Chỉnh sửa & Phân quyền' : 'Thêm Thành viên mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="form-group">
                <label className="form-label">Tên đầy đủ *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập họ tên" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tên đăng nhập (Username) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!editingUser}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Mật khẩu {editingUser ? '(Để trống nếu không muốn đổi)' : '*'}
                </label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Mật khẩu bảo mật" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingUser}
                />
                {!editingUser && (
                  <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.25rem', color: '#ffc107' }}>
                    * Mật khẩu phải từ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@#$%^&+=!)
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Vai trò & Phân quyền *</label>
                <select 
                  className="form-input" 
                  value={roleName} 
                  onChange={(e) => setRoleName(e.target.value)}
                  style={{ background: 'var(--bg-input)', color: 'white' }}
                  required
                >
                  <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                  <option value="ROLE_STAFF_LEADER">Trưởng nhóm (Leader)</option>
                  <option value="ROLE_STAFF_MEMBER">Nhân viên (Staff)</option>
                  <option value="ROLE_CUSTOMER">Khách hàng (Customer)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
