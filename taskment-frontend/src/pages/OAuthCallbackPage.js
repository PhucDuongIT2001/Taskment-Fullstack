import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * OAuthCallbackPage
 * 
 * Google sẽ redirect về trang này sau khi người dùng xác thực xong.
 * URL sẽ có dạng: /auth/callback?code=xxxx&scope=...
 * 
 * Trang này sẽ:
 * 1. Lấy code từ URL params
 * 2. Gửi code lên backend để đổi lấy JWT token
 * 3. Redirect về dashboard nếu thành công
 */
const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Bạn đã hủy đăng nhập bằng Google.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setError('Không nhận được mã xác thực từ Google.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Gửi code lên backend
    authService.loginWithGoogle(code)
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        console.error('Google OAuth callback error:', err);
        setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại!');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="app-container items-center justify-center">
      <div
        style={{
          position: 'absolute', top: '10%', right: '20%',
          width: '300px', height: '300px',
          background: 'var(--accent-glow)', filter: 'blur(80px)',
          borderRadius: '50%', zIndex: -1
        }}
      />
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '2rem'
            }}>
              ✕
            </div>
            <h2 className="text-xl" style={{ marginBottom: '1rem', color: 'var(--semantic-error)' }}>Đăng nhập thất bại</h2>
            <p className="text-muted text-sm">{error}</p>
            <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>Đang chuyển về trang đăng nhập...</p>
          </>
        ) : (
          <>
            {/* Loading spinner */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <h2 className="text-xl text-gradient" style={{ marginBottom: '0.5rem' }}>Đang xác thực...</h2>
            <p className="text-muted text-sm">Vui lòng chờ trong giây lát</p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallbackPage;
