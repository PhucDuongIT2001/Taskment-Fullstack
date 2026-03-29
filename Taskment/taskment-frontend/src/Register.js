import React, { useState } from 'react';

function Register({ onToggle, onRegister }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Truyền chuỗi rỗng "" cho avatarUrl để rút gọn form, người dùng sẽ cập nhật sau ở Profile
    const success = await onRegister(fullName, email, password, dateOfBirth, "");
    if (success) {
      onToggle(); // Chuyển về trang đăng nhập
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Đăng Ký Tài Khoản</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ và tên</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            placeholder="Nhập họ và tên" 
            required 
          />
        </div>
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
        
        <div className="form-group">
          <label>Ngày sinh</label>
          <input 
            type="date" 
            value={dateOfBirth} 
            onChange={e => setDateOfBirth(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className="submit-btn">Đăng Ký</button>
      </form>
      <p className="toggle-text">
        Đã có tài khoản? <span onClick={onToggle} className="toggle-link">Đăng nhập</span>
      </p>
    </div>
  );
}

export default Register;