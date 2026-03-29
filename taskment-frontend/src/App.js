import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './layouts/MainLayout';
import { authService } from './services/authService';

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
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* PROTECTED ROUTES */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Index route redirects to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Placeholder routes for future development */}
          <Route path="tasks" element={<div className="glass-panel" style={{padding:'2rem'}}><h2>My Tasks</h2><p>Trang này đang được phát triển...</p></div>} />
          <Route path="projects" element={<div className="glass-panel" style={{padding:'2rem'}}><h2>Projects</h2><p>Trang này đang được phát triển...</p></div>} />
          <Route path="team" element={<div className="glass-panel" style={{padding:'2rem'}}><h2>Team Members</h2><p>Trang này đang được phát triển...</p></div>} />
          <Route path="settings" element={<div className="glass-panel" style={{padding:'2rem'}}><h2>System Settings</h2><p>Trang này đang được phát triển...</p></div>} />
        </Route>
        
        {/* CATCH ALL (404) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
