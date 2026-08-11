// ============================================================
// PhishGuard UTB - Componente: ProtectedRoute
// ============================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiereAdmin = false }) => {
  const { estaAutenticado, esAdmin, cargando, usuario } = useAuth();
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

  // Hacer obligatoria la prueba diagnóstica para estudiantes
  if (!requiereAdmin && !esAdmin && usuario && usuario.encuesta_completada === false && location.pathname !== '/encuesta') {
    return <Navigate to="/encuesta" replace />;
  }

  return children;
};

export default ProtectedRoute;
