import React, { useState } from 'react';

function Login({ onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Nhập email" 
            required 
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Nhập mật khẩu" 
            required 
          />
        </div>
        <button type="submit" className="submit-btn">Đăng Nhập</button>
      </form>
      <p className="toggle-text">
        Chưa có tài khoản? <span onClick={onToggle} className="toggle-link">Đăng ký ngay</span>
      </p>
    </div>
  );
}

export default Login;