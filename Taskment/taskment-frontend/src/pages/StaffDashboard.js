import React, { useState, useEffect } from 'react';
import ProjectList from '../ProjectList';
import TaskCard from '../TaskCard';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import AddTask from '../AddTask';
import EditTask from '../EditTask';
import { toast } from 'react-toastify';

const StaffDashboard = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = () => {
    TaskService.getMyTasks()
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  };

  const loadProjects = () => {
    ProjectService.getMyProjects()
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      TaskService.deleteTask(id).then(() => {
        toast.warn("🗑️ Đã xóa công việc!");
        loadTasks();
      });
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const filteredTasks = selectedProjectId 
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : tasks;

  const canManage = currentUser?.roles?.some(r => r.role === 'ROLE_ADMIN' || r.role === 'ROLE_STAFF_LEADER');

  return (
    <div className="main-layout">
        <ProjectList 
            projects={projects} 
            selectedProjectId={selectedProjectId} 
            onSelectProject={setSelectedProjectId} 
        />
        <div className="content-area">
            <div className="content-header">
                <h1 className="title">
                    📋 {selectedProjectId ? `Dự án: ${projects.find(p => p.id === selectedProjectId)?.name}` : 'Tất cả công việc'}
                </h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span className="task-count">{filteredTasks.length} công việc</span>
                    {canManage && (
                        <button onClick={() => setShowAddModal(true)} className="add-task-btn">➕ Thêm Task</button>
                    )}
                </div>
            </div>
            
            <div className="task-grid">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(t => (
                        <TaskCard 
                          key={t.id} 
                          task={t} 
                          onDelete={handleDelete} 
                          onEdit={openEditModal} 
                          canManage={canManage}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>🌟 Chưa có công việc nào. Hãy thêm task mới để bắt đầu!</p>
                    </div>
                )}
            </div>
        </div>

        {showAddModal && (
            <AddTask 
                onTaskAdded={() => { setShowAddModal(false); loadTasks(); }} 
                onCancel={() => setShowAddModal(false)} 
            />
        )}

        {showEditModal && (
            <EditTask 
                task={editingTask}
                onTaskUpdated={() => { setShowEditModal(false); setEditingTask(null); loadTasks(); }}
                onCancel={() => setShowEditModal(false)}
            />
        )}
    </div>
  );
};

export default StaffDashboard;
