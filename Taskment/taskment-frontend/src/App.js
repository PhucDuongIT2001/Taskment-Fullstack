import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Auth from './Auth';
import useAuth from './useAuth';
import Profile from './Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import LeaderDashboard from './pages/LeaderDashboard';
import MemberDashboard from './pages/MemberDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';
import NotificationBell from './components/NotificationBell';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // THÊM MỚI
import ResetPasswordPage from './pages/ResetPasswordPage'; // THÊM MỚI
import LandingPage from './pages/LandingPage';
import ChatWidget from './components/ChatWidget'; // Chat AI Widget
import { Home, User, Shield, LogOut, Menu } from 'lucide-react';
import { Button } from './components/ui/Button';

function App() {
  const { isAuthenticated, currentUser, login, verify2FA, register, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Preparing Taskment workspace...</p>
        </div>
      </div>
    );
  }

  const getDashboardPath = (user) => {
    const roles = user?.roles?.map(r => r.role) || [];
    if (roles.includes('ROLE_ADMIN')) return "/admin";
    if (roles.includes('ROLE_STAFF_LEADER')) return "/leader";
    if (roles.includes('ROLE_STAFF_MEMBER')) return "/member";
    return "/customer";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth login={login} verify2FA={verify2FA} register={register} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={getDashboardPath(currentUser)} className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                Taskment
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:ml-8 md:flex md:space-x-1">
                <Link to={getDashboardPath(currentUser)} className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                  <Home className="h-4 w-4 mr-2" /> Home
                </Link>
                <Link to={`/profile/${currentUser?.id}`} className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
                {currentUser?.roles?.some(r => r.role === 'ROLE_ADMIN') && (
                  <Link to="/admin" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors">
                    <Shield className="h-4 w-4 mr-2" /> Admin
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <NotificationBell />
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Hi, {currentUser?.fullName}
                </span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <NotificationBell />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <div className="flex items-center mb-4 mt-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200">
                  {currentUser?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{currentUser?.fullName}</div>
                  <div className="text-sm font-medium text-gray-500">{currentUser?.email}</div>
                </div>
              </div>
              <Link to={getDashboardPath(currentUser)} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Home
              </Link>
              <Link to={`/profile/${currentUser?.id}`} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Profile
              </Link>
              {currentUser?.roles?.some(r => r.role === 'ROLE_ADMIN') && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Admin
                </Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50">
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to={getDashboardPath(currentUser)} replace />} />

          <Route path="/admin" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading} allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/leader" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading} allowedRoles={['ROLE_STAFF_LEADER', 'ROLE_ADMIN']}>
              <LeaderDashboard currentUser={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/member" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading} allowedRoles={['ROLE_STAFF_MEMBER', 'ROLE_ADMIN']}>
              <MemberDashboard currentUser={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/customer" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading} allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
              <CustomerDashboard currentUser={currentUser} />
            </ProtectedRoute>
          } />

          <Route path="/profile/:userId" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/project/:projectId" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading} allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF_LEADER']}>
              <ProjectDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/task/:taskId" element={
            <ProtectedRoute user={currentUser} isAuthenticated={isAuthenticated} loading={loading}>
              <TaskDetailPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to={getDashboardPath(currentUser)} replace />} />
        </Routes>
      </main>
      <ChatWidget />
    </div>
  );
}

export default App;
