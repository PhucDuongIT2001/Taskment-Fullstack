import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State quản lý việc bật/tắt chế độ chỉnh sửa và lưu dữ liệu Form
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', dateOfBirth: '', avatarUrl: '' });

  // Hàm hỗ trợ định dạng ngày tháng từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị đẹp hơn
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const parts = dateString.split('-'); // Tách năm, tháng, ngày
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`; // Đảo ngược lại
    return dateString;
  };

  useEffect(() => {
    // Gọi API từ UserController: GET /api/users/{id}
    const fetchUserId = userId; 
    
    // Sửa tại đây: Nếu không có ID, báo lỗi và tắt loading
    if (!fetchUserId) {
      setError("Không nhận được ID người dùng. Vui lòng thử đăng xuất và đăng nhập lại.");
      setLoading(false);
      return; 
    }
    
    fetch(`http://localhost:8080/api/users/${fetchUserId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Không thể tải thông tin người dùng');
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  // Hàm xử lý khi bấm nút "Chỉnh sửa"
  const handleEditClick = () => {
    setEditData({
      fullName: user.fullName || '',
      dateOfBirth: user.dateOfBirth || '',
      avatarUrl: user.avatarUrl || ''
    });
    setIsEditing(true); // Bật form lên
  };

  // Hàm xử lý khi bấm "Lưu" -> Gọi API PUT xuống Spring Boot
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Trộn dữ liệu cũ của user với dữ liệu mới từ form
        body: JSON.stringify({ ...user, ...editData }) 
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser); // Cập nhật lại giao diện bằng dữ liệu mới nhất
        setIsEditing(false);  // Tắt form đi
      } else {
        alert("Lỗi khi cập nhật!");
      }
    } catch (err) {
      alert("Lỗi kết nối đến server!");
    }
  };

  if (loading) return <div className="profile-loading">Đang tải thông tin...</div>;
  if (error) return <div className="profile-error">Lỗi: {error}</div>;
  if (!user) return <div className="profile-error">Không tìm thấy dữ liệu người dùng.</div>;

  return (
    <div className="profile-container">
      {/* Phần header: Ảnh đại diện và Thông tin cơ bản */}
      <div className="profile-header">
        <img 
          src={user.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
          alt="Avatar" 
          className="profile-avatar"
        />
        <div className="profile-info-basic">
          {/* Giao diện thay đổi dựa trên state isEditing */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                value={editData.fullName} 
                onChange={e => setEditData({...editData, fullName: e.target.value})} 
                placeholder="Nhập họ và tên" 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <input 
                type="date" 
                value={editData.dateOfBirth} 
                onChange={e => setEditData({...editData, dateOfBirth: e.target.value})} 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <input 
                type="url" 
                value={editData.avatarUrl} 
                onChange={e => setEditData({...editData, avatarUrl: e.target.value})} 
                placeholder="Nhập link ảnh đại diện (VD: https://...)" 
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} className="submit-btn" style={{ margin: 0, padding: '5px 15px', width: 'auto' }}>💾 Lưu</button>
                <button onClick={() => setIsEditing(false)} className="delete-btn" style={{ padding: '5px 15px', width: 'auto' }}>❌ Hủy</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="profile-name">{user.fullName || "Chưa cập nhật tên"}</h2>
              <p className="profile-email">✉️ {user.email || "Chưa cập nhật email"}</p>
              {/* Sử dụng hàm formatDate để xuất ra màn hình */}
              <p className="profile-dob">🎂 Ngày sinh: {formatDate(user.dateOfBirth)}</p>
              <button onClick={handleEditClick} className="submit-btn" style={{ width: 'fit-content', padding: '5px 15px', marginTop: '10px' }}>
                ✏️ Chỉnh sửa hồ sơ
              </button>
            </>
          )}
        </div>
      </div>

      {/* Phần chi tiết: Các dự án tham gia */}
      <div className="profile-projects-section">
        <h3 className="section-title">📂 Các dự án tham gia</h3>
        {user.projects && user.projects.length > 0 ? (
          <div className="projects-grid">
            {user.projects.map((project, index) => (
              <div key={index} className="project-card">
                <h4 className="project-title">{project.name}</h4>
                <p className="project-role">Vai trò: {project.role || "Thành viên"}</p>
                <span className="project-status">{project.status || "Đang hoạt động"}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-projects-text">
            Người dùng này hiện chưa tham gia dự án nào.
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;