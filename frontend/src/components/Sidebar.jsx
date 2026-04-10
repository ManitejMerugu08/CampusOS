import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, Coffee, LogOut, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ role }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: `/${role}/dashboard` },
        { name: 'Tickets', icon: Ticket, path: `/${role}/tickets` },
        ...(role === 'admin' ? [{ name: 'Students', icon: Users, path: '/admin/students' }] : []),
        ...(role === 'admin' ? [{ name: 'Timetable', icon: Calendar, path: '/admin/timetable' }] : []),
        ...(role === 'student' ? [{ name: 'Canteen', icon: Coffee, path: '/student/canteen' }] : []),
        ...(role === 'admin' ? [{ name: 'Canteen', icon: Coffee, path: '/admin/canteen' }] : []),
        ...(role === 'faculty' ? [{ name: 'Directory', icon: Users, path: '/faculty/directory' }] : []),
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    {!isCollapsed && <span className="logo-text">Campus<span className="text-primary">OS</span></span>}
                    {isCollapsed && <span className="logo-text-short">C<span className="text-primary">O</span></span>}
                </div>
                <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon className="nav-icon" size={22} />
                                {!isCollapsed && <span className="nav-label">{item.name}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={handleLogout}>
                    <LogOut className="nav-icon" size={22} />
                    {!isCollapsed && <span className="nav-label">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
