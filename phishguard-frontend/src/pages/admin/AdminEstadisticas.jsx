// ============================================================
// PhishGuard UTB - Admin: Estadisticas Avanzadas
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiAlertTriangle, FiUsers } from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminEstadisticas = () => {
  const [stats, setStats] = useState(null);
  const [errores, setErrores] = useState([]);
  const [evolucion, setEvolucion] = useState([]);
  const [mejora, setMejora] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [statsRes, erroresRes, evoRes, mejRes] = await Promise.all([
          api.get('/admin/estadisticas'),
          api.get('/admin/analitica/errores').catch(() => ({ data: { data: { errores: [] } } })),
          api.get('/admin/analitica/evolucion').catch(() => ({ data: { data: { evolucion: [] } } })),
          api.get('/admin/analitica/mejora').catch(() => ({ data: { data: { mejoras: [], resumen: {} } } })),
        ]);
        setStats(statsRes.data.data);
        setErrores(erroresRes.data.data.errores);
        setEvolucion(evoRes.data.data.evolucion);
        setMejora(mejRes.data.data);
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  const tabs = [
    { id: 'general', label: 'Vista General', icon: <FiBarChart2 /> },
    { id: 'errores', label: 'Errores Frecuentes', icon: <FiAlertTriangle /> },
    { id: 'evolucion', label: 'Evolucion', icon: <FiTrendingUp /> },
    { id: 'mejora', label: 'Antes vs Despues', icon: <FiUsers /> },
  ];

  // Grafico: Distribucion de niveles encuesta
  const nivelesData = {
    labels: stats?.niveles_encuesta?.map(n => (n.nivel || 'Sin nivel').charAt(0).toUpperCase() + (n.nivel || '').slice(1)) || [],
    datasets: [{
      data: stats?.niveles_encuesta?.map(n => parseInt(n.cantidad)) || [],
      backgroundColor: ['#E74C3C', '#F39C12', '#27AE60'],
      borderWidth: 0,
    }],
  };

  // Grafico: Progreso por modulo
  const modulosData = {
    labels: stats?.progreso_modulos?.map(m => m.titulo) || [],
    datasets: [{
      label: 'Completados',
      data: stats?.progreso_modulos?.map(m => m.completados) || [],
      backgroundColor: ['#E74C3C80', '#9B59B680', '#3498DB80', '#F39C1280'],
      borderColor: ['#E74C3C', '#9B59B6', '#3498DB', '#F39C12'],
      borderWidth: 2, borderRadius: 6,
    }],
  };

  // Grafico: Errores
  const erroresData = {
    labels: errores.slice(0, 10).map((e, i) => `P${i + 1}`),
    datasets: [{
      label: 'Tasa de Error (%)',
      data: errores.slice(0, 10).map(e => e.tasa_error),
      backgroundColor: errores.slice(0, 10).map(e => e.tasa_error > 60 ? '#E74C3C80' : e.tasa_error > 40 ? '#F39C1280' : '#27AE6080'),
      borderColor: errores.slice(0, 10).map(e => e.tasa_error > 60 ? '#E74C3C' : e.tasa_error > 40 ? '#F39C12' : '#27AE60'),
      borderWidth: 2, borderRadius: 6,
    }],
  };

  // Grafico: Evolucion
  const evolucionData = {
    labels: evolucion.map(e => e.fecha.slice(5)),
    datasets: [
      { label: 'Registros', data: evolucion.map(e => e.registros), borderColor: '#3498DB', backgroundColor: 'rgba(52,152,219,0.1)', fill: true, tension: 0.4, pointRadius: 3 },
      { label: 'Quizzes', data: evolucion.map(e => e.quizzes), borderColor: '#9B59B6', backgroundColor: 'rgba(155,89,182,0.1)', fill: true, tension: 0.4, pointRadius: 3 },
      { label: 'Aprobados', data: evolucion.map(e => e.aprobados), borderColor: '#27AE60', backgroundColor: 'rgba(39,174,96,0.1)', fill: true, tension: 0.4, pointRadius: 3 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}><FiBarChart2 size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Estadisticas Avanzadas</h1>
          <p style={{ color: 'var(--texto-terciario)' }}>Analisis detallado del rendimiento de la plataforma</p>
        </motion.div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`} style={{ gap: '6px' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Nivel de Conocimiento (Encuesta Diagnostica)</h3>
              <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={nivelesData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Estudiantes que completaron por Modulo</h3>
              <div style={{ height: '280px' }}>
                <Bar data={modulosData} options={chartOptions} />
              </div>
            </motion.div>
          </div>
        )}

        {tab === 'errores' && (
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Top 10 Preguntas con Mayor Tasa de Error</h3>
              <div style={{ height: '350px' }}>
                <Bar data={erroresData} options={{ ...chartOptions, indexAxis: 'y' }} />
              </div>
            </motion.div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Detalle de Errores</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Pregunta</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Errores</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Total</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Tasa Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errores.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '10px', maxWidth: '400px' }}>{e.pregunta_texto?.substring(0, 80)}...</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#E74C3C', fontWeight: 600 }}>{e.errores}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{e.total}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span className={`badge ${e.tasa_error > 60 ? 'badge-danger' : e.tasa_error > 40 ? 'badge-warning' : 'badge-success'}`}>
                            {e.tasa_error}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'evolucion' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Actividad en los ultimos 30 dias</h3>
            <div style={{ height: '400px' }}>
              {evolucion.length > 0 ? (
                <Line data={evolucionData} options={chartOptions} />
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--texto-terciario)', padding: '60px' }}>Aun no hay datos suficientes para mostrar la evolucion</p>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'mejora' && (
          <div>
            {mejora?.resumen && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {[
                  { label: 'Promedio Encuesta', valor: `${mejora.resumen.promedio_encuesta}%`, color: '#E74C3C' },
                  { label: 'Promedio Quiz', valor: `${mejora.resumen.promedio_quiz}%`, color: '#27AE60' },
                  { label: 'Mejora Promedio', valor: `+${mejora.resumen.mejora_promedio}%`, color: '#1B3A6B' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="card" style={{ padding: '28px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)' }}>{s.label}</span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color, marginTop: '8px' }}>{s.valor}</div>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Comparativa por Estudiante (Encuesta vs Quiz)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nivel Encuesta</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Puntaje Encuesta</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Mejor Quiz</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Mejora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mejora?.mejoras?.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                        <td style={{ padding: '10px', fontWeight: 500 }}>{m.estudiante}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span className={`badge ${m.nivel_encuesta === 'alto' ? 'badge-success' : m.nivel_encuesta === 'medio' ? 'badge-warning' : 'badge-danger'}`}>
                            {m.nivel_encuesta}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{m.puntaje_encuesta}%</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: '#27AE60' }}>{m.mejor_puntaje_quiz}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, color: m.mejora > 0 ? '#27AE60' : m.mejora < 0 ? '#E74C3C' : 'var(--texto-terciario)' }}>
                            {m.mejora > 0 ? '+' : ''}{m.mejora}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!mejora?.mejoras || mejora.mejoras.length === 0) && (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--texto-terciario)' }}>
                  Aun no hay estudiantes con encuesta y quiz completados para comparar
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEstadisticas;
