import React, { useState } from 'react';
import TaskCard from './TaskCard';
import './App.css';

function Home() {
  // Tạo dữ liệu mẫu (mock data) để hiển thị giao diện ban đầu
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Hoàn thiện Homepage cơ bản",
      description: "Code giao diện trang chủ, hiển thị danh sách công việc dạng lưới (Grid).",
      project: { name: "Đồ án chuyên ngành" },
      status: { name: "Đang làm" },
      assignee: { fullName: "Phúc Dương" }
    },
    {
      id: 2,
      title: "Tối ưu hóa TaskCard",
      description: "Áp dụng Semantic HTML và Clean Code cho component thẻ công việc.",
      project: { name: "Đồ án chuyên ngành" },
      status: { name: "Hoàn thành" },
      assignee: { fullName: "Phúc Dương" }
    },
    {
      id: 3,
      title: "Kết nối API Backend",
      description: "Sử dụng Axios để lấy dữ liệu thực tế từ server.",
      project: null, // Thử nghiệm trường hợp project bị null
      status: { name: "Chưa bắt đầu" },
      assignee: null // Thử nghiệm trường hợp chưa có người nhận
    }
  ]);

  // Hàm xử lý khi bấm nút "Xóa" trên TaskCard
  const handleDelete = (taskId) => {
    // Lọc ra danh sách mới bỏ đi task có id trùng với id cần xóa
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  };

  return (
    <div className="container">
      <h1 className="title">📌 Quản lý Công việc (Taskment)</h1>
      
      {/* Vùng chứa dạng lưới (Grid) đã được định nghĩa trong App.css */}
      <div className="task-grid">
        {/* Duyệt qua mảng tasks và render ra các component TaskCard */}
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={handleDelete} 
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#7f8c8d' }}>
            🎉 Tuyệt vời! Bạn không còn công việc nào cần xử lý.
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;