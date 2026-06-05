import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await AuthService.resetPassword(token, password);
            setMessage(response.data);
            toast.success("Đặt lại mật khẩu thành công!");
            setTimeout(() => navigate('/'), 3000); // Chuyển về trang đăng nhập sau 3s
        } catch (err) {
            setError(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
            toast.error(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Lỗi</h2>
                    <p style={{ textAlign: 'center', color: 'red' }}>
                        Token đặt lại mật khẩu không được tìm thấy. Vui lòng thử lại.
                    </p>
                    <Link to="/forgot-password">Yêu cầu link mới</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Đặt Lại Mật Khẩu</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu mới</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                    </button>
                </form>
                
                {message && <p style={{ color: 'green', marginTop: '15px', textAlign: 'center' }}>{message}</p>}
                {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
