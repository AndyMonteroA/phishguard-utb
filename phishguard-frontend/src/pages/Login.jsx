// ============================================================
// PhishGuard UTB - Pagina: Login
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
  const { login, registro: registroCtx } = useAuth();
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
      toast.success(res.message || 'Bienvenido!');
      const usuario = res.data.usuario;
      if (usuario.rol === 'admin') navigate('/admin');
      else if (!usuario.encuesta_completada) navigate('/encuesta');
      else navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al iniciar sesion';
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
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '80px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px', padding: '0 20px' }}>
        <div className="card" style={{ padding: '40px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <FiShield size={28} color="var(--azul-institucional)" />
            </div>
            <h2 style={{ marginBottom: '8px', fontSize: '1.6rem' }}>Iniciar Sesion</h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem' }}>Accede a PhishGuard UTB</p>
          </div>

          {errores.general && (
            <div style={{
              background: 'rgba(192, 57, 43, 0.08)', color: 'var(--rojo-alerta)',
              padding: '12px 16px', borderRadius: 'var(--radio-sm)',
              fontSize: '0.88rem', marginBottom: '20px', textAlign: 'center',
            }}>
              {errores.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><FiMail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Correo Electronico</label>
              <input type="email" name="email" className="form-input" placeholder="tu@email.com"
                value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label"><FiLock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Contrasena</label>
              <input type="password" name="password" className="form-input" placeholder="Tu contrasena"
                value={form.password} onChange={handleChange} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={cargando} style={{ marginTop: '8px' }}>
              {cargando ? (
                <><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> Iniciando...</>
              ) : (
                <><FiLogIn size={18} /> Iniciar Sesion</>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--gris-medio)' }}></div>
            <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>o</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--gris-medio)' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Error con Google')}
              text="signin_with"
              shape="rectangular"
              size="large"
              width="100%"
            />
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--texto-terciario)', fontSize: '0.9rem' }}>
            No tienes cuenta? <Link to="/registro" style={{ fontWeight: 600 }}>Registrate aqui</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
