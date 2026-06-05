import React from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Users, CheckSquare } from 'lucide-react';

const NavCard = ({ title, description, icon: Icon, onClick, delay, bgColor, iconColor }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`cursor-pointer rounded-2xl p-6 ${bgColor} border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center`}
        >
            <div className={`p-4 rounded-full ${iconColor} mb-4`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </motion.div>
    );
};

const AdminNavigation = ({ setActiveView }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NavCard 
                title="Quản Lý Dự Án" 
                description="Tạo và cấu hình các dự án trong hệ thống." 
                icon={FolderKanban} 
                onClick={() => setActiveView('projects')}
                delay={0.6}
                bgColor="bg-indigo-50/50 hover:bg-indigo-50"
                iconColor="bg-indigo-500 shadow-lg shadow-indigo-200"
            />
            <NavCard 
                title="Quản Lý Người Dùng" 
                description="Quản lý tài khoản và phân quyền người dùng." 
                icon={Users} 
                onClick={() => setActiveView('users')}
                delay={0.7}
                bgColor="bg-blue-50/50 hover:bg-blue-50"
                iconColor="bg-blue-500 shadow-lg shadow-blue-200"
            />
            <NavCard 
                title="Quản Lý Công Việc" 
                description="Xem và quản lý toàn bộ công việc của hệ thống." 
                icon={CheckSquare} 
                onClick={() => setActiveView('tasks')}
                delay={0.8}
                bgColor="bg-emerald-50/50 hover:bg-emerald-50"
                iconColor="bg-emerald-500 shadow-lg shadow-emerald-200"
            />
        </div>
    );
};

export default AdminNavigation;
