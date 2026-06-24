import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications from DB
  const fetchInitialNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchInitialNotifications();

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      
      // Register user when connected
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id) {
        newSocket.emit('user-online', user.id);
      }
    });

    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    newSocket.on('appointment-scheduled', handleNewNotification);
    newSocket.on('appointment-cancelled', handleNewNotification);
    newSocket.on('appointment-started', handleNewNotification);
    newSocket.on('prescription-issued', handleNewNotification);
    newSocket.on('status-update', handleNewNotification);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n._id === id || n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
       console.error("Failed to clear notifications", error);
    }
  }, []);

  const removeNotification = useCallback((id) => {
     // Optional: backend delete if we add a route for it.
     // For now, it just removes from UI
    setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
  }, []);

  return {
    notifications,
    unreadCount,
    removeNotification, // keeping this for NotificationCenter standard UI compatibility
    markAsRead,
    clearAll,
    socket
  };
}

export default useNotifications;
