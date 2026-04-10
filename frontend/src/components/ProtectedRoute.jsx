import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading-screen">Loading CampusOS...</div>; // Could be a nicer skeleton
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard if they try to access unauthorized area
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return <DashboardLayout role={user.role} userName={user.name} />;
};

export default ProtectedRoute;
