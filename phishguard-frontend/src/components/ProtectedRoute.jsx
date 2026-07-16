// ============================================================
// PhishGuard UTB - Componente: ProtectedRoute
// ============================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiereAdmin = false }) => {
  const { estaAutenticado, esAdmin, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiereAdmin && !esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
