import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import LandingPage from './pages/LandingPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import MainLayout from './layouts/MainLayout';
import { authService } from './services/authService';
import { NotificationProvider } from './context/NotificationContext';

// A simple PrivateRoute to guard protected pages
const PrivateRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!user) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const user = authService.getCurrentUser();

  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          
          {/* Google OAuth Callback - must be public */}
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          
          {/* PROTECTED ROUTES */}
          <Route 
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="settings" element={<div className="glass-panel" style={{padding:'2rem'}}><h2>System Settings</h2><p>Trang này đang được phát triển...</p></div>} />
          </Route>
          
          {/* CATCH ALL (404) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
