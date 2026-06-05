import React from 'react';
import { motion } from 'framer-motion';
import { Users, FolderKanban, CheckSquare, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
        >
            <div className={`p-3 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </motion.div>
    );
};

const DashboardStats = ({ stats, setActiveView }) => {
    const defaultStats = {
        users: 0,
        projects: 0,
        tasks: 0,
        pending: 0,
        overdueProjects: 0,
        ...stats
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard 
                title="Tổng Users" 
                value={defaultStats.users} 
                icon={Users} 
                color="bg-indigo-500 shadow-indigo-200 shadow-md"
                delay={0.1}
                onClick={() => setActiveView && setActiveView('users')}
            />
            <StatCard 
                title="Tổng Projects" 
                value={defaultStats.projects} 
                icon={FolderKanban} 
                color="bg-blue-500 shadow-blue-200 shadow-md"
                delay={0.2}
                onClick={() => setActiveView && setActiveView('projects')}
            />
            <StatCard 
                title="Tổng Tasks" 
                value={defaultStats.tasks} 
                icon={CheckSquare} 
                color="bg-emerald-500 shadow-emerald-200 shadow-md"
                delay={0.3}
                onClick={() => setActiveView && setActiveView('tasks')}
            />
            <StatCard 
                title="Overdue Tasks" 
                value={defaultStats.pending} 
                icon={Clock} 
                color="bg-rose-500 shadow-rose-200 shadow-md"
                delay={0.4}
                onClick={() => setActiveView && setActiveView('tasks')}
            />
            <StatCard 
                title="Overdue Projects" 
                value={defaultStats.overdueProjects} 
                icon={Clock} 
                color="bg-red-600 shadow-red-200 shadow-md"
                delay={0.5}
                onClick={() => setActiveView && setActiveView('projects')}
            />
        </div>
    );
};

export default DashboardStats;
