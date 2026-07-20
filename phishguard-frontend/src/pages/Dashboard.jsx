// ============================================================
// PhishGuard UTB - Pagina: Dashboard del Estudiante
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FiBookOpen, FiAward, FiTrendingUp, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const Dashboard = () => {
  const { usuario, actualizarUsuario } = useAuth();
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados para el modal de completado de registro de Google
  const [mostrarModalCompletar, setMostrarModalCompletar] = useState(false);
  const [formCompletar, setFormCompletar] = useState({ semestre: '', genero: '', usa_correo_institucional: false });
  const [cargandoCompletar, setCargandoCompletar] = useState(false);

  useEffect(() => {
    // Si no tiene semestre configurado, mostramos el modal para completarlo obligatoriamente
    if (usuario && usuario.semestre === null) {
      setMostrarModalCompletar(true);
    }

    const cargar = async () => {
      try { const res = await api.get('/progreso'); setProgreso(res.data.data); }
      catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, [usuario]);

  const handleCompletarSubmit = async (e) => {
    e.preventDefault();
    if (!formCompletar.semestre || !formCompletar.genero) {
      toast.error('Por favor, selecciona tu semestre y genero');
      return;
    }
    setCargandoCompletar(true);
    try {
      const res = await api.put('/auth/perfil', {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        semestre: parseInt(formCompletar.semestre),
        genero: formCompletar.genero,
        usa_correo_institucional: formCompletar.usa_correo_institucional
      });
      actualizarUsuario(res.data.data.usuario);
      setMostrarModalCompletar(false);
      window.location.reload();
    } catch (err) {
      toast.error('Error al guardar datos del perfil');
    } finally {
      setCargandoCompletar(false);
    }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div><p>Cargando tu dashboard...</p></div></div>;

  const coloresModulo = ['#E74C3C', '#9B59B6', '#3498DB', '#F39C12'];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Modal de Completar Registro (Obligatorio) */}
        {mostrarModalCompletar && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(27, 58, 107, 0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
            padding: '20px'
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="card" style={{ padding: '32px', maxWidth: '440px', width: '100%', textAlign: 'center', borderTop: '4px solid var(--azul-institucional)' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--azul-institucional)' }}>¡Completa tu Registro!</h2>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem', marginBottom: '24px' }}>
                Antes de iniciar tus modulos de concientizacion, necesitamos algunos detalles de tu perfil estudiantil.
              </p>
              <form onSubmit={handleCompletarSubmit} style={{ textAlign: 'left' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Semestre</label>
                  <select className="form-select" value={formCompletar.semestre}
                    onChange={(e) => setFormCompletar({...formCompletar, semestre: e.target.value})} required>
                    <option value="">Selecciona tu semestre...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>{s}° Semestre</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Genero</label>
                  <select className="form-select" value={formCompletar.genero}
                    onChange={(e) => setFormCompletar({...formCompletar, genero: e.target.value})} required>
                    <option value="">Selecciona tu genero...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="prefiero_no_indicar">Prefiero no indicar</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--texto-secundario)', marginBottom: '24px' }}>
                  <input type="checkbox" checked={formCompletar.usa_correo_institucional}
                    onChange={(e) => setFormCompletar({...formCompletar, usa_correo_institucional: e.target.checked})} />
                  ¿Utilizas correo electronico institucional UTB?
                </label>
                <button type="submit" className="btn btn-primary btn-full" disabled={cargandoCompletar}>
                  {cargandoCompletar ? 'Guardando...' : 'Comenzar Aprendizaje'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            Hola, <span className="text-gradient">{usuario?.nombre}</span>!
          </h1>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '1rem' }}>
            Continua tu aprendizaje sobre Ingenieria Social en PhishGuard UTB
          </p>
        </motion.div>

        <div className="stats-grid">
          {[
            { icon: <FiTrendingUp />, titulo: 'Progreso General', valor: `${progreso?.progreso_general || 0}%`, color: '#1B3A6B' },
            { icon: <FiBookOpen />, titulo: 'Modulos Completados', valor: `${progreso?.modulos_completados || 0}/${progreso?.total_modulos || 4}`, color: '#27AE60' },
            { icon: <FiCheckCircle />, titulo: 'Quizzes Realizados', valor: progreso?.total_quizzes || 0, color: '#2E6DA4' },
            { icon: <FiAward />, titulo: 'Puntaje Promedio', valor: `${progreso?.puntaje_promedio || 0}%`, color: '#F39C12' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radio-md)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{stat.icon}</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)' }}>{stat.titulo}</span>
              </div>
              <div className="stat-card-valor" style={{ color: stat.color }}>{stat.valor}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card" style={{ padding: '28px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Tu Progreso General</h3>
            <span style={{ fontWeight: 700, color: 'var(--azul-institucional)', fontSize: '1.2rem' }}>{progreso?.progreso_general || 0}%</span>
          </div>
          <div className="progress-bar-container" style={{ height: '14px' }}>
            <div className="progress-bar-fill" style={{ width: `${progreso?.progreso_general || 0}%` }}></div>
          </div>
          {progreso?.progreso_general === 100 && (
            <Link to="/certificado" className="btn btn-success" style={{ marginTop: '16px' }}>
              <FiAward /> Obten tu Certificado
            </Link>
          )}
        </motion.div>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Modulos de Aprendizaje</h2>
        <div className="modules-grid">
          {progreso?.detalle?.map((mod, i) => (
            <motion.div key={mod.modulo_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
              <Link to={`/modulos/${mod.modulo_id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '24px', borderLeft: `5px solid ${coloresModulo[i] || '#1B3A6B'}`, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radio-md)', background: `${coloresModulo[i]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DynamicIcon name={mod.icono} size={20} color={coloresModulo[i]} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--texto-principal)' }}>{mod.titulo}</h3>
                        <span className={`badge ${mod.completado ? 'badge-success' : mod.porcentaje_avance > 0 ? 'badge-warning' : 'badge-info'}`}>
                          {mod.completado ? 'Completado' : mod.porcentaje_avance > 0 ? 'En progreso' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <FiArrowRight style={{ color: 'var(--texto-terciario)' }} />
                  </div>
                  <div className="progress-bar-container" style={{ height: '8px', marginBottom: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${mod.porcentaje_avance}%`, background: coloresModulo[i] || 'var(--gradiente-azul)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--texto-terciario)', marginBottom: (!mod.completado && mod.intentos_quiz > 0) ? '8px' : '0' }}>
                    <span>{mod.porcentaje_avance}% completado</span>
                    {mod.mejor_puntaje !== null && <span>Quiz: {mod.mejor_puntaje}%</span>}
                  </div>
                  {/* Alerta de Quiz No Aprobado */}
                  {!mod.completado && mod.intentos_quiz > 0 && (
                    <div style={{ 
                      marginTop: '8px', padding: '6px 10px', background: 'rgba(231,76,60,0.08)', 
                      borderRadius: '6px', border: '1px solid rgba(231,76,60,0.15)',
                      fontSize: '0.75rem', color: '#E74C3C', fontWeight: 500
                    }}>
                      ⚠️ Quiz reprobado (Mejor nota: {mod.mejor_puntaje || 0}%). Requiere 70% para aprobar.
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
