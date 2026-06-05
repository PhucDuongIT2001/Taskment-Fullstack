import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(authService.getCurrentUser());
  const stompClientRef = useRef(null);
  const location = useLocation();

  // Đồng bộ user khi chuyển đổi route (đăng nhập/đăng xuất)
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
      setUser(currentUser);
    }
  }, [location.pathname, user]);

  const getSocketUrl = () => {
    const isProd = window.location.hostname !== 'localhost';
    if (isProd) {
      return `${window.location.protocol === 'https:' ? 'https:' : 'http:'}//${window.location.host}/ws`;
    } else {
      return 'http://localhost:8888/ws';
    }
  };

  const fetchNotifications = async () => {
    try {
      if (user) {
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
        const unread = data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const addToast = (notif) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...notif }]);
    // Tự động đóng toast sau 5 giây
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Thiết lập kết nối WebSocket
  useEffect(() => {
    if (!user) {
      // Nếu đăng xuất, ngắt kết nối WebSocket và reset state
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
      return;
    }

    // Lấy thông báo từ DB ngay khi đăng nhập
    fetchNotifications();

    const token = localStorage.getItem('taskment_token');
    const socketUrl = getSocketUrl();

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    client.onConnect = (frame) => {
      console.log('Successfully connected to WebSockets!');
      // Đăng ký nhận thông báo riêng của người dùng
      client.subscribe('/user/queue/notifications', (message) => {
        if (message.body) {
          try {
            const newNotif = JSON.parse(message.body);
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            addToast(newNotif);
          } catch (e) {
            console.error('Error parsing notification message:', e);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      console.error('Additional details:', frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]); // Theo dõi user.username để kích hoạt lại khi đổi tài khoản

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      markAllAsRead,
      removeToast,
      fetchNotifications
    }}>
      {children}

      {/* Floating Toast Area */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="custom-toast glass-panel">
            <div className="toast-header">
              <span className="toast-icon">📌</span>
              <span className="toast-title">Thông báo mới</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
            </div>
            <div className="toast-body">{toast.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
