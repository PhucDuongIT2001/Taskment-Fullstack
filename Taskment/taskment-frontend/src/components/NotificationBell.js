import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useAuth from '../useAuth';
import NotificationService from '../services/NotificationService';
import { toast } from 'react-toastify';
import { Bell, AlertCircle, Clock, Info, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getWebSocketUrl } from '../services/api';

const NotificationBell = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const stompClientRef = useRef(null);
    const dropdownRef = useRef(null);

    const fetchInitialNotifications = () => {
        NotificationService.getMyNotifications()
            .then(response => {
                setNotifications(response.data);
                const unread = response.data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            })
            .catch(error => console.error("Could not fetch notifications."));
    };

    useEffect(() => {
        if (!currentUser) return;

        fetchInitialNotifications();

        const client = new Client({
            webSocketFactory: () => new SockJS(getWebSocketUrl()),
            onConnect: () => {
                stompClientRef.current = client;
                client.subscribe(`/user/${currentUser.username}/queue/notifications`, (payload) => {
                    const newNotification = JSON.parse(payload.body);
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Toast popup realtime
                    if (newNotification.type === 'OVERDUE') {
                        toast.error(newNotification.message, { icon: "🔥", autoClose: 10000 });
                    } else if (newNotification.type && newNotification.type.startsWith('DEADLINE')) {
                        toast.warn(newNotification.message, { icon: "⏰", autoClose: 8000 });
                    } else {
                        toast.info(newNotification.message);
                    }
                });
            },
        });

        client.activate();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [currentUser]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        if (unreadCount === 0) return;
        NotificationService.markAllAsRead().then(() => {
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        }).catch(err => console.error("Error marking all as read"));
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            markAllAsRead();
        }
        setIsOpen(!isOpen);
    };

    const getIcon = (type) => {
        if (type === 'OVERDUE') return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (type && type.startsWith('DEADLINE')) return <Clock className="w-5 h-5 text-amber-500" />;
        if (type === 'SYSTEM') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        return <Info className="w-5 h-5 text-blue-500" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown} 
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Thông báo"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full animate-bounce">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right transition-transform duration-200 ease-out">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>
                    
                    <ul className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <li key={notif.id} className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/30' : 'bg-white'}`}>
                                    <Link to={notif.link || '#'} onClick={() => setIsOpen(false)} className="flex items-start gap-3 p-4">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${notif.type === 'OVERDUE' ? 'text-red-700 font-medium' : 'text-gray-800'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                                        )}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Không có thông báo mới</p>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
