import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthService from '../services/AuthService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await AuthService.forgotPassword(email);
            setMessage(response.data);
            toast.success("Yêu cầu đã được gửi!");
        } catch (error) {
            toast.error("Đã có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Quên Mật Khẩu</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                    Nhập email của bạn để nhận link đặt lại mật khẩu.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@gmail.com"
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                    </button>
                </form>
                {message && <p style={{ color: 'green', marginTop: '15px', textAlign: 'center' }}>{message}</p>}
                <p className="toggle-text" style={{ marginTop: '20px' }}>
                    <Link to="/" className="toggle-link">Quay lại Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
