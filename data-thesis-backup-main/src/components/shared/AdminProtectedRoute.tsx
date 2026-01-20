import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'student-assistant') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
