import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FiUser, FiMail, FiLock, FiCheck } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.register(formData);
      setSuccess('Đăng ký tài khoản thành công! Tự động chuyển trang...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã bị trùng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container items-center justify-center">
      <div 
        style={{
          position: 'absolute', bottom: '10%', left: '20%', width: '300px', height: '300px', 
          background: 'rgba(14, 165, 233, 0.4)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1
        }}
      />
      
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-2xl text-gradient" style={{ marginBottom: '0.5rem' }}>Đăng Ký Tài Khoản</h1>
          <p className="text-muted text-sm">Gia nhập đội ngũ Taskment ngay hôm nay!</p>
        </div>

        {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--semantic-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
        )}

        {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--semantic-success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {success}
            </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiUser />
              </div>
              <input 
                type="text" 
                name="fullName"
                className="form-input" 
                placeholder="Nhập họ và tên đầy đủ" 
                style={{ paddingLeft: '2.5rem' }}
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiUser />
              </div>
              <input 
                type="text" 
                name="username"
                className="form-input" 
                placeholder="Ví dụ: taskmaster21" 
                style={{ paddingLeft: '2.5rem' }}
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiMail />
              </div>
              <input 
                type="email" 
                name="email"
                className="form-input" 
                placeholder="email@example.com" 
                style={{ paddingLeft: '2.5rem' }}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiLock />
              </div>
              <input 
                type="password" 
                name="password"
                className="form-input" 
                placeholder="Nhập mật khẩu an toàn" 
                style={{ paddingLeft: '2.5rem' }}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ marginTop: '1rem', height: '48px' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Hoàn tất Đăng Ký'} <FiCheck />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: 'var(--glass-border)', paddingTop: '1.5rem' }}>
          <p className="text-sm text-muted">
            Đã có tài khoản? <Link to="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Quay lại Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
