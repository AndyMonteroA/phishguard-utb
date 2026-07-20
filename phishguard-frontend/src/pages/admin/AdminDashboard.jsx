// ============================================================
// PhishGuard UTB - Admin: Dashboard
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiUsers, FiBarChart2, FiCheckCircle, FiAward, FiBookOpen, FiDownload, FiArrowRight, FiTrendingUp, FiClipboard } from 'react-icons/fi';

const AdminDashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try { const res = await api.get('/admin/estadisticas'); setStats(res.data.data); }
      catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const exportar = async () => {
    try {
      const res = await api.get('/admin/exportar', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishguard_reporte_${Date.now()}.xlsx`;
      link.click();
    } catch (err) { console.error(err); }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  const tarjetas = [
    { icon: <FiUsers />, titulo: 'Estudiantes Registrados', valor: stats?.total_estudiantes || 0, color: '#1B3A6B', to: '/admin/estudiantes' },
    { icon: <FiCheckCircle />, titulo: 'Estudiantes Activos', valor: stats?.estudiantes_activos || 0, color: '#27AE60', to: '/admin/estudiantes' },
    { icon: <FiClipboard />, titulo: 'Encuestas Completadas', valor: stats?.encuestas_completadas || 0, color: '#2E6DA4', to: '/admin/estadisticas' },
    { icon: <FiAward />, titulo: 'Certificados Emitidos', valor: stats?.certificados_emitidos || 0, color: '#F39C12', to: '/admin/estadisticas' },
    { icon: <FiBarChart2 />, titulo: 'Total Quizzes', valor: stats?.total_quizzes || 0, color: '#9B59B6', to: '/admin/estadisticas' },
    { icon: <FiTrendingUp />, titulo: 'Tasa de Aprobacion', valor: `${stats?.total_quizzes > 0 ? Math.round((stats.quizzes_aprobados / stats.total_quizzes) * 100) : 0}%`, color: '#E74C3C', to: '/admin/estadisticas' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Panel de Administracion</h1>
            <p style={{ color: 'var(--texto-terciario)' }}>Bienvenido, {usuario?.nombre}. Vista general de PhishGuard UTB.</p>
          </div>
          <button onClick={exportar} className="btn btn-primary" style={{ gap: '6px' }}><FiDownload /> Exportar Excel</button>
        </motion.div>

        <div className="stats-grid">
          {tarjetas.map((t, i) => (
            <Link key={i} to={t.to} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="card"
                style={{ padding: '24px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radio-md)', background: `${t.color}15`, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{t.icon}</div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>{t.titulo}</span>
                </div>
                <div className="stat-card-valor" style={{ color: t.color }}>{t.valor}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--texto-terciario)', fontWeight: 500 }}>
                  <FiArrowRight size={12} /> Ver detalle
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {stats?.progreso_modulos && (
          <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Progreso por Modulo</h3>
            {stats.progreso_modulos.map((mod, i) => (
              <div key={mod.modulo_id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{mod.titulo}</span>
                  <span style={{ color: 'var(--texto-terciario)' }}>{mod.completados}/{mod.total_estudiantes} estudiantes</span>
                </div>
                <div className="progress-bar-container" style={{ height: '10px' }}>
                  <div className="progress-bar-fill" style={{ width: `${mod.total_estudiantes > 0 ? (mod.completados / mod.total_estudiantes) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ marginBottom: '16px' }}>Accesos Rapidos</h3>
        <div className="modules-grid">
          {[
            { to: '/admin/modulos', icon: <FiBookOpen />, label: 'Gestionar Modulos', color: '#2E6DA4' },
            { to: '/admin/estudiantes', icon: <FiUsers />, label: 'Gestionar Estudiantes', color: '#27AE60' },
            { to: '/admin/estadisticas', icon: <FiBarChart2 />, label: 'Estadisticas Avanzadas', color: '#9B59B6' },
          ].map((acc, i) => (
            <Link key={i} to={acc.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radio-md)', background: `${acc.color}15`, color: acc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{acc.icon}</div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--texto-principal)' }}>{acc.label}</span>
                </div>
                <FiArrowRight color="var(--texto-terciario)" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
