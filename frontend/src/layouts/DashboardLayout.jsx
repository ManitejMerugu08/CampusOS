import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './DashboardLayout.css';

const DashboardLayout = ({ role, userName }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar role={role} />
            <div className="main-wrapper">
                <Navbar userName={userName} role={role} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
