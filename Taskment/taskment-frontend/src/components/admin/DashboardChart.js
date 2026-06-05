import React from 'react';
import { motion } from 'framer-motion';
import TaskStatusPieChart from '../charts/TaskStatusPieChart';

const DashboardChart = ({ tasks }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Trạng thái Công việc</h3>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
                {tasks && tasks.length > 0 ? (
                    <TaskStatusPieChart tasks={tasks} />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                        <p>Đang tải dữ liệu biểu đồ...</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DashboardChart;
