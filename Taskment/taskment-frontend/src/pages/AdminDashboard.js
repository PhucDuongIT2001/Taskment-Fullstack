import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminUserManagement from './AdminUserManagement';
import AdminTaskManagement from './AdminTaskManagement';
import AdminProjectManagement from './AdminProjectManagement';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import ChatWindow from '../components/ChatWindow';
import ChatBubble from '../components/ChatBubble';
import useAuth from '../useAuth';

// Import New Modern Components
import DashboardStats from '../components/admin/DashboardStats';
import DashboardChart from '../components/admin/DashboardChart';
import AdminNavigation from '../components/admin/AdminNavigation';
import RecentActivityPanel from '../components/admin/RecentActivityPanel';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const [activeView, setActiveView] = useState('overview');
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        if (activeView === 'overview') {
            Promise.all([
                TaskService.getAllTasks(),
                ProjectService.getAllProjects()
            ]).then(([tasksRes, projectsRes]) => {
                setTasks(tasksRes.data);
                setProjects(projectsRes.data);
                setLoading(false);
            }).catch(err => {
                console.error("Lỗi khi tải dữ liệu cho dashboard:", err);
                setLoading(false);
            });
        }
    }, [activeView]);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const AdminOverview = () => {
        // Calculate basic stats from tasks for demonstration
        const overdueTasks = tasks.filter(t => t.overdue === true || (t.dueDate && new Date(t.dueDate) < new Date() && t.statusName !== 'DONE' && t.statusName !== 'Done')).length;
        const overdueProjectsCount = projects.filter(p => p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'COMPLETED').length;
        
        const mockStats = {
            users: 156, // Hardcoded or fetch from API
            projects: projects.length || 24, // Hardcoded or fetch from API
            tasks: tasks.length,
            pending: overdueTasks,
            overdueProjects: overdueProjectsCount
        };

        return (
            <motion.div 
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.4 }}
                className="flex flex-col lg:flex-row gap-6"
            >
                {/* Left Column (70%) */}
                <div className="w-full lg:w-[70%] flex flex-col">
                    <DashboardStats stats={mockStats} setActiveView={setActiveView} />
                    <DashboardChart tasks={tasks} />
                    <AdminNavigation setActiveView={setActiveView} />
                </div>

                {/* Right Column (30%) - Sidebar */}
                <div className="w-full lg:w-[30%]">
                    <RecentActivityPanel />
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 
                        className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 cursor-pointer flex items-center gap-2"
                        onClick={() => setActiveView('overview')}
                    >
                        <span>🛡️</span> Admin Control Center
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý và giám sát toàn bộ hoạt động hệ thống</p>
                </div>

                {activeView !== 'overview' && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveView('overview')} 
                        className="px-5 py-2.5 rounded-xl border border-indigo-200 bg-white text-indigo-600 font-semibold shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Quay lại Tổng quan
                    </motion.button>
                )}
            </div>
            
            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={{ duration: 0.3 }}
                >
                    {activeView === 'overview' && <AdminOverview />}
                    {activeView === 'projects' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"><AdminProjectManagement /></div>
                    )}
                    {activeView === 'users' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"><AdminUserManagement /></div>
                    )}
                    {activeView === 'tasks' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"><AdminTaskManagement /></div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Global Chat Overlay */}
            {isChatOpen && <ChatWindow username={currentUser?.username} />}
            <ChatBubble onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />
        </div>
    );
};

export default AdminDashboard;
