// ============================================================
// PhishGuard UTB - Pagina: Login (Premium Redesign)
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FiMail, FiLock, FiLogIn, FiShield } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrores({});
    try {
      const res = await login(form.email, form.password);
      toast.success(res.message || '¡Bienvenido de nuevo!');
      const usuario = res.data.usuario;
      if (usuario.rol === 'admin') navigate('/admin');
      else if (!usuario.encuesta_completada) navigate('/encuesta');
      else navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Credenciales incorrectas';
      toast.error(msg);
      setErrores({ general: msg });
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      const { usuario, token } = res.data.data;
      localStorage.setItem('phishguard_token', token);
      localStorage.setItem('phishguard_user', JSON.stringify(usuario));
      toast.success('Sesion iniciada con Google');
      window.location.href = usuario.encuesta_completada ? '/dashboard' : '/encuesta';
    } catch (error) {
      toast.error('Error al iniciar con Google');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(27, 58, 107, 0.05) 0%, rgba(46, 109, 164, 0.08) 90%)',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '460px', padding: '0 20px' }}
      >
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Adorno visual superior */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, var(--azul-institucional) 0%, var(--azul-claro) 100%)'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(27, 58, 107, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'inset 0 2px 4px rgba(27, 58, 107, 0.05)'
            }}>
              <FiShield size={32} color="var(--azul-institucional)" />
            </div>
            <h2 style={{ marginBottom: '8px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--texto-principal)', letterSpacing: '-0.5px' }}>Iniciar Sesión</h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.92rem' }}>Ingresa tus credenciales para acceder a PhishGuard UTB</p>
          </div>

          {errores.general && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(231, 76, 60, 0.06)',
                border: '1px solid rgba(231, 76, 60, 0.15)',
                color: '#C0392B',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                marginBottom: '24px',
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              {errores.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiMail size={14} /> Correo Electrónico
              </label>
              <input 
                type="email" 
                name="email" 
                className="form-input" 
                placeholder="tu.correo@utb.edu.ec"
                value={form.email} 
                onChange={handleChange} 
                required 
                autoComplete="email" 
                style={{
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiLock size={14} /> Contraseña
              </label>
              <input 
                type="password" 
                name="password" 
                className="form-input" 
                placeholder="Ingresa tu contraseña"
                value={form.password} 
                onChange={handleChange} 
                required 
                autoComplete="current-password" 
                style={{
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full btn-lg" 
              disabled={cargando} 
              style={{ 
                borderRadius: '12px',
                padding: '14px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(27, 58, 107, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {cargando ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: '#ffffff', borderTopColor: 'transparent' }}></div> 
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <FiLogIn size={18} /> 
                  Acceder a la Plataforma
                </>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--texto-terciario)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>o continúa con</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Error al conectar con Google')}
                text="signin_with"
                shape="rectangular"
                size="large"
                width="380px"
              />
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
            ¿Aún no tienes cuenta? <Link to="/registro" style={{ fontWeight: 700, color: 'var(--azul-institucional)', textDecoration: 'none' }}>Regístrate aquí</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
