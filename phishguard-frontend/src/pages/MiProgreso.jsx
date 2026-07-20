// ============================================================
// PhishGuard UTB - Pagina: Mi Progreso
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const colores = ['#E74C3C', '#9B59B6', '#3498DB', '#F39C12'];

const MiProgreso = () => {
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try { const res = await api.get('/progreso'); setProgreso(res.data.data); }
      catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '12px' }}>Mi <span className="text-gradient">Progreso</span></h1>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '1rem' }}>Seguimiento de tu avance en PhishGuard UTB</p>
        </motion.div>

        <div className="stats-grid">
          {[
            { icon: <FiTrendingUp />, label: 'Progreso General', valor: `${progreso?.progreso_general || 0}%`, color: '#1B3A6B' },
            { icon: <FiCheckCircle />, label: 'Modulos Completados', valor: `${progreso?.modulos_completados || 0}/${progreso?.total_modulos || 4}`, color: '#27AE60' },
            { icon: <FiBarChart2 />, label: 'Puntaje Promedio', valor: `${progreso?.puntaje_promedio || 0}%`, color: '#2E6DA4' },
            { icon: <FiAward />, label: 'Quizzes Aprobados', valor: progreso?.quizzes_aprobados || 0, color: '#F39C12' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${stat.color}15`, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.2rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.valor}</div>
              <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="card" style={{ padding: '28px', marginBottom: '36px' }}>
          <h3 style={{ marginBottom: '16px' }}>Progreso General</h3>
          <div className="progress-bar-container" style={{ height: '20px', borderRadius: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${progreso?.progreso_general || 0}%`, borderRadius: '10px', fontSize: '0.75rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, minWidth: progreso?.progreso_general > 5 ? 'auto' : '0' }}>
              {progreso?.progreso_general > 10 && `${progreso.progreso_general}%`}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Detalle por Modulo</h2>
        <div className="modules-grid">
          {progreso?.detalle?.map((mod, i) => (
            <motion.div key={mod.modulo_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="card" style={{ padding: '24px', borderTop: `4px solid ${colores[i]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radio-md)', background: `${colores[i]}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DynamicIcon name={mod.icono} size={22} color={colores[i]} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{mod.titulo}</h3>
                  <span className={`badge ${mod.completado ? 'badge-success' : mod.porcentaje_avance > 0 ? 'badge-warning' : 'badge-info'}`}>
                    {mod.completado ? 'Completado' : mod.porcentaje_avance > 0 ? 'En progreso' : 'Pendiente'}
                  </span>
                </div>
              </div>
              <div className="progress-bar-container" style={{ marginBottom: '12px' }}>
                <div className="progress-bar-fill" style={{ width: `${mod.porcentaje_avance}%`, background: colores[i] }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>
                <span>{mod.porcentaje_avance}% completado</span>
                {mod.mejor_puntaje !== null && <span>Mejor quiz: {mod.mejor_puntaje}%</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Link to={`/modulos/${mod.modulo_id}`} className="btn btn-sm btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                  {mod.completado ? 'Revisar' : 'Continuar'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiProgreso;
