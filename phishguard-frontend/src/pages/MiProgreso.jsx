// ============================================================
// PhishGuard UTB - Pagina: Mi Progreso (Mejorado)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiTrendingUp, FiClock, FiAward, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const colores = ['#E74C3C', '#9B59B6', '#3498DB', '#F39C12'];

const MiProgreso = () => {
  const [progreso, setProgreso] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [cargando, setCargando] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [progresoRes, historialRes] = await Promise.all([
          api.get('/progreso'),
          api.get('/progreso/historial'),
        ]);
        setProgreso(progresoRes.data.data);
        setHistorial(historialRes.data.data);
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const fmtTiempo = (s) => {
    if (!s) return '—';
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const fmtFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  const diff = historial?.diferencia || 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '12px' }}>Mi <span className="text-gradient">Progreso</span></h1>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '1rem' }}>Seguimiento completo de tu avance en PhishGuard UTB</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="stats-grid">
          {[
            { icon: <FiTrendingUp />, label: 'Progreso General', valor: `${progreso?.progreso_general || 0}%`, color: '#1B3A6B' },
            { icon: <FiCheckCircle />, label: 'Módulos Completados', valor: `${progreso?.modulos_completados || 0}/${progreso?.total_modulos || 4}`, color: '#27AE60' },
            { icon: <FiBarChart2 />, label: 'Mi Promedio', valor: `${historial?.promedio_estudiante || 0}%`, color: '#2E6DA4' },
            { icon: <FiAward />, label: 'Quizzes Aprobados', valor: historial?.quizzes_aprobados || 0, color: '#F39C12' },
            { icon: diff >= 0 ? <FiArrowUp /> : <FiArrowDown />, label: 'vs Promedio del Grupo', valor: `${diff >= 0 ? '+' : ''}${diff}%`, color: diff >= 0 ? '#27AE60' : '#E74C3C' },
            { icon: <FiClock />, label: 'Total Intentos', valor: historial?.total_intentos || 0, color: '#9B59B6' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${stat.color}15`, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.2rem' }}>{stat.icon}</div>
              <div className="stat-card-valor" style={{ color: stat.color }}>{stat.valor}</div>
              <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Progreso por módulo */}
        {progreso?.detalle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card" style={{ padding: '28px', marginBottom: '28px' }}>
            <h3 style={{ marginBottom: '20px' }}>📚 Progreso por Módulo</h3>
            {progreso.detalle.map((mod, i) => (
              <div key={mod.modulo_id} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{mod.icono || '📖'}</span>
                    {mod.titulo}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {mod.mejor_puntaje !== null && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)' }}>Mejor nota: {mod.mejor_puntaje}%</span>
                    )}
                    <span className={`badge ${mod.completado ? 'badge-success' : mod.porcentaje_avance > 0 ? 'badge-warning' : 'badge-default'}`}>
                      {mod.completado ? 'Completado' : mod.porcentaje_avance > 0 ? 'En progreso' : 'Sin iniciar'}
                    </span>
                  </div>
                </div>
                <div className="progress-bar-container" style={{ height: '10px' }}>
                  <div className="progress-bar-fill" style={{ width: `${mod.porcentaje_avance}%`, background: colores[i % colores.length] }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>{mod.porcentaje_avance}% completado • {mod.intentos_quiz} intento(s) de quiz</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Gráfico de evolución */}
        {historial?.historial?.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card" style={{ padding: '28px', marginBottom: '28px' }}>
            <h3 style={{ marginBottom: '20px' }}>📈 Evolución de tus Notas</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)', marginBottom: '16px' }}>
              Tu rendimiento en cada intento de quiz comparado con el promedio del grupo
            </p>
            <div style={{ height: '300px' }}>
              <Line
                ref={chartRef}
                data={{
                  labels: historial.historial.map((h, i) => `Intento ${i + 1}`),
                  datasets: [
                    {
                      label: 'Tu nota',
                      data: historial.historial.map(h => h.porcentaje),
                      borderColor: '#1B3A6B',
                      backgroundColor: 'rgba(27,58,107,0.1)',
                      borderWidth: 3,
                      pointRadius: 6,
                      pointBackgroundColor: historial.historial.map(h => h.aprobado ? '#27AE60' : '#E74C3C'),
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      tension: 0.3,
                      fill: true,
                    },
                    {
                      label: 'Promedio del grupo',
                      data: historial.historial.map(() => historial.promedio_grupo),
                      borderColor: '#F39C12',
                      borderWidth: 2,
                      borderDash: [8, 4],
                      pointRadius: 0,
                      tension: 0,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
                    tooltip: {
                      callbacks: {
                        afterLabel: (ctx) => {
                          if (ctx.datasetIndex === 0) {
                            const h = historial.historial[ctx.dataIndex];
                            return `${h.modulo} • ${h.aprobado ? '✅ Aprobado' : '❌ Reprobado'}`;
                          }
                          return '';
                        },
                      },
                    },
                  },
                  scales: {
                    y: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
                  },
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Historial detallado */}
        {historial?.historial?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="card" style={{ padding: '28px', marginBottom: '28px' }}>
            <h3 style={{ marginBottom: '20px' }}>📋 Historial de Evaluaciones</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Módulo</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Nota</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Resultado</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Tiempo</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Preguntas</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.historial.slice().reverse().map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                      <td style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--texto-terciario)' }}>{fmtFecha(h.fecha)}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{h.modulo}</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: h.aprobado ? '#27AE60' : '#E74C3C' }}>{h.porcentaje}%</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span className={`badge ${h.aprobado ? 'badge-success' : 'badge-danger'}`}>{h.aprobado ? 'Aprobado' : 'Reprobado'}</span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', color: 'var(--texto-terciario)' }}>{fmtTiempo(h.tiempo)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{h.puntaje}/{h.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
          <Link to="/modulos" className="btn btn-primary">📚 Continuar Aprendiendo</Link>
          <Link to="/logros" className="btn btn-secondary">🏆 Ver Logros</Link>
          <Link to="/certificado" className="btn btn-secondary">📜 Mi Certificado</Link>
        </div>
      </div>
    </div>
  );
};

export default MiProgreso;
