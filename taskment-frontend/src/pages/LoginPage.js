import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(username, password);
      navigate('/dashboard'); // Go to dashboard if success
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container items-center justify-center">
      {/* Background circles effect */}
      <div 
        style={{
          position: 'absolute', top: '10%', right: '20%', width: '300px', height: '300px', 
          background: 'var(--accent-glow)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1
        }}
      />
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-2xl text-gradient" style={{ marginBottom: '0.5rem' }}>Welcome to Taskment</h1>
          <p className="text-muted text-sm">Quản lý công việc thông minh cùng AI</p>
        </div>

        {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--semantic-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiMail />
              </div>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nhập username" 
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="form-input" 
                placeholder="Nhập mật khẩu" 
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <a href="#" className="text-sm">Quên mật khẩu?</a>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ marginTop: '1rem', height: '48px' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'} <FiArrowRight />
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: 'var(--glass-border)', paddingTop: '1.5rem' }}>
          <p className="text-sm text-muted">
            Chưa có tài khoản? <Link to="/register" style={{ fontWeight: 600 }}>Tạo tài khoản mới</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
