import React, { useState, useEffect } from 'react';
import TaskCard from '../TaskCard';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '../services/AuthService';
import CustomerRequestForm from '../components/CustomerRequestForm';
import { ProjectFilterToggle } from '../components/ui/ProjectFilterToggle';
import { EmptyProjectState } from '../components/ui/EmptyProjectState';

const CustomerDashboard = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [projectFilter, setProjectFilter] = useState('my'); // 'my' hoặc 'all'

  const fetchDashboardData = () => {
    setLoading(true);
    
    const projectPromise = projectFilter === 'all' 
      ? ProjectService.getAllProjects() 
      : ProjectService.getMyProjects();

    Promise.all([
        TaskService.getMyRequests(),
        projectPromise
    ]).then(([tasksRes, projectsRes]) => {
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
    }).catch(err => {
        console.error(err);
        toast.error("Không thể tải dữ liệu cho trang chủ của khách hàng.");
    }).finally(() => {
        setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [projectFilter]);

  const handleCreateRequest = async (formData) => {
    try {
        await TaskService.createCustomerRequest(formData);
        toast.success("✅ Yêu cầu của bạn đã được gửi!");
        setShowRequestModal(false);
        fetchDashboardData();
    } catch (err) {
        toast.error("Không thể gửi yêu cầu lúc này: " + extractErrorMessage(err));
    }
  };

  const filteredTasks = tasks.filter(task => {
    return !selectedProjectId || task.projectId === parseInt(selectedProjectId);
  });

  if (loading && tasks.length === 0) return <div className="loading-screen">⌛ Đang tải dữ liệu...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen bg-gray-50/50">
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
                    <ProjectFilterToggle 
                        currentFilter={projectFilter} 
                        onFilterChange={setProjectFilter} 
                        userRoles={currentUser?.roles?.map(r => r.role) || []} 
                    />
                </div>
                <div className="p-3">
                    {projects.length > 0 ? (
                        <ul className="space-y-1">
                            <li>
                                <button
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedProjectId === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    onClick={() => setSelectedProjectId('')}
                                >
                                    Tất cả dự án
                                </button>
                            </li>
                            {projects.map(p => (
                                <li key={p.id}>
                                    <button
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors truncate ${selectedProjectId === p.id.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                        onClick={() => setSelectedProjectId(p.id.toString())}
                                        title={p.name}
                                    >
                                        {p.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyProjectState canCreateProject={false} />
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 min-w-0">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">👋 Chào mừng quý khách!</h1>
                    <p className="mt-1 text-sm text-gray-500">Dưới đây là danh sách các yêu cầu công việc bạn đang theo dõi.</p>
                </div>
                <button 
                    onClick={() => setShowRequestModal(true)} 
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                >
                    🎫 Gửi Yêu Cầu Mới
                </button>
            </header>

            {showRequestModal && (
                <CustomerRequestForm
                    title="Gửi Yêu Cầu Hỗ Trợ"
                    onSubmit={handleCreateRequest}
                    onClose={() => setShowRequestModal(false)}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(t => (
                        <TaskCard 
                            key={t.id} 
                            task={t} 
                            canManage={false}
                        />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">🎫</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy yêu cầu</h3>
                        <p className="text-gray-500 max-w-sm">Không tìm thấy yêu cầu nào khớp với bộ lọc của bạn.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CustomerDashboard;
