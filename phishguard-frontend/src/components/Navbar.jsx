// ============================================================
// PhishGuard UTB - Componente: Navbar
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import NotificacionDropdown from './NotificacionDropdown';

const Navbar = () => {
  const { estaAutenticado, esAdmin, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        <Link to={estaAutenticado ? '/dashboard' : '/'} className="navbar-brand">
          <FiShield size={24} className="brand-icon" />
          <span>PhishGuard <span style={{ fontWeight: 400, fontSize: '0.85em' }}>UTB</span></span>
        </Link>

        <div className={`navbar-links ${menuAbierto ? 'open' : ''}`}>
          {!estaAutenticado ? (
            <>
              <Link to="/" className={isActive('/')}>Inicio</Link>
              <Link to="/login" className={isActive('/login')}>Iniciar Sesion</Link>
              <Link to="/registro" className={isActive('/registro')}>Registrarse</Link>
            </>
          ) : esAdmin ? (
            <>
              <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
              <Link to="/admin/modulos" className={isActive('/admin/modulos')}>Modulos</Link>
              <Link to="/admin/estudiantes" className={isActive('/admin/estudiantes')}>Estudiantes</Link>
              <Link to="/admin/estadisticas" className={isActive('/admin/estadisticas')}>Estadisticas</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/modulos" className={isActive('/modulos')}>Modulos</Link>
              <Link to="/mi-progreso" className={isActive('/mi-progreso')}>Mi Progreso</Link>
              <Link to="/logros" className={isActive('/logros')}>Logros</Link>
              <Link to="/certificado" className={isActive('/certificado')}>Certificado</Link>
              <Link to="/mi-perfil" className={isActive('/mi-perfil')}>Mi Perfil</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {estaAutenticado && (
            <>
              <NotificacionDropdown />
              <span style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {esAdmin ? <FiShield size={14}/> : <FiUser size={14}/>}
                {usuario?.nombre}
              </span>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary" style={{ gap: '4px' }}>
                <FiLogOut size={14} />
                Salir
              </button>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
