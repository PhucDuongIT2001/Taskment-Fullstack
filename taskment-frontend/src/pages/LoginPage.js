import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
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
      const data = await authService.login(username, password);
      if (data && data.requires2FA) {
        setShow2FA(true);
        setInfoMessage(data.message || 'Vui lòng nhập mã OTP đã gửi qua email.');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verify2FA(username, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const data = await authService.resend2FA(username);
      setInfoMessage(data.message || 'Mã OTP mới đã được gửi thành công.');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Không thể gửi lại mã OTP!');
    } finally {
      setLoading(false);
    }
  };

  // Google login sử dụng redirect flow (xem OAuthCallbackPage.js)
  // handleGoogleLogin không cần nữa vì GoogleLoginButton tự redirect

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
          <h1 className="text-2xl text-gradient" style={{ marginBottom: '0.5rem' }}>
            {show2FA ? 'Xác thực 2 yếu tố (2FA)' : 'Welcome to Taskment'}
          </h1>
          <p className="text-muted text-sm">
            {show2FA ? 'Nhập mã xác thực để tiếp tục' : 'Quản lý công việc thông minh cùng AI'}
          </p>
        </div>

        {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--semantic-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
        )}

        {show2FA ? (
          <form onSubmit={handleVerify2FA}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p className="text-sm text-muted" style={{ lineHeight: '1.5', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {infoMessage}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Mã OTP xác thực</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <FiLock />
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập 6 chữ số OTP" 
                  maxLength={6}
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              style={{ marginTop: '1.5rem', height: '48px' }}
              disabled={loading}
            >
              {loading ? 'Đang xác minh...' : 'Xác nhận đăng nhập'} <FiArrowRight />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.875rem' }}>
              <button 
                type="button" 
                onClick={handleResendOTP} 
                className="text-sm"
                disabled={loading}
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: 0, fontWeight: 500 }}
              >
                Gửi lại mã OTP
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShow2FA(false);
                  setError('');
                  setInfoMessage('');
                  setOtp('');
                }} 
                className="text-sm text-muted"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Quay lại
              </button>
            </div>
          </form>
        ) : (
          <>
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

            <GoogleLoginButton disabled={loading} />

            <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: 'var(--glass-border)', paddingTop: '1.5rem' }}>
              <p className="text-sm text-muted">
                Chưa có tài khoản? <Link to="/register" style={{ fontWeight: 600 }}>Tạo tài khoản mới</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
