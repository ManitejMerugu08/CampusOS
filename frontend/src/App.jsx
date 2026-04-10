import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AIChatWidget from './components/ui/AIChatWidget';

// Layouts & Auth
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Dashboard Pages
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Student Pages
import CanteenPage from './pages/student/CanteenPage';
import TicketsPage from './pages/student/TicketsPage';

// Faculty Pages
import StudentDirectory from './pages/faculty/StudentDirectory';
import FacultyTicketsPage from './pages/faculty/FacultyTicketsPage';

// Admin Pages
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminCanteenPage from './pages/admin/AdminCanteenPage';
import AdminTimetable from './pages/admin/AdminTimetable';

// Placeholder for unbuilt pages
const PlaceholderPage = ({ title }) => (
  <div className="card">
    <h2>{title}</h2>
    <p className="text-muted mt-2">This module is coming soon.</p>
  </div>
);

// Global chatbot — only shows when authenticated
const GlobalChatbot = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <AIChatWidget />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/tickets" element={<TicketsPage />} />
            <Route path="/student/canteen" element={<CanteenPage />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/tickets" element={<FacultyTicketsPage />} />
            <Route path="/faculty/directory" element={<StudentDirectory />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/canteen" element={<AdminCanteenPage />} />
            <Route path="/admin/timetable" element={<AdminTimetable />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
