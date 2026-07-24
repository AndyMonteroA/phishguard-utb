// ============================================================
// PhishGuard UTB - Pagina: Recuperar Contraseña
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FiMail, FiShield, FiSend, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setCargando(true);
    try {
      const res = await api.post('/auth/recuperar-password', { email });
      toast.success(res.data.message || 'Revisa tu correo electrónico');
      setEnviado(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar el correo');
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
          {/* Adorno visual superior */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, var(--azul-institucional) 0%, var(--azul-claro) 100%)'
          }} />

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="auth-icon-wrap">
              <FiShield size={32} color="var(--azul-institucional)" />
            </div>
            <h2 style={{ marginBottom: '8px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--texto-principal)', letterSpacing: '-0.5px' }}>
              {enviado ? 'Correo enviado' : 'Recuperar Contraseña'}
            </h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {enviado 
                ? 'Revisa tu bandeja de entrada (y la carpeta de spam). El enlace expira en 1 hora.'
                : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.'
              }
            </p>
          </div>

          {!enviado ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiMail size={14} /> Correo Electrónico
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="tu.correo@utb.edu.ec"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  style={{
                    borderRadius: '12px',
                    padding: '12px 16px',
                    border: '1.5px solid #cbd5e1',
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
                }}
              >
                {cargando ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: '#ffffff', borderTopColor: 'transparent' }} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FiSend size={18} />
                    Enviar enlace de recuperación
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(39, 174, 96, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiCheckCircle size={40} color="#27AE60" />
              </div>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <button
                onClick={() => { setEnviado(false); setEmail(''); }}
                className="btn btn-secondary"
                style={{
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Enviar a otro correo
              </button>
            </motion.div>
          )}

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FiArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RecuperarPassword;
