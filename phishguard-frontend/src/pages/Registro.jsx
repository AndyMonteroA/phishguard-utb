// ============================================================
// PhishGuard UTB - Pagina: Registro (Premium Redesign)
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FiMail, FiLock, FiUser, FiUserPlus, FiShield } from 'react-icons/fi';

const Registro = () => {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    semestre: '',
    genero: '',
    password: '',
    confirmarPassword: '',
    usa_correo_institucional: false,
  });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrores({ ...errores, [name]: '' });
  };

  const validarForm = () => {
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio';
    if (!form.email.trim()) nuevosErrores.email = 'El correo es obligatorio';
    if (!form.semestre) nuevosErrores.semestre = 'El semestre es obligatorio';
    if (!form.genero) nuevosErrores.genero = 'El genero es obligatorio';
    if (form.password.length < 6) nuevosErrores.password = 'La contrasena debe tener al menos 6 caracteres';
    if (form.password !== form.confirmarPassword) nuevosErrores.confirmarPassword = 'Las contrasenas no coinciden';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarForm()) return;
    setCargando(true);
    try {
      await registro({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        semestre: parseInt(form.semestre),
        genero: form.genero,
        password: form.password,
        usa_correo_institucional: form.usa_correo_institucional,
      });
      toast.success('¡Registro exitoso! Bienvenido a PhishGuard UTB');
      navigate('/encuesta');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
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
      toast.success('Cuenta creada con Google');
      window.location.href = usuario.encuesta_completada ? '/dashboard' : '/encuesta';
    } catch (error) {
      toast.error('Error al registrar con Google');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(27, 58, 107, 0.05) 0%, rgba(46, 109, 164, 0.08) 90%)',
      paddingTop: '100px',
      paddingBottom: '40px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '520px', padding: '0 20px' }}
      >
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '40px 36px',
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

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(27, 58, 107, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: 'inset 0 2px 4px rgba(27, 58, 107, 0.05)'
            }}>
              <FiShield size={32} color="var(--azul-institucional)" />
            </div>
            <h2 style={{ marginBottom: '6px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--texto-principal)', letterSpacing: '-0.5px' }}>Crear Cuenta</h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.92rem' }}>Únete a la plataforma de concientización PhishGuard UTB</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => toast.error('Error con Google')}
                text="signup_with" 
                shape="rectangular" 
                size="large" 
                width="440px"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--texto-terciario)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>o regístrate con email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiUser size={13} /> Nombre</label>
                <input 
                  type="text" 
                  name="nombre" 
                  className={`form-input ${errores.nombre ? 'error' : ''}`}
                  placeholder="Tu nombre" 
                  value={form.nombre} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
                {errores.nombre && <span className="form-error">{errores.nombre}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiUser size={13} /> Apellido</label>
                <input 
                  type="text" 
                  name="apellido" 
                  className={`form-input ${errores.apellido ? 'error' : ''}`}
                  placeholder="Tu apellido" 
                  value={form.apellido} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
                {errores.apellido && <span className="form-error">{errores.apellido}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiMail size={13} /> Correo Electrónico</label>
              <input 
                type="email" 
                name="email" 
                className={`form-input ${errores.email ? 'error' : ''}`}
                placeholder="tu.correo@utb.edu.ec" 
                value={form.email} 
                onChange={handleChange} 
                required 
                style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
              />
              {errores.email && <span className="form-error">{errores.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px' }}>Semestre</label>
                <select 
                  name="semestre" 
                  className="form-select" 
                  value={form.semestre} 
                  onChange={handleChange} 
                  required
                  style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                >
                  <option value="">Seleccionar...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
                </select>
                {errores.semestre && <span className="form-error">{errores.semestre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px' }}>Género</label>
                <select 
                  name="genero" 
                  className="form-select" 
                  value={form.genero} 
                  onChange={handleChange} 
                  required
                  style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="prefiero_no_indicar">Prefiero no indicar</option>
                </select>
                {errores.genero && <span className="form-error">{errores.genero}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiLock size={13} /> Contraseña</label>
                <input 
                  type="password" 
                  name="password" 
                  className={`form-input ${errores.password ? 'error' : ''}`}
                  placeholder="Mín. 6 caracteres" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
                {errores.password && <span className="form-error">{errores.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--texto-secundario)', marginBottom: '8px' }}>Confirmar</label>
                <input 
                  type="password" 
                  name="confirmarPassword" 
                  className={`form-input ${errores.confirmarPassword ? 'error' : ''}`}
                  placeholder="Repetir contraseña" 
                  value={form.confirmarPassword} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: '12px', padding: '11px 14px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
                {errores.confirmarPassword && <span className="form-error">{errores.confirmarPassword}</span>}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '28px' }}>
              <input type="checkbox" name="usa_correo_institucional" checked={form.usa_correo_institucional} onChange={handleChange} />
              ¿Utilizas correo electrónico institucional UTB?
            </label>

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
                gap: '8px'
              }}
            >
              {cargando ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: '#ffffff', borderTopColor: 'transparent' }}></div> 
                  Creando cuenta...
                </>
              ) : (
                <>
                  <FiUserPlus size={18} /> 
                  Crear Cuenta Estudiantil
                </>
              )}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ fontWeight: 700, color: 'var(--azul-institucional)', textDecoration: 'none' }}>Inicia sesión aquí</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Registro;
