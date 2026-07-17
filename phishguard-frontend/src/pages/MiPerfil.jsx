// ============================================================
// PhishGuard UTB - Pagina: Mi Perfil
// ============================================================

import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiBookOpen, FiActivity, FiSave, FiLock } from 'react-icons/fi';

const MiPerfil = () => {
  const { usuario, actualizarUsuario } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    semestre: '',
    genero: '',
    usa_correo_institucional: false,
  });
  const [cargando, setCargando] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        semestre: usuario.semestre || '',
        genero: usuario.genero || '',
        usa_correo_institucional: usuario.usa_correo_institucional || false,
      });
    }

    const cargarStats = async () => {
      try {
        const res = await api.get('/progreso');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarStats();
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim()) {
      toast.error('Nombre y Apellido son obligatorios');
      return;
    }
    setCargando(true);
    try {
      const res = await api.put('/auth/perfil', {
        nombre: form.nombre,
        apellido: form.apellido,
        semestre: parseInt(form.semestre) || null,
        genero: form.genero || null,
        usa_correo_institucional: form.usa_correo_institucional,
      });
      
      const usuarioActualizado = res.data.data.usuario;
      actualizarUsuario(usuarioActualizado);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}>Mi Perfil</h1>
          <p style={{ color: 'var(--texto-terciario)' }}>Gestiona tu informacion personal y revisa tu avance en la carrera</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Tarjeta lateral: Estado del Estudiante */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--azul-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <FiUser size={36} color="var(--azul-institucional)" />
            </div>
            <h3 style={{ marginBottom: '4px' }}>{usuario?.nombre} {usuario?.apellido}</h3>
            <span className="badge badge-info" style={{ marginBottom: '24px' }}>Estudiante</span>

            <div style={{ textAlign: 'left', borderTop: '1px solid var(--gris-medio)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--texto-terciario)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiActivity /> Resumen Academico
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--texto-secundario)' }}>Semestre:</span>
                <span style={{ fontWeight: 700 }}>{usuario?.semestre ? `${usuario.semestre}° Semestre` : 'No configurado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--texto-secundario)' }}>Progreso:</span>
                <span style={{ fontWeight: 700, color: 'var(--azul-institucional)' }}>{stats?.progreso_general || 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--texto-secundario)' }}>Quizzes Aprobados:</span>
                <span style={{ fontWeight: 700, color: '#27AE60' }}>{stats?.modulos_completados || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Formulario principal de Edicion */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Editar Datos Personales</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input type="text" name="nombre" className="form-input" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input type="text" name="apellido" className="form-input" value={form.apellido} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">
                  <FiMail size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Correo Electronico
                </label>
                <input type="email" className="form-input" value={form.email} disabled style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)', marginTop: '4px', display: 'block' }}>El correo electronico no puede ser modificado</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Semestre</label>
                  <select name="semestre" className="form-select" value={form.semestre} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>{s}° Semestre</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Genero</label>
                  <select name="genero" className="form-select" value={form.genero} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="prefiero_no_indicar">Prefiero no indicar</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--texto-secundario)', marginBottom: '32px' }}>
                <input type="checkbox" name="usa_correo_institucional" checked={form.usa_correo_institucional} onChange={handleChange} />
                Utilizas correo electronico institucional UTB?
              </label>

              <button type="submit" className="btn btn-primary" disabled={cargando} style={{ gap: '8px' }}>
                <FiSave /> {cargando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
