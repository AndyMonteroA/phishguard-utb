// ============================================================
// PhishGuard UTB - Enrutamiento Principal
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Paginas publicas
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';

// Paginas de estudiante
import Dashboard from './pages/Dashboard';
import Encuesta from './pages/Encuesta';
import ModulosList from './pages/ModulosList';
import ModuloDetalle from './pages/ModuloDetalle';
import Quiz from './pages/Quiz';
import MiProgreso from './pages/MiProgreso';
import Certificado from './pages/Certificado';
import Logros from './pages/Logros';
import MiPerfil from './pages/MiPerfil';

// Paginas de admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEstudiantes from './pages/admin/AdminEstudiantes';
import AdminEstadisticas from './pages/admin/AdminEstadisticas';
import AdminModulos from './pages/admin/AdminModulos';
import AdminContenidos from './pages/admin/AdminContenidos';
import AdminPreguntas from './pages/admin/AdminPreguntas';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AppContent = () => {
  const { cargando } = useAuth();

  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--texto-terciario)' }}>Cargando PhishGuard UTB...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Rutas publicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas de estudiante */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/encuesta" element={<ProtectedRoute><Encuesta /></ProtectedRoute>} />
        <Route path="/modulos" element={<ProtectedRoute><ModulosList /></ProtectedRoute>} />
        <Route path="/modulos/:id" element={<ProtectedRoute><ModuloDetalle /></ProtectedRoute>} />
        <Route path="/quiz/:moduloId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/mi-progreso" element={<ProtectedRoute><MiProgreso /></ProtectedRoute>} />
        <Route path="/certificado" element={<ProtectedRoute><Certificado /></ProtectedRoute>} />
        <Route path="/logros" element={<ProtectedRoute><Logros /></ProtectedRoute>} />
        <Route path="/mi-perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />

        {/* Rutas de admin */}
        <Route path="/admin" element={<ProtectedRoute requiereAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/modulos" element={<ProtectedRoute requiereAdmin><AdminModulos /></ProtectedRoute>} />
        <Route path="/admin/contenidos/:moduloId" element={<ProtectedRoute requiereAdmin><AdminContenidos /></ProtectedRoute>} />
        <Route path="/admin/preguntas/:moduloId" element={<ProtectedRoute requiereAdmin><AdminPreguntas /></ProtectedRoute>} />
        <Route path="/admin/estudiantes" element={<ProtectedRoute requiereAdmin><AdminEstudiantes /></ProtectedRoute>} />
        <Route path="/admin/estadisticas" element={<ProtectedRoute requiereAdmin><AdminEstadisticas /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h1 style={{ fontSize: '4rem', color: 'var(--azul-institucional)' }}>404</h1>
              <p style={{ color: 'var(--texto-terciario)', marginBottom: '24px' }}>Pagina no encontrada</p>
              <a href="/" className="btn btn-primary">Volver al inicio</a>
            </div>
          </div>
        } />
      </Routes>
      <Footer />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '0.9rem' },
      }} />
    </>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
