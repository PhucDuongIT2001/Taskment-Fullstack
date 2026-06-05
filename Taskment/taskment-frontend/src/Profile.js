import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css';
import UserService from './services/UserService';
import { toast } from 'react-toastify';
import useAuth from './useAuth';

function Profile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isBasicInfoEditing, setIsBasicInfoEditing] = useState(false);
  const [basicFormData, setBasicFormData] = useState({
      email: '',
      fullName: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      avatarUrl: '',
      gender: '',
      bio: ''
  });

  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
  });

  useEffect(() => {
    // THÊM KIỂM TRA: Chỉ gọi API khi userId có giá trị hợp lệ
    if (userId && userId !== 'undefined') {
      setLoading(true);
      UserService.getProfile(userId)
        .then(response => {
          setProfile(response.data);
          setBasicFormData({
              email: response.data.email || '',
              fullName: response.data.fullName || '',
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              phoneNumber: response.data.phoneNumber || '',
              address: response.data.address || '',
              dateOfBirth: response.data.dateOfBirth || '',
              avatarUrl: response.data.avatarUrl || '',
              gender: response.data.gender || '',
              bio: response.data.bio || ''
          });
        })
        .catch(err => {
          setError(err.response?.data?.message || "Không thể tải thông tin hồ sơ.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("ID người dùng không hợp lệ.");
      setLoading(false);
    }
  }, [userId]);

  const handleBasicInfoChange = (e) => {
    setBasicFormData({ ...basicFormData, [e.target.name]: e.target.value });
  };

  const handleBasicInfoSave = async (e) => {
    e.preventDefault();
    try {
      const response = await UserService.updateProfile(userId, basicFormData);
      setProfile(response.data);
      setIsBasicInfoEditing(false);
      toast.success("🎉 Cập nhật thông tin cơ bản thành công!");
    } catch (err) {
      toast.error("❌ Lỗi khi cập nhật: " + (err.response?.data?.message || err.message));
    }
  };

  const handleBasicInfoCancel = () => {
    setIsBasicInfoEditing(false);
    setBasicFormData({
        email: profile.email || '',
        fullName: profile.fullName || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth || '',
        avatarUrl: profile.avatarUrl || '',
        gender: profile.gender || '',
        bio: profile.bio || ''
    });
  };

  const handlePasswordFormChange = (e) => {
    setPasswordFormData({ ...passwordFormData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
        toast.error("❌ Mật khẩu mới và xác nhận mật khẩu không khớp!");
        return;
    }
    if (!passwordFormData.oldPassword || !passwordFormData.newPassword) {
        toast.error("❌ Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!");
        return;
    }

    try {
        await UserService.changePassword(userId, { 
            oldPassword: passwordFormData.oldPassword, 
            newPassword: passwordFormData.newPassword 
        });
        toast.success("🔑 Mật khẩu đã được thay đổi thành công!");
        setIsPasswordEditing(false);
        setPasswordFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
        toast.error("❌ Lỗi khi đổi mật khẩu: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="profile-loading">Đang tải thông tin...</div>;
  if (error) return <div className="profile-error">Lỗi: {error}</div>;
  if (!profile) return <div className="profile-error">Không tìm thấy dữ liệu hồ sơ.</div>;

  const isOwner = currentUser && currentUser.id === parseInt(userId);

  return (
    <div className="profile-page-layout">
      <div className="profile-sidebar card">
        <div className="profile-avatar-section">
            <img 
              src={basicFormData.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Avatar" 
              className="profile-avatar"
            />
            <h3 className="profile-sidebar-name">{profile.fullName || profile.username}</h3>
            <p className="profile-sidebar-email">{profile.email}</p>
        </div>
        <nav className="profile-nav">
            <button className="profile-nav-item active">Thông tin chung</button>
            {isOwner && <button className="profile-nav-item" onClick={() => setIsPasswordEditing(true)}>Bảo mật</button>}
        </nav>
      </div>

      <div className="profile-main-content">
        <div className="card profile-section">
            <div className="profile-section-header">
                <h2>Thông tin cơ bản</h2>
                {isOwner && !isBasicInfoEditing && (
                    <button onClick={() => setIsBasicInfoEditing(true)} className="submit-btn small">
                        ✏️ Chỉnh sửa
                    </button>
                )}
            </div>
            <form onSubmit={handleBasicInfoSave}>
                <div className="form-group">
                    <label>Tên hiển thị</label>
                    <input type="text" name="fullName" value={basicFormData.fullName} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={basicFormData.email} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Họ</label>
                        <input type="text" name="firstName" value={basicFormData.firstName} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                    </div>
                    <div className="form-group">
                        <label>Tên</label>
                        <input type="text" name="lastName" value={basicFormData.lastName} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="tel" name="phoneNumber" value={basicFormData.phoneNumber} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                    </div>
                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="dateOfBirth" value={basicFormData.dateOfBirth} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Địa chỉ</label>
                    <input type="text" name="address" value={basicFormData.address} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                </div>
                <div className="form-group">
                    <label>Link ảnh đại diện</label>
                    <input type="url" name="avatarUrl" value={basicFormData.avatarUrl} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing} />
                </div>
                <div className="form-group">
                    <label>Giới thiệu bản thân (Bio)</label>
                    <textarea name="bio" value={basicFormData.bio} onChange={handleBasicInfoChange} disabled={!isBasicInfoEditing}></textarea>
                </div>

                {isBasicInfoEditing && (
                    <div className="modal-actions">
                        <button type="submit" className="submit-btn primary">💾 Lưu thay đổi</button>
                        <button type="button" className="cancel-btn" onClick={handleBasicInfoCancel}>Hủy</button>
                    </div>
                )}
            </form>
        </div>

        {isPasswordEditing && isOwner && (
            <div className="card profile-section" style={{ marginTop: '20px' }}>
                <div className="profile-section-header">
                    <h2>Bảo mật</h2>
                    <button onClick={() => setIsPasswordEditing(false)} className="cancel-btn small">
                        ❌ Đóng
                    </button>
                </div>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label>Mật khẩu cũ</label>
                        <input type="password" name="oldPassword" value={passwordFormData.oldPassword} onChange={handlePasswordFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input type="password" name="newPassword" value={passwordFormData.newPassword} onChange={handlePasswordFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <input type="password" name="confirmNewPassword" value={passwordFormData.confirmNewPassword} onChange={handlePasswordFormChange} required />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="submit-btn primary">🔑 Đổi mật khẩu</button>
                    </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
