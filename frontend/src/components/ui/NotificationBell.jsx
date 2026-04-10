import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'SUCCESS': return 'text-success';
            case 'WARNING': return 'text-warning';
            case 'DANGER': return 'text-danger';
            default: return 'text-primary';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={`action-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="action-badge"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="notification-card"
                    >
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            <span className="notification-badge-new">{unreadCount} New</span>
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                    >
                                        <div className="notification-content">
                                            <p className={`notification-title ${getTypeColor(n.type)}`}>
                                                {n.title}
                                            </p>
                                            <p className="notification-message">{n.message}</p>
                                            <p className="notification-time">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => markAsRead(n.id, e)}
                                                className="notification-mark-read"
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="notification-footer">
                                <button className="notification-footer-btn">
                                    View All Activity
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
