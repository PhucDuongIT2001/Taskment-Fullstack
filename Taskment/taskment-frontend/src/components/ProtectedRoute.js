import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - Kiểm tra quyền truy cập dựa trên Role
 * @param children: Component con sẽ hiển thị nếu hợp lệ
 * @param allowedRoles: Mảng các Role được phép vào (Ví dụ: ['ROLE_ADMIN'])
 * @param user: Đối tượng User hiện tại từ useAuth
 * @param isAuthenticated: Trạng thái đăng nhập
 * @param loading: Đang kiểm tra Token
 */
const ProtectedRoute = ({ children, allowedRoles, user, isAuthenticated, loading }) => {
  if (loading) {
    return <div className="loading-spinner">Đang xác thực quyền truy cập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Nếu có yêu cầu Role cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user?.roles?.some(r => allowedRoles.includes(r.role));
    if (!hasRole) {
      // Nếu không đủ quyền, tự động đẩy về dashboard mặc định của họ
      const roles = user?.roles?.map(r => r.role) || [];
      if (roles.includes('ROLE_ADMIN')) return <Navigate to="/admin" replace />;
      if (roles.includes('ROLE_STAFF_LEADER')) return <Navigate to="/leader" replace />;
      if (roles.includes('ROLE_STAFF_MEMBER')) return <Navigate to="/member" replace />;
      return <Navigate to="/customer" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
