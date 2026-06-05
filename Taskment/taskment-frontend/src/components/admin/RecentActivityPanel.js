import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import api from '../../services/api';

const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'SUCCESS': return <div className="p-2 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle className="w-4 h-4" /></div>;
        case 'WARNING': return <div className="p-2 rounded-full bg-amber-100 text-amber-600"><AlertTriangle className="w-4 h-4" /></div>;
        case 'ERROR': return <div className="p-2 rounded-full bg-rose-100 text-rose-600"><AlertTriangle className="w-4 h-4" /></div>;
        case 'INFO':
        default: return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Info className="w-4 h-4" /></div>;
    }
};

const ActivityItem = ({ activity, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className="relative flex gap-4 pb-6 last:pb-0 group"
        >
            <div className="absolute left-[19px] top-10 bottom-[-10px] w-0.5 bg-gray-100 group-last:hidden"></div>
            
            <div className="flex-shrink-0 relative z-10">
                <ActivityIcon type={activity.type} />
            </div>
            
            <div className="flex-1 min-w-0 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-800 font-medium leading-snug mb-1">{activity.message}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: vi })}</span>
                </div>
            </div>
        </motion.div>
    );
};

const RecentActivityPanel = () => {
    const token = localStorage.getItem("token");
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/admin/activities');
            setActivities(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch admin activities:', err);
            setError('Không thể tải lịch sử hoạt động.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchActivities();
        }
    }, [token]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden sticky top-6"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-900">Hoạt động gần đây</h3>
                </div>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                    {activities.length} mới
                </span>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-4">{error}</div>
                ) : activities.length > 0 ? (
                    <div className="relative">
                        <AnimatePresence>
                            {activities.map((activity, index) => (
                                <ActivityItem key={activity.id} activity={activity} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-10">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-600">Chưa có hoạt động nào</p>
                        <p className="text-sm mt-1">Các sự kiện hệ thống sẽ xuất hiện tại đây.</p>
                    </div>
                )}
            </div>
            
            <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
                <button onClick={fetchActivities} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    Làm mới
                </button>
            </div>
        </motion.div>
    );
};

export default RecentActivityPanel;
