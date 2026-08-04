// ============================================================
// PhishGuard UTB - Admin: Estadísticas Avanzadas (Rediseño v2)
// Learning Analytics & Business Intelligence Dashboard
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBarChart2, FiTrendingUp, FiAlertTriangle, FiUsers,
  FiTarget, FiLayers, FiDownload, FiFilter, FiRefreshCw,
  FiAward, FiClock, FiCheckCircle, FiXCircle, FiActivity,
  FiBookOpen, FiPercent, FiHash, FiArrowUp, FiArrowDown,
} from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, Radar, PolarArea } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
  RadialLinearScale,
);

// Colores del sistema de diseño
const COLORS = {
  primary: '#1B3A6B',
  secondary: '#2E6DA4',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  purple: '#9B59B6',
  teal: '#1ABC9C',
  orange: '#E67E22',
  pink: '#E91E63',
  indigo: '#3F51B5',
};
const CHART_COLORS = ['#1B3A6B', '#2E6DA4', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#E67E22'];
const CHART_BG = CHART_COLORS.map(c => c + '30');

// Helper: formatear tiempo en segundos
const fmtTime = (seg) => {
  if (!seg) return 'N/A';
  if (seg < 60) return `${seg}s`;
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}m ${s}s`;
};

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

/** Hook: contador animado */
const useAnimatedCount = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === undefined || target === null) return;
    const num = typeof target === 'string' ? parseFloat(target.replace(/[^0-9.-]/g, '')) : target;
    if (isNaN(num) || num === 0) { setCount(0); return; }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

/** Tarjeta KPI con contador animado */
const KPICard = ({ icon: Icon, label, value, sub, color = COLORS.primary, delay = 0 }) => {
  const isStr = typeof value === 'string';
  const numericVal = isStr ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const suffix = isStr ? value.replace(/[0-9.-]/g, '') : '';
  const animated = useAnimatedCount(numericVal);
  const displayVal = isNaN(numericVal) ? value : `${animated}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
      className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'default', transition: 'box-shadow 0.2s' }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: `1px solid ${color}20`,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1.2 }}>{displayVal}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--texto-terciario)', marginTop: 2 }}>{sub}</div>}
      </div>
    </motion.div>
  );
};

/** Barra de filtros */
const FilterBar = ({ filters, values, onChange }) => (
  <div style={{
    display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
    padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10,
    border: '1px solid var(--gris-medio)', marginBottom: '20px',
  }}>
    <FiFilter size={16} color="var(--texto-terciario)" />
    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--texto-secundario)' }}>Filtros:</span>
    {filters.map(f => (
      <select
        key={f.key}
        value={values[f.key] || 'todos'}
        onChange={e => onChange(f.key, e.target.value)}
        style={{
          padding: '6px 10px', borderRadius: 6, border: '1px solid var(--gris-medio)',
          fontSize: '0.82rem', background: 'var(--bg-base)', color: 'var(--texto-principal)',
          cursor: 'pointer',
        }}
      >
        {f.options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    ))}
  </div>
);

/** Botones de exportación */
const ExportBar = ({ onExportExcel, onExportCSV, onExportPNG, chartRef }) => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {onExportExcel && (
      <button className="btn btn-sm btn-secondary" onClick={onExportExcel} style={{ gap: 4, fontSize: '0.78rem' }}>
        <FiDownload size={14} /> Excel
      </button>
    )}
    {onExportCSV && (
      <button className="btn btn-sm btn-secondary" onClick={onExportCSV} style={{ gap: 4, fontSize: '0.78rem' }}>
        <FiDownload size={14} /> CSV
      </button>
    )}
    {onExportPNG && chartRef?.current && (
      <button className="btn btn-sm btn-secondary" onClick={() => {
        const url = chartRef.current.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = `grafico_phishguard_${Date.now()}.png`;
        a.click();
      }} style={{ gap: 4, fontSize: '0.78rem' }}>
        <FiDownload size={14} /> PNG
      </button>
    )}
  </div>
);

