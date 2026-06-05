import React from 'react';
import { FcGoogle } from 'react-icons/fc';

/**
 * GoogleLoginButton - Mobile-friendly version
 * 
 * Thay vì dùng popup (bị block trên in-app browser của Zalo/Facebook/...),
 * button này redirect thẳng sang Google OAuth URL.
 * Google sẽ redirect về /auth/callback?code=... sau khi xác thực.
 */

// URL của app trên production
const REDIRECT_URI = window.location.origin + '/auth/callback';
// Client ID từ Google Console
const GOOGLE_CLIENT_ID = '577050807180-mvkcj66kp5o3e59mrvo5e1mb8v2rv2ub.apps.googleusercontent.com';

const GoogleLoginButton = ({ disabled }) => {
  const handleGoogleRedirect = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    // Redirect thẳng - hoạt động trên mọi browser kể cả in-app browser
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <button
      type="button"
      className="btn"
      disabled={disabled}
      onClick={handleGoogleRedirect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        width: '100%',
        height: '48px',
        marginTop: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <FcGoogle size={22} />
      <span>Đăng nhập bằng Google</span>
    </button>
  );
};

export default GoogleLoginButton;
