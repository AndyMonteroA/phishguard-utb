// ============================================================
// PhishGuard UTB - Pagina: Registro
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FiUser, FiMail, FiLock, FiUserPlus, FiShield } from 'react-icons/fi';

const Registro = () => {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmarPassword: '',
    semestre: '', genero: '', usa_correo_institucional: false,
  });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrores({ ...errores, [name]: '' });
  };

  const validar = () => {
    const err = {};
    if (!form.nombre.trim()) err.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) err.apellido = 'El apellido es obligatorio';
    if (!form.email.trim()) err.email = 'El correo es obligatorio';
    if (form.password.length < 6) err.password = 'Minimo 6 caracteres';
    if (form.password !== form.confirmarPassword) err.confirmarPassword = 'Las contrasenas no coinciden';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setCargando(true);
    try {
      await registro({
        nombre: form.nombre, apellido: form.apellido, email: form.email, password: form.password,
        semestre: form.semestre ? parseInt(form.semestre) : null,
        genero: form.genero || null, usa_correo_institucional: form.usa_correo_institucional,
      });
      toast.success('Registro exitoso! Bienvenido a PhishGuard UTB');
      navigate('/encuesta');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
    } finally { setCargando(false); }
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
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '90px', paddingBottom: '40px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '500px', padding: '0 20px' }}>
        <div className="card" style={{ padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'var(--azul-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
            }}>
              <FiShield size={24} color="var(--azul-institucional)" />
            </div>
            <h2 style={{ marginBottom: '6px', fontSize: '1.5rem' }}>Crear Cuenta</h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.88rem' }}>Registrate en PhishGuard UTB</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Error con Google')}
              text="signup_with" shape="rectangular" size="large" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--gris-medio)' }}></div>
            <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>o registrate con email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--gris-medio)' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Nombre</label>
                <input type="text" name="nombre" className={`form-input ${errores.nombre ? 'error' : ''}`}
                  placeholder="Tu nombre" value={form.nombre} onChange={handleChange} />
                {errores.nombre && <span className="form-error">{errores.nombre}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Apellido</label>
                <input type="text" name="apellido" className={`form-input ${errores.apellido ? 'error' : ''}`}
                  placeholder="Tu apellido" value={form.apellido} onChange={handleChange} />
                {errores.apellido && <span className="form-error">{errores.apellido}</span>}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label"><FiMail size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Correo Electronico</label>
              <input type="email" name="email" className={`form-input ${errores.email ? 'error' : ''}`}
                placeholder="tu@email.com" value={form.email} onChange={handleChange} />
              {errores.email && <span className="form-error">{errores.email}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Semestre</label>
                <select name="semestre" className="form-select" value={form.semestre} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s} Semestre</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Genero</label>
                <select name="genero" className="form-select" value={form.genero} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="prefiero_no_indicar">Prefiero no indicar</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label"><FiLock size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Contrasena</label>
                <input type="password" name="password" className={`form-input ${errores.password ? 'error' : ''}`}
                  placeholder="Minimo 6 caracteres" value={form.password} onChange={handleChange} />
                {errores.password && <span className="form-error">{errores.password}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Confirmar</label>
                <input type="password" name="confirmarPassword" className={`form-input ${errores.confirmarPassword ? 'error' : ''}`}
                  placeholder="Repetir contrasena" value={form.confirmarPassword} onChange={handleChange} />
                {errores.confirmarPassword && <span className="form-error">{errores.confirmarPassword}</span>}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '20px' }}>
              <input type="checkbox" name="usa_correo_institucional" checked={form.usa_correo_institucional} onChange={handleChange} />
              Utilizas correo electronico institucional UTB?
            </label>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={cargando}>
              {cargando ? (
                <><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> Registrando...</>
              ) : (
                <><FiUserPlus size={18} /> Crear Cuenta</>
              )}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--texto-terciario)', fontSize: '0.88rem' }}>
            Ya tienes cuenta? <Link to="/login" style={{ fontWeight: 600 }}>Inicia sesion</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Registro;
