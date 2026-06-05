import React, { useState } from 'react';
import { toast } from 'react-toastify';

function Register({ onToggle, onRegister }) {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // THÊM MỚI
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState('ROLE_CUSTOMER'); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("❌ Vui lòng nhập tên đăng nhập!");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("❌ Tên đăng nhập không được có dấu hoặc khoảng trắng!");
      return;
    }

    // KIỂM TRA MẬT KHẨU TRÙNG KHỚP
    if (password !== confirmPassword) {
        toast.error("❌ Mật khẩu nhập lại không khớp!");
        return;
    }

    setIsSubmitting(true);
    
    const fullName = (lastName.trim() || firstName.trim())
      ? `${lastName} ${firstName}`.trim() 
      : username;

    const result = await onRegister(
        username,
        fullName, 
        email, 
        password, 
        confirmPassword, // ← THÊM: truyền confirmPassword lên useAuth
        dateOfBirth, 
        firstName, 
        lastName, 
        phoneNumber, 
        address, 
        role
    );
    
    if (result === true) {
      toast.success("🎉 Đăng ký thành công! Đang chuyển sang đăng nhập...");
      setTimeout(() => {
        onToggle(); 
      }, 2000);
    } else {
      toast.error(result || "❌ Đăng ký thất bại, vui lòng kiểm tra lại!");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Đăng Ký Tài Khoản</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-username">Tên đăng nhập (Username) *</label>
          <input 
            id="reg-username"
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Vui lòng nhập tên đăng nhập" 
            disabled={isSubmitting}
            required 
          />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="reg-firstName">Tên (First Name)</label>
                <input 
                    id="reg-firstName"
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    placeholder="An (không bắt buộc)" 
                    disabled={isSubmitting}
                />
            </div>
            <div className="form-group">
                <label htmlFor="reg-lastName">Họ (Last Name)</label>
                <input 
                    id="reg-lastName"
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    placeholder="Nguyễn (không bắt buộc)" 
                    disabled={isSubmitting}
                />
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email *</label>
          <input 
            id="reg-email"
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="example@gmail.com" 
            disabled={isSubmitting}
            required 
          />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="reg-phone">Số điện thoại</label>
                <input 
                    id="reg-phone"
                    type="text" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    placeholder="vui lòng nhập số dth" 
                    disabled={isSubmitting}
                />
            </div>
            <div className="form-group">
                <label htmlFor="reg-dob">Ngày sinh *</label>
                <input 
                    id="reg-dob"
                    type="date" 
                    value={dateOfBirth} 
                    onChange={e => setDateOfBirth(e.target.value)} 
                    disabled={isSubmitting}
                    required 
                />
            </div>
        </div>

        <div className="form-group">
            <label htmlFor="reg-address">Địa chỉ</label>
            <input 
                id="reg-address"
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="Số nhà, đường... (không bắt buộc)" 
                disabled={isSubmitting}
            />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label htmlFor="reg-password">Mật khẩu *</label>
                <input 
                    id="reg-password"
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    disabled={isSubmitting}
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="reg-confirm-password">Nhập lại mật khẩu *</label>
                <input
                    id="reg-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    required
                />
            </div>
        </div>

        <div className="form-group">
            <label htmlFor="reg-role">Phân quyền</label>
            <select id="reg-role" value={role} onChange={e => setRole(e.target.value)} disabled={isSubmitting}>
                <option value="ROLE_CUSTOMER">Khách hàng (Customer)</option>
                <option value="ROLE_STAFF_MEMBER">Nhân viên (Staff)</option>
            </select>
        </div>

        <button id="reg-submit" type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "⌛ Đang xử lý..." : "Đăng Ký Tài Khoản"}
        </button>
      </form>
      <p className="toggle-text">
        Đã có tài khoản? <span onClick={!isSubmitting ? onToggle : null} className="toggle-link">Đăng nhập</span>
      </p>
    </div>
  );
}

export default Register;
