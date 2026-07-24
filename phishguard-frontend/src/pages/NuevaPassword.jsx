// ============================================================
// PhishGuard UTB - Pagina: Nueva Contraseña (desde link de email)
// ============================================================

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FiLock, FiShield, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const NuevaPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [form, setForm] = useState({ password: '', confirmar: '' });
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  // Si no hay token o email, mostrar error
  if (!token || !email) {
    return (
      <div className="auth-page-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '460px', padding: '0 20px' }}
        >
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '6px',
              background: 'linear-gradient(90deg, #E74C3C 0%, #C0392B 100%)'
            }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(231, 76, 60, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <FiAlertTriangle size={40} color="#E74C3C" />
            </div>
            <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--texto-principal)' }}>
              Enlace inválido
            </h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.6 }}>
              Este enlace de recuperación no es válido o está incompleto.
              Por favor, solicita uno nuevo desde la página de inicio de sesión.
            </p>
            <Link to="/recuperar-password" className="btn btn-primary" style={{
              borderRadius: '10px', padding: '12px 24px', fontWeight: 600, fontSize: '0.95rem',
              display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
            }}>
              Solicitar nuevo enlace
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      const res = await api.post('/auth/restablecer-password', {
        token,
        email,
        nuevaPassword: form.password,
      });
      toast.success(res.data.message || '¡Contraseña restablecida!');
      setExito(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al restablecer la contraseña';
      setError(msg);
      toast.error(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '460px', padding: '0 20px' }}
      >
        <div className="auth-card">
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '6px',
            background: exito
              ? 'linear-gradient(90deg, #27AE60 0%, #2ECC71 100%)'
              : 'linear-gradient(90deg, var(--azul-institucional) 0%, var(--azul-claro) 100%)'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="auth-icon-wrap">
              {exito
                ? <FiCheckCircle size={32} color="#27AE60" />
                : <FiShield size={32} color="var(--azul-institucional)" />
              }
            </div>
            <h2 style={{ marginBottom: '8px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--texto-principal)', letterSpacing: '-0.5px' }}>
              {exito ? '¡Contraseña actualizada!' : 'Nueva Contraseña'}
            </h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {exito
                ? 'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión en unos segundos...'
                : `Ingresa tu nueva contraseña para la cuenta ${decodeURIComponent(email)}`
              }
            </p>
          </div>

          {!exito && (
            <>
              {error && (
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
                    marginBottom: '20px',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiLock size={14} /> Nueva contraseña
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                    autoFocus
                    style={{
                      borderRadius: '12px',
                      padding: '12px 16px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '28px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiLock size={14} /> Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repite tu nueva contraseña"
                    value={form.confirmar}
                    onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                    required
                    minLength={6}
                    style={{
                      borderRadius: '12px',
                      padding: '12px 16px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.95rem',
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
                  }}
                >
                  {cargando ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: '#ffffff', borderTopColor: 'transparent' }} />
                      Restableciendo...
                    </>
                  ) : (
                    <>
                      <FiLock size={18} />
                      Restablecer contraseña
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {exito && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: 'center', marginTop: '16px' }}
            >
              <Link to="/login" className="btn btn-primary" style={{
                borderRadius: '10px', padding: '12px 28px', fontWeight: 600,
                fontSize: '0.95rem', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
                Ir al inicio de sesión
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NuevaPassword;
