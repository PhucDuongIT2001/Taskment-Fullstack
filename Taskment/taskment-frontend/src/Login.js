import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import GoogleLoginButton from './components/GoogleLoginButton'; // THÊM MỚI
import AuthService from './services/AuthService'; // THÊM MỚI

function Login({ onToggle, onLogin, onVerify2FA }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2FA states
  const [isWaitingForOtp, setIsWaitingForOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [usernameFor2FA, setUsernameFor2FA] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer cho nút resend
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await onLogin(usernameOrEmail, password);
    
    if (result && result.requires2FA) {
      toast.info(result.message || "Vui lòng kiểm tra email để lấy mã OTP.");
      setIsWaitingForOtp(true);
      setUsernameFor2FA(result.username);
      setCountdown(60); // Bắt đầu đếm ngược 60s
      setIsSubmitting(false);
    } else if (result === true) {
      toast.success("🔑 Đăng nhập thành công! Chào mừng trở lại.");
    } else {
      toast.error(result || "❌ Tài khoản hoặc mật khẩu không chính xác!");
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }
    setIsSubmitting(true);
    const result = await onVerify2FA(usernameFor2FA, otp);
    if (result === true) {
      toast.success("🔑 Đăng nhập thành công! Chào mừng trở lại.");
    } else {
      toast.error(result || "❌ Mã OTP không chính xác hoặc đã hết hạn!");
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      toast.info("Đang gửi lại mã OTP...");
      const result = await AuthService.resend2FA(usernameFor2FA);
      toast.success(result.message || "Mã OTP mới đã được gửi!");
      setCountdown(60);
    } catch (error) {
      toast.error(error.message || "Không thể gửi lại OTP.");
    }
  };

  // THÊM MỚI: Hàm xử lý đăng nhập bằng Google
  const handleGoogleLogin = async (code) => {
    setIsSubmitting(true);
    try {
      const { success, user } = await AuthService.loginWithGoogle(code);
      if (success) {
        toast.success(`👋 Chào mừng, ${user.fullName}!`);
        // Tải lại trang để App.js có thể phát hiện trạng thái đăng nhập mới
        window.location.reload(); 
      }
    } catch (error) {
      toast.error(error.message || "Đăng nhập bằng Google thất bại.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">{isWaitingForOtp ? "Xác Thực 2 Bước (2FA)" : "Đăng Nhập"}</h2>
      
      {!isWaitingForOtp ? (
        <>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Email hoặc Username</label>
              <input 
                id="login-username"
                type="text" 
                value={usernameOrEmail} 
                onChange={e => setUsernameOrEmail(e.target.value)} 
                placeholder="Nhập email hoặc username" 
                disabled={isSubmitting}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Mật khẩu</label>
              <input 
                id="login-password"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                disabled={isSubmitting}
                required 
              />
            </div>
            <button id="login-submit" type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "⌛ Đang xác thực..." : "Đăng Nhập Hệ Thống"}
            </button>
          </form>
          
          <p className="toggle-text" style={{ marginTop: '15px' }}>
            <Link to="/forgot-password" className="auth-link">Quên mật khẩu?</Link>
          </p>

          {/* THÊM MỚI: Nút đăng nhập bằng Google */}
          <GoogleLoginButton onGoogleLogin={handleGoogleLogin} />

          <p className="toggle-text">
            Chưa có tài khoản? <span onClick={!isSubmitting ? onToggle : null} className="toggle-link">Đăng ký ngay</span>
          </p>
        </>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ textAlign: 'center', marginBottom: '15px', color: '#666', fontSize: '14px' }}>
            Mã OTP (6 chữ số) đã được gửi đến email của bạn. Mã sẽ hết hạn sau 5 phút.
          </p>
          <div className="form-group">
            <label htmlFor="otp-input">Nhập mã OTP</label>
            <input 
              id="otp-input"
              type="text" 
              maxLength="6"
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
              placeholder="123456" 
              disabled={isSubmitting}
              required 
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isSubmitting || otp.length < 6}>
            {isSubmitting ? "⌛ Đang kiểm tra..." : "Xác Nhận Đăng Nhập"}
          </button>
          
          <p className="toggle-text" style={{ marginTop: '20px' }}>
            Không nhận được mã?{' '}
            <span 
              onClick={handleResendOtp} 
              className="toggle-link"
              style={{ color: countdown > 0 ? '#aaa' : '#007bff', cursor: countdown > 0 ? 'not-allowed' : 'pointer', textDecoration: countdown > 0 ? 'none' : 'underline' }}
            >
              {countdown > 0 ? `Gửi lại sau (${countdown}s)` : "Gửi lại OTP"}
            </span>
          </p>
          
          <p className="toggle-text" style={{ marginTop: '10px' }}>
            <span onClick={() => setIsWaitingForOtp(false)} className="toggle-link">Quay lại đăng nhập</span>
          </p>
        </form>
      )}
    </div>
  );
}

export default Login;
