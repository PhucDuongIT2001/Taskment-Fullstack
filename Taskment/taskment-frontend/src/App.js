import React, { useEffect, useState } from 'react';
import './App.css';
import TaskCard from './TaskCard';
import Auth from './Auth'; // Import trang Đăng nhập / Đăng ký mới tạo
import useAuth from './useAuth'; // Import Custom Hook mới tạo
import Profile from './Profile'; // Import trang Profile mới tạo

function App() {
  const [tasks, setTasks] = useState([]);
  
  // Dùng custom hook để quản lý toàn bộ logic liên quan đến Auth
  const { isAuthenticated, currentUser, login, register, logout } = useAuth();
  
  // State quản lý tab đang hiển thị: mặc định là 'home'
  const [currentTab, setCurrentTab] = useState('home'); 

  const loadTasks = () => {
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn muốn xoá task này?")) {
      fetch(`http://localhost:8080/api/tasks/${id}`, { method: 'DELETE' })
        .then(() => loadTasks());
    }
  };

  useEffect(() => { loadTasks(); }, []);

  // KIỂM TRA ĐIỀU KIỆN TẠI ĐÂY
  // Nếu người dùng chưa đăng nhập, hiển thị trang Auth (Đăng nhập / Đăng ký)
  if (!isAuthenticated) {
    return (
      <Auth 
        login={login}
        register={register}
      />
    );
  }

  // Nếu đã đăng nhập (isAuthenticated = true) thì hiển thị bảng công việc
  return (
    <div className="container">
      {/* Thanh Toolbar / Navbar điều hướng */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        paddingBottom: '20px', 
        borderBottom: '2px solid #ecf0f1', 
        marginBottom: '20px' 
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setCurrentTab('home')} 
            className="submit-btn" 
            style={{ width: 'auto', margin: 0, backgroundColor: currentTab === 'home' ? '#2ecc71' : '#95a5a6' }}
          >
            🏠 Trang chủ
          </button>
          <button 
            onClick={() => setCurrentTab('profile')} 
            className="submit-btn" 
            style={{ width: 'auto', margin: 0, backgroundColor: currentTab === 'profile' ? '#2ecc71' : '#95a5a6' }}
          >
            👤 Hồ sơ
          </button>
        </div>
        <button onClick={logout} className="delete-btn">🚪 Đăng Xuất</button>
      </nav>

      {/* Khu vực hiển thị nội dung tùy theo tab đang chọn */}
      {currentTab === 'home' ? (
        <>
          <h1 className="title">📋 Quản Lý Công Việc</h1>
          <div className="task-grid">
            {tasks.map(t => (
              <TaskCard key={t.id} task={t} onDelete={handleDelete} />
            ))}
          </div>
        </>
      ) : (
        /* Dấu ?. giúp tránh lỗi nếu currentUser bị null */
        <Profile userId={currentUser?.id} /> 
      )}
    </div>
  );
}

export default App;