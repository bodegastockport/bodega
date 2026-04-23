import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#f3f2ee" }}>
    <div style={{
      width: "24px", height: "24px",
      border: "2px solid #d8d6d0",
      borderTopColor: "#193c47",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <Spinner />;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
