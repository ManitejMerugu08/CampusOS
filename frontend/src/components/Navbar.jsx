import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './ui/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ userName, role }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roleColors = {
        student: '#6366F1',
        faculty: '#10B981',
        admin: '#F59E0B',
    };

    const roleColor = roleColors[role] || '#6366F1';

    return (
        <header className="navbar">
            <div className="navbar-search">
                <Search className="search-icon" size={20} />
                <input type="text" placeholder="Search across CampusOS..." className="search-input" />
            </div>

            <div className="navbar-actions">
                {/* Single global notification bell */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="profile-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        className="profile-trigger"
                        onClick={() => setProfileOpen(!profileOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px 10px', borderRadius: 12
                        }}
                    >
                        <div className="profile-info">
                            <span className="profile-name">{userName || 'User'}</span>
                            <span className="profile-role" style={{ textTransform: 'capitalize' }}>{role || 'Role'}</span>
                        </div>
                        <div className="profile-avatar" style={{
                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`,
                        }}>
                            <User size={18} color="white" />
                        </div>
                        <ChevronDown size={14} style={{
                            color: 'var(--text-muted)',
                            transition: 'transform 0.2s',
                            transform: profileOpen ? 'rotate(180deg)' : 'none'
                        }} />
                    </button>

                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="profile-card"
                            >
                                {/* Profile Info Section */}
                                <div className="profile-card-header">
                                    <div className="profile-card-avatar" style={{
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`,
                                    }}>
                                        <User size={24} color="white" />
                                    </div>
                                    <div>
                                        <p className="profile-card-name" style={{ marginBottom: 0 }}>{userName || 'User'}</p>
                                        <p className="profile-card-role" style={{ marginTop: 2 }}>{role}</p>
                                    </div>
                                </div>

                                <div className="profile-card-divider" />

                                {/* Actions */}
                                <button className="profile-card-item" onClick={() => { setProfileOpen(false); }}>
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </button>

                                <div className="profile-card-divider" />

                                <button className="profile-card-item profile-card-logout" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
