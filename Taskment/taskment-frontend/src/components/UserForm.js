import React, { useState, useEffect } from 'react';
import RoleService from '../services/RoleService';
import { toast } from 'react-toastify';

function UserForm({ initialData, onSubmit, onClose, title }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '', // THÊM MỚI
        fullName: '',
        roleNames: []
    });
    const [allRoles, setAllRoles] = useState([]);

    useEffect(() => {
        RoleService.getAllRoles()
            .then(response => {
                setAllRoles(response.data);
            })
            .catch(error => {
                console.error("Không thể tải danh sách quyền:", error);
            });

        if (initialData) {
            setFormData({
                username: initialData.username || '',
                email: initialData.email || '',
                fullName: initialData.fullName || '',
                password: '', // Không hiển thị password cũ
                confirmPassword: '', // Reset confirm password khi mở form sửa
                roleNames: initialData.roles?.map(r => r.role) || []
            });
        }
    }, [initialData]);

    const handleRoleChange = (roleName) => {
        const currentRoles = formData.roleNames;
        if (currentRoles.includes(roleName)) {
            setFormData({ ...formData, roleNames: currentRoles.filter(r => r !== roleName) });
        } else {
            setFormData({ ...formData, roleNames: [...currentRoles, roleName] });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // VALIDATION: Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("❌ Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        const submitData = {
            username: formData.username,
            email: formData.email,
            fullName: formData.fullName,
            // Chỉ gửi password nếu có giá trị (người dùng muốn đổi)
            password: formData.password || undefined, 
            roleNames: formData.roleNames
        };
        onSubmit(submitData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="close-x" onClick={onClose}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!initialData} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>

                    {/* PHẦN THAY ĐỔI MẬT KHẨU */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mật khẩu mới {initialData ? '(Để trống nếu không muốn đổi)' : ''}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phân quyền</label>
                        <div className="role-checkbox-group">
                            {allRoles.map(role => (
                                <label key={role.id} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value={role.role}
                                        checked={formData.roleNames.includes(role.role)}
                                        onChange={() => handleRoleChange(role.role)}
                                    />
                                    {role.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn primary">
                            {initialData?.id ? '💾 Lưu thay đổi' : '🚀 Tạo người dùng'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserForm;