/** Header de sección con título y export */
const SectionHeader = ({ title, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 8 }}>
    <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{title}</h3>
    {children}
  </div>
);

/** Badge de nivel */
const NivelBadge = ({ nivel }) => {
  const map = {
    'Excelente': 'badge-success', 'Alto': 'badge-success', 'alto': 'badge-success',
    'Medio': 'badge-warning', 'medio': 'badge-warning',
    'Bajo': 'badge-danger', 'bajo': 'badge-danger',
    'Muy Bajo': 'badge-danger',
  };
  return <span className={`badge ${map[nivel] || 'badge-warning'}`}>{nivel}</span>;
};

// Chart default options
const defaultOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 8,
      titleFont: { size: 12 }, bodyFont: { size: 11 },
    },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
};
const doughnutOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
    tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 8 },
  },
};
const radarOpts = {
  responsive: true, maintainAspectRatio: false,
  scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, font: { size: 10 } } } },
  plugins: {
    legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 11 } } },
    tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 8 },
  },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const AdminEstadisticas = () => {
  const [tab, setTab] = useState('dashboard');
  const [cargando, setCargando] = useState(false);

  // Data states
  const [kpis, setKpis] = useState(null);
  const [nivelData, setNivelData] = useState(null);
  const [erroresData, setErroresData] = useState(null);
  const [rendimientoData, setRendimientoData] = useState(null);
  const [evolucionData, setEvolucionData] = useState(null);
  const [comparacionData, setComparacionData] = useState(null);

  // Filter states
  const [nivelFilters, setNivelFilters] = useState({ genero: 'todos', semestre: 'todos', estado: 'todos' });
  const [erroresFilters, setErroresFilters] = useState({ modulo: 'todos', genero: 'todos', semestre: 'todos', ordenar: 'mayor_error' });
  const [rendimientoTipo, setRendimientoTipo] = useState('genero');
  const [evolucionFilters, setEvolucionFilters] = useState({ genero: 'todos', semestre: 'todos' });
  const [comparacionTipo, setComparacionTipo] = useState('genero');

  // Chart refs for PNG export
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);

  // Módulos para filtros
  const [modulos, setModulos] = useState([]);

  // ---- DATA LOADERS ----
  const loadKPIs = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api.get('/admin/analitica/kpis');
      setKpis(res.data.data);
      setModulos(res.data.data.rendimientoModulos || []);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, []);

  const loadNivel = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams(nivelFilters).toString();
      const res = await api.get(`/admin/analitica/nivel-conocimiento?${params}`);
      setNivelData(res.data.data);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [nivelFilters]);

  const loadErrores = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams(erroresFilters).toString();
      const res = await api.get(`/admin/analitica/errores-avanzados?${params}`);
      setErroresData(res.data.data);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [erroresFilters]);

  const loadRendimiento = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api.get(`/admin/analitica/rendimiento?tipo=${rendimientoTipo}`);
      setRendimientoData(res.data.data);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [rendimientoTipo]);

  const loadEvolucion = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams(evolucionFilters).toString();
      const res = await api.get(`/admin/analitica/evolucion-aprendizaje?${params}`);
      setEvolucionData(res.data.data);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [evolucionFilters]);

  const loadComparaciones = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api.get(`/admin/analitica/comparaciones?tipo=${comparacionTipo}`);
      setComparacionData(res.data.data);
    } catch (e) { console.error(e); }
    setCargando(false);
  }, [comparacionTipo]);

  // Initial load based on tab
  useEffect(() => {
    if (tab === 'dashboard' && !kpis) loadKPIs();
    if (tab === 'nivel') loadNivel();
    if (tab === 'errores') loadErrores();
    if (tab === 'rendimiento') loadRendimiento();
    if (tab === 'evolucion') loadEvolucion();
    if (tab === 'comparaciones') loadComparaciones();
  }, [tab, loadKPIs, loadNivel, loadErrores, loadRendimiento, loadEvolucion, loadComparaciones, kpis]);

  // Export helpers
  const doExport = async (fmt) => {
    try {
      const res = await api.get(`/admin/analitica/exportar?formato=${fmt}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard_reporte.${fmt}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const tabs = [
    { id: 'dashboard', label: 'Resumen General', icon: <FiActivity /> },
    { id: 'nivel', label: 'Nivel Inicial', icon: <FiTarget /> },
    { id: 'rendimiento', label: 'Rendimiento', icon: <FiBarChart2 /> },
    { id: 'errores', label: 'Errores', icon: <FiAlertTriangle /> },
    { id: 'evolucion', label: 'Progreso', icon: <FiTrendingUp /> },
    { id: 'comparaciones', label: 'Comparar', icon: <FiLayers /> },
  ];

  // Filtro options
  const generoOpts = [
    { value: 'todos', label: 'Todos los géneros' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'prefiero_no_indicar', label: 'Prefiere no indicar' },
  ];
  const semestreOpts = [
    { value: 'todos', label: 'Todos los semestres' },
    ...Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}° Semestre` })),
  ];
  const estadoOpts = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' },
  ];
  const ordenarOpts = [
    { value: 'mayor_error', label: 'Mayor error' },
    { value: 'menor_error', label: 'Menor error' },
    { value: 'mas_respondidas', label: 'Más respondidas' },
    { value: 'menos_respondidas', label: 'Menos respondidas' },
  ];
  const moduloOpts = [
    { value: 'todos', label: 'Todos los módulos' },
    ...modulos.map(m => ({ value: String(m.id), label: m.titulo })),
  ];

  // ============================================================
  // RENDERS
  // ============================================================

  const renderDashboard = () => {
    if (!kpis) return <div className="loading-screen"><div className="spinner"></div></div>;

    const kpiCards = [
      { icon: FiUsers, label: 'Total Estudiantes', value: kpis.totalEstudiantes, color: COLORS.primary },
      { icon: FiCheckCircle, label: 'Aprobación General', value: `${kpis.tasaAprobacion}%`, color: kpis.tasaAprobacion >= 70 ? COLORS.success : COLORS.warning },
      { icon: FiTarget, label: 'Promedio General', value: `${kpis.promedioGeneral}%`, sub: `Nivel: ${kpis.nivelPromedio}`, color: COLORS.primary },
      { icon: FiBookOpen, label: 'Evaluaciones Realizadas', value: kpis.totalEvaluaciones, color: COLORS.secondary },
      { icon: FiAward, label: 'Certificados Emitidos', value: kpis.certificadosEmitidos, color: COLORS.teal },
      { icon: FiActivity, label: 'Avance del Curso', value: `${kpis.progresoCurso}%`, color: COLORS.indigo },
    ];

    // Charts data
    const nivelesChart = {
      labels: kpis.nivelesEncuesta?.map(n => (n.nivel || 'Sin nivel').charAt(0).toUpperCase() + (n.nivel || '').slice(1)) || [],
      datasets: [{
        data: kpis.nivelesEncuesta?.map(n => parseInt(n.dataValues?.cantidad || n.cantidad)) || [],
        backgroundColor: [COLORS.danger, COLORS.warning, COLORS.success],
        borderWidth: 0,
      }],
    };

    const modulosChart = {
      labels: kpis.rendimientoModulos?.map(m => m.titulo) || [],
      datasets: [{
        data: kpis.rendimientoModulos?.map(m => m.promedio) || [],
        backgroundColor: CHART_BG,
        borderColor: CHART_COLORS,
        borderWidth: 2,
      }],
    };

    return (
      <div>
        {/* Export bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={() => doExport('xlsx')} style={{ gap: 4 }}>
            <FiDownload size={14} /> Exportar Excel
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => doExport('csv')} style={{ gap: 4 }}>
            <FiDownload size={14} /> Exportar CSV
          </button>
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {kpiCards.map((k, i) => <KPICard key={i} {...k} delay={i * 0.04} />)}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '20px' }}>
            <SectionHeader title="Distribución Nivel Diagnóstico" />
            <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={nivelesChart} options={doughnutOpts} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '20px' }}>
            <SectionHeader title="Rendimiento Promedio por Módulo" />
            <div style={{ height: '280px' }}>
              <PolarArea data={modulosChart} options={doughnutOpts} />
            </div>
          </motion.div>
        </div>

        {/* Mayor error / acierto */}
        {(kpis.mayorError || kpis.mayorAcierto) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            {kpis.mayorError && (
              <div className="card" style={{ padding: '18px', borderLeft: `4px solid ${COLORS.danger}` }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', marginBottom: 6 }}>Pregunta con Mayor Error</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{kpis.mayorError.texto}...</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: COLORS.danger, marginTop: 4 }}>{kpis.mayorError.tasa}% error</div>
              </div>
            )}
            {kpis.mayorAcierto && (
              <div className="card" style={{ padding: '18px', borderLeft: `4px solid ${COLORS.success}` }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', marginBottom: 6 }}>Pregunta con Mayor Acierto</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{kpis.mayorAcierto.texto}...</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: COLORS.success, marginTop: 4 }}>{kpis.mayorAcierto.tasa}% acierto</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNivelConocimiento = () => {
    return (
      <div>
        <FilterBar
          filters={[
            { key: 'genero', options: generoOpts },
            { key: 'semestre', options: semestreOpts },
            { key: 'estado', options: estadoOpts },
          ]}
          values={nivelFilters}
          onChange={(k, v) => setNivelFilters(prev => ({ ...prev, [k]: v }))}
        />

        {!nivelData ? (
          <div className="loading-screen"><div className="spinner"></div></div>
        ) : (
          <div>
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <KPICard icon={FiUsers} label="Encuestas Completadas" value={nivelData.total} color={COLORS.primary} />
              <KPICard icon={FiTarget} label="Promedio Conocimiento" value={`${nivelData.estadisticas.promedio}%`} color={COLORS.secondary} />
              <KPICard icon={FiArrowUp} label="Máximo" value={`${nivelData.estadisticas.max}%`} color={COLORS.success} />
              <KPICard icon={FiArrowDown} label="Mínimo" value={`${nivelData.estadisticas.min}%`} color={COLORS.danger} />
            </div>

            {/* Doughnut */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <SectionHeader title="Distribución de Niveles">
                  <ExportBar onExportPNG chartRef={chartRef1} />
                </SectionHeader>
                <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    ref={chartRef1}
                    data={{
                      labels: Object.keys(nivelData.distribucion).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
                      datasets: [{
                        data: Object.values(nivelData.distribucion),
                        backgroundColor: [COLORS.danger, COLORS.warning, COLORS.success],
                        borderWidth: 0,
                      }],
                    }}
                    options={doughnutOpts}
                  />
                </div>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <SectionHeader title="Detalle por Nivel" />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Nivel</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Cantidad</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(nivelData.distribucion).map(([nivel, cant]) => (
                        <tr key={nivel} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                          <td style={{ padding: '10px' }}><NivelBadge nivel={nivel} /></td>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>{cant}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {nivelData.total > 0 ? Math.round((cant / nivelData.total) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Análisis por pregunta de la encuesta diagnóstica */}
            {nivelData.analisisPorPregunta && nivelData.analisisPorPregunta.length > 0 && (
              <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
                <SectionHeader title="Análisis por Pregunta de la Encuesta Diagnóstica" />
                <p style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)', marginBottom: 16 }}>
                  Detalle de aciertos y errores en cada pregunta de la encuesta inicial
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'left', minWidth: 220 }}>Pregunta</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Aciertos</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Errores</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>% Acierto</th>
                        <th style={{ padding: '10px', textAlign: 'left', minWidth: 180 }}>Respuesta Correcta</th>
                        <th style={{ padding: '10px', textAlign: 'left', minWidth: 180 }}>Error Más Común</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nivelData.analisisPorPregunta.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{p.id}</td>
                          <td style={{ padding: '10px', maxWidth: 300 }}>{p.pregunta}</td>
                          <td style={{ padding: '10px', textAlign: 'center', color: COLORS.success, fontWeight: 700 }}>{p.aciertos}</td>
                          <td style={{ padding: '10px', textAlign: 'center', color: COLORS.danger, fontWeight: 700 }}>{p.errores}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span className={`badge ${p.tasa_acierto >= 70 ? 'badge-success' : p.tasa_acierto >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                              {p.tasa_acierto}%
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: COLORS.success, fontSize: '0.8rem' }}>{p.respuesta_correcta}</td>
                          <td style={{ padding: '10px', color: COLORS.danger, fontSize: '0.8rem' }}>
                            {p.error_mas_comun !== 'N/A' ? p.error_mas_comun : '—'}
                            {p.error_mas_comun_count > 0 && (
                              <span style={{ color: 'var(--texto-terciario)', marginLeft: 4 }}>({p.error_mas_comun_count})</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRendimiento = () => {
    return (
      <div>
        {/* Selector de tipo */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { val: 'genero', label: 'Por Género' },
            { val: 'semestre', label: 'Por Semestre' },
            { val: 'modulo', label: 'Por Módulo' },
          ].map(t => (
            <button key={t.val} onClick={() => setRendimientoTipo(t.val)}
              className={`btn btn-sm ${rendimientoTipo === t.val ? 'btn-primary' : 'btn-secondary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {!rendimientoData ? (
          <div className="loading-screen"><div className="spinner"></div></div>
        ) : (
          <div>
            {/* Bar chart */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <SectionHeader title={`Rendimiento por ${rendimientoTipo === 'genero' ? 'Género' : rendimientoTipo === 'semestre' ? 'Semestre' : 'Módulo'}`}>
                <ExportBar onExportPNG chartRef={chartRef2} />
              </SectionHeader>
              <div style={{ height: '350px' }}>
                <Bar
                  ref={chartRef2}
                  data={{
                    labels: rendimientoData.datos.map(d => d.grupo),
                    datasets: [
                      {
                        label: 'Promedio (%)',
                        data: rendimientoData.datos.map(d => d.promedio),
                        backgroundColor: CHART_BG.slice(0, rendimientoData.datos.length),
                        borderColor: CHART_COLORS.slice(0, rendimientoData.datos.length),
                        borderWidth: 2,
                        borderRadius: 6,
                      },
                      {
                        label: '% Aprobación',
                        data: rendimientoData.datos.map(d => d.porcentaje_aprobacion),
                        backgroundColor: COLORS.success + '30',
                        borderColor: COLORS.success,
                        borderWidth: 2,
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={defaultOpts}
                />
              </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: '20px' }}>
              <SectionHeader title="Detalle del Rendimiento" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Grupo</th>
                      {rendimientoTipo !== 'modulo' && <th style={{ padding: '10px', textAlign: 'center' }}>Estudiantes</th>}
                      <th style={{ padding: '10px', textAlign: 'center' }}>Promedio</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nota Máx</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nota Mín</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>% Aprobación</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Tiempo Prom.</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimientoData.datos.map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{d.grupo}</td>
                        {rendimientoTipo !== 'modulo' && <td style={{ padding: '10px', textAlign: 'center' }}>{d.estudiantes}</td>}
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: COLORS.primary }}>{d.promedio}%</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: COLORS.success }}>{d.max}%</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: COLORS.danger }}>{d.min}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{d.porcentaje_aprobacion}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{fmtTime(d.tiempo_promedio)}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}><NivelBadge nivel={d.nivel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderErrores = () => {
    return (
      <div>
        <FilterBar
          filters={[
            { key: 'modulo', options: moduloOpts },
            { key: 'genero', options: generoOpts },
            { key: 'semestre', options: semestreOpts },
            { key: 'ordenar', options: ordenarOpts },
          ]}
          values={erroresFilters}
          onChange={(k, v) => setErroresFilters(prev => ({ ...prev, [k]: v }))}
        />

        {!erroresData ? (
          <div className="loading-screen"><div className="spinner"></div></div>
        ) : erroresData.errores.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--texto-terciario)' }}>
            No hay datos de errores disponibles con los filtros seleccionados.
          </div>
        ) : (
          <div>
            {/* Chart */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <SectionHeader title={`Top ${erroresData.errores.length} Preguntas con Errores`}>
                <ExportBar onExportPNG chartRef={chartRef3} />
              </SectionHeader>
              <div style={{ height: Math.max(300, erroresData.errores.length * 35) + 'px' }}>
                <Bar
                  ref={chartRef3}
                  data={{
                    labels: erroresData.errores.map((e, i) => `P${i + 1}: ${e.pregunta_texto?.substring(0, 40)}...`),
                    datasets: [{
                      label: 'Tasa de Error (%)',
                      data: erroresData.errores.map(e => e.tasa_error),
                      backgroundColor: erroresData.errores.map(e => e.tasa_error > 60 ? COLORS.danger + '60' : e.tasa_error > 40 ? COLORS.warning + '60' : COLORS.success + '60'),
                      borderColor: erroresData.errores.map(e => e.tasa_error > 60 ? COLORS.danger : e.tasa_error > 40 ? COLORS.warning : COLORS.success),
                      borderWidth: 2,
                      borderRadius: 4,
                    }],
                  }}
                  options={{ ...defaultOpts, indexAxis: 'y' }}
                />
              </div>
            </div>

            {/* Table detallada */}
            <div className="card" style={{ padding: '20px' }}>
              <SectionHeader title="Detalle de Errores por Pregunta" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '10px', textAlign: 'left', maxWidth: 250 }}>Pregunta</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Respuesta Correcta</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Error Más Común</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Errores</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Total</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Tasa Error</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Dificultad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {erroresData.errores.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '10px', maxWidth: 250 }}>{e.pregunta_texto?.substring(0, 100)}...</td>
                        <td style={{ padding: '10px', color: COLORS.success, fontWeight: 500, maxWidth: 200 }}>{e.respuesta_correcta?.substring(0, 60)}</td>
                        <td style={{ padding: '10px', color: COLORS.danger, fontWeight: 500, maxWidth: 200 }}>{e.respuesta_incorrecta_comun?.substring(0, 60)}</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: COLORS.danger, fontWeight: 700 }}>{e.errores}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{e.total}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span className={`badge ${e.tasa_error > 60 ? 'badge-danger' : e.tasa_error > 40 ? 'badge-warning' : 'badge-success'}`}>
                            {e.tasa_error}%
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                            background: e.nivel_dificultad === 'Difícil' ? COLORS.danger + '15' : e.nivel_dificultad === 'Moderada' ? COLORS.warning + '15' : COLORS.success + '15',
                            color: e.nivel_dificultad === 'Difícil' ? COLORS.danger : e.nivel_dificultad === 'Moderada' ? COLORS.warning : COLORS.success,
                          }}>
                            {e.nivel_dificultad}
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
      </div>
    );
  };

  const renderEvolucion = () => {
    return (
      <div>
        <FilterBar
          filters={[
            { key: 'genero', options: generoOpts },
            { key: 'semestre', options: semestreOpts },
          ]}
          values={evolucionFilters}
          onChange={(k, v) => setEvolucionFilters(prev => ({ ...prev, [k]: v }))}
        />

        {!evolucionData ? (
          <div className="loading-screen"><div className="spinner"></div></div>
        ) : evolucionData.evoluciones.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--texto-terciario)' }}>
            <FiTrendingUp size={40} style={{ marginBottom: 12, opacity: 0.3 }} /><br />
            Aún no hay estudiantes con encuesta diagnóstica y quizzes completados para medir la evolución.
          </div>
        ) : (
          <div>
            {/* Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <KPICard icon={FiUsers} label="Estudiantes Evaluados" value={evolucionData.resumen.total} color={COLORS.primary} />
              <KPICard icon={FiArrowUp} label="Mejoraron" value={evolucionData.resumen.mejoraron} color={COLORS.success} />
              <KPICard icon={FiArrowDown} label="Empeoraron" value={evolucionData.resumen.empeoraron} color={COLORS.danger} />
              <KPICard icon={FiTarget} label="Nota Inicial Prom." value={`${evolucionData.resumen.nota_inicial_promedio}%`} color={COLORS.warning} />
              <KPICard icon={FiTarget} label="Nota Final Prom." value={`${evolucionData.resumen.nota_final_promedio}%`} color={COLORS.success} />
              <KPICard icon={FiTrendingUp} label="Incremento Prom." value={`${evolucionData.resumen.incremento_promedio > 0 ? '+' : ''}${evolucionData.resumen.incremento_promedio}%`}
                color={evolucionData.resumen.incremento_promedio > 0 ? COLORS.success : COLORS.danger} />
            </div>

            {/* Gráfico de línea de progresión promedio */}
            {evolucionData.evoluciones.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <SectionHeader title="Progresión Promedio del Aprendizaje" />
                  <div style={{ height: '300px' }}>
                    {(() => {
                      // Calcular promedio por etapa
                      const maxSteps = Math.max(...evolucionData.evoluciones.map(e => e.progresion.length));
                      const labels = evolucionData.evoluciones[0]?.progresion.map(p => p.etapa) || [];
                      const promedios = labels.map((_, idx) => {
                        const vals = evolucionData.evoluciones.filter(e => e.progresion[idx]).map(e => e.progresion[idx].puntaje);
                        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                      });
                      return (
                        <Line
                          data={{
                            labels,
                            datasets: [{
                              label: 'Puntaje Promedio',
                              data: promedios,
                              borderColor: COLORS.primary,
                              backgroundColor: COLORS.primary + '15',
                              fill: true,
                              tension: 0.3,
                              pointRadius: 6,
                              pointBackgroundColor: COLORS.primary,
                            }],
                          }}
                          options={{ ...defaultOpts, scales: { ...defaultOpts.scales, y: { ...defaultOpts.scales.y, max: 100 } } }}
                        />
                      );
                    })()}
                  </div>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <SectionHeader title="Radar: Rendimiento por Módulo" />
                  <div style={{ height: '300px' }}>
                    {(() => {
                      const modLabels = evolucionData.evoluciones[0]?.detalle_modulos.map(m => m.modulo_titulo) || [];
                      const promedios = modLabels.map((_, idx) => {
                        const vals = evolucionData.evoluciones.filter(e => e.detalle_modulos[idx]).map(e => e.detalle_modulos[idx].puntaje);
                        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                      });
                      return (
                        <Radar
                          data={{
                            labels: modLabels,
                            datasets: [{
                              label: 'Promedio',
                              data: promedios,
                              borderColor: COLORS.secondary,
                              backgroundColor: COLORS.secondary + '25',
                              pointBackgroundColor: COLORS.secondary,
                            }],
                          }}
                          options={radarOpts}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Tabla por estudiante */}
            <div className="card" style={{ padding: '20px' }}>
              <SectionHeader title="Evolución por Estudiante" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Estudiante</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nota Inicial</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nivel Inicial</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nota Final</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nivel Final</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Incremento</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Módulos</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Intentos</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evolucionData.evoluciones.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                        <td style={{ padding: '10px', fontWeight: 500 }}>{e.estudiante}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{e.nota_inicial}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}><NivelBadge nivel={e.nivel_inicial} /></td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>{e.nota_final}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}><NivelBadge nivel={e.nivel_final} /></td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{
                            fontWeight: 700,
                            color: e.incremento_porcentual > 0 ? COLORS.success : e.incremento_porcentual < 0 ? COLORS.danger : 'var(--texto-terciario)',
                          }}>
                            {e.incremento_porcentual > 0 ? '+' : ''}{e.incremento_porcentual}%
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{e.modulos_completados}/{e.total_modulos}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{e.total_intentos}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{fmtTime(e.tiempo_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComparaciones = () => {
    return (
      <div>
        {/* Tipo selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { val: 'genero', label: 'Hombre vs Mujer' },
            { val: 'semestre', label: 'Semestre vs Semestre' },
            { val: 'modulo', label: 'Módulo vs Módulo' },
          ].map(t => (
            <button key={t.val} onClick={() => setComparacionTipo(t.val)}
              className={`btn btn-sm ${comparacionTipo === t.val ? 'btn-primary' : 'btn-secondary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {!comparacionData ? (
          <div className="loading-screen"><div className="spinner"></div></div>
        ) : comparacionData.comparaciones.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--texto-terciario)' }}>
            No hay datos suficientes para comparar.
          </div>
        ) : (
          <div>
            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <SectionHeader title="Comparativa de Promedios" />
                <div style={{ height: '300px' }}>
                  <Bar
                    data={{
                      labels: comparacionData.comparaciones.map(c => c.grupo),
                      datasets: [
                        {
                          label: 'Promedio',
                          data: comparacionData.comparaciones.map(c => c.promedio),
                          backgroundColor: CHART_BG,
                          borderColor: CHART_COLORS,
                          borderWidth: 2,
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={defaultOpts}
                  />
                </div>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <SectionHeader title="Radar Comparativo" />
                <div style={{ height: '300px' }}>
                  <Radar
                    data={{
                      labels: ['Promedio', '% Aprobación', 'Nota Máxima'],
                      datasets: comparacionData.comparaciones.slice(0, 4).map((c, i) => ({
                        label: c.grupo,
                        data: [c.promedio, c.porcentaje_aprobacion, c.max],
                        borderColor: CHART_COLORS[i],
                        backgroundColor: CHART_COLORS[i] + '20',
                        pointBackgroundColor: CHART_COLORS[i],
                      })),
                    }}
                    options={radarOpts}
                  />
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="card" style={{ padding: '20px' }}>
              <SectionHeader title="Tabla Comparativa" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Grupo</th>
                      {comparacionTipo !== 'modulo' && <th style={{ padding: '10px', textAlign: 'center' }}>Estudiantes</th>}
                      <th style={{ padding: '10px', textAlign: 'center' }}>Promedio</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nota Máx</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nota Mín</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>% Aprobación</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Tiempo Prom.</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Nivel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparacionData.comparaciones.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{c.grupo}</td>
                        {comparacionTipo !== 'modulo' && <td style={{ padding: '10px', textAlign: 'center' }}>{c.estudiantes}</td>}
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: COLORS.primary }}>{c.promedio}%</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: COLORS.success }}>{c.max}%</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: COLORS.danger }}>{c.min}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{c.porcentaje_aprobacion}%</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{fmtTime(c.tiempo_promedio)}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}><NivelBadge nivel={c.nivel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
          <h1 style={{ marginBottom: '6px' }}>
            <FiBarChart2 size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Estadísticas y Reportes
          </h1>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem' }}>
            Analiza el rendimiento y progreso de los estudiantes en la plataforma
          </p>
        </motion.div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap',
          padding: '4px', background: 'var(--bg-card)', borderRadius: 10,
          border: '1px solid var(--gris-medio)',
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`btn btn-sm ${tab === t.id ? 'btn-primary' : ''}`}
              style={{
                gap: '5px', fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? '' : 'transparent',
                color: tab === t.id ? '' : 'var(--texto-secundario)',
                border: 'none',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Loading overlay */}
        {cargando && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,255,0.5)', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="spinner"></div>
          </div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'dashboard' && renderDashboard()}
            {tab === 'nivel' && renderNivelConocimiento()}
            {tab === 'rendimiento' && renderRendimiento()}
            {tab === 'errores' && renderErrores()}
            {tab === 'evolucion' && renderEvolucion()}
            {tab === 'comparaciones' && renderComparaciones()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminEstadisticas;
