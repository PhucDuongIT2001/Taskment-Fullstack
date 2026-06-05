import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaskCard from '../TaskCard';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ProjectFilterToggle } from '../components/ui/ProjectFilterToggle';
import { EmptyProjectState } from '../components/ui/EmptyProjectState';

const MemberDashboard = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('my'); // 'my' hoặc 'all'

  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    setLoading(true);
    
    const projectPromise = projectFilter === 'all' 
      ? ProjectService.getAllProjects() 
      : ProjectService.getMyProjects();

    Promise.all([
        TaskService.getMyTasks(),
        projectPromise,
        api.get('/statuses'),
        api.get('/priorities')
    ]).then(([tasksRes, projectsRes, statusesRes, prioritiesRes]) => {
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
        setStatuses(statusesRes.data);
        setPriorities(prioritiesRes.data);
    }).catch(err => {
        toast.error("Không thể tải dữ liệu cho trang chủ.");
    }).finally(() => {
        setLoading(false);
    });
  }, [currentUser, projectFilter]);

  const filteredTasks = tasks.filter(task => {
    const matchStatus = !filterStatus || task.statusName === filterStatus;
    const matchPriority = !filterPriority || task.priorityName === filterPriority;
    const matchSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = !selectedProjectId || task.projectId === parseInt(selectedProjectId);
    return matchStatus && matchPriority && matchSearch && matchProject;
  });

  const stats = {
    inProgress: filteredTasks.filter(t => t.statusName?.toLowerCase().includes('in progress') || t.statusName?.toLowerCase().includes('đang làm')).length,
    done: filteredTasks.filter(t => t.statusName?.toLowerCase().includes('done') || t.statusName?.toLowerCase().includes('hoàn thành')).length,
    todo: filteredTasks.filter(t => t.statusName?.toLowerCase().includes('to do') || t.statusName?.toLowerCase().includes('cần làm')).length,
  };

  if (loading && tasks.length === 0) return <div className="loading-screen">⌛ Đang tải công việc của bạn...</div>;

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
            <header className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">👋 Chào mừng trở lại, {currentUser?.fullName || currentUser?.username}!</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
                    <h3 className="text-gray-500 font-medium mb-2">📝 Cần làm (To-do)</h3>
                    <p className="text-3xl font-bold text-blue-500">{stats.todo}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
                    <h3 className="text-gray-500 font-medium mb-2">🏃 Đang làm (In Progress)</h3>
                    <p className="text-3xl font-bold text-yellow-500">{stats.inProgress}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
                    <h3 className="text-gray-500 font-medium mb-2">✅ Đã xong (Done)</h3>
                    <p className="text-3xl font-bold text-green-500">{stats.done}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm công việc..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <select 
                        value={filterPriority} 
                        onChange={e => setFilterPriority(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                    >
                        <option value="">Tất cả độ ưu tiên</option>
                        {priorities.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Công việc của tôi <span className="bg-blue-100 text-blue-700 text-sm py-0.5 px-2 rounded-full ml-2">{filteredTasks.length}</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(t => (
                        <Link to={`/task/${t.id}`} key={t.id} className="block group">
                            <TaskCard
                                task={t}
                                canManage={false}
                            />
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-3xl">🚫</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy công việc</h3>
                        <p className="text-gray-500 max-w-sm">Không tìm thấy công việc nào khớp với bộ lọc của bạn.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MemberDashboard;
