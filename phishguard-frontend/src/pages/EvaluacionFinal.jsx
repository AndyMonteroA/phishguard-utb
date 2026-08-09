// ============================================================
// PhishGuard UTB - Pagina: Evaluación Final
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiEdit3, FiCheckCircle, FiXCircle, FiAward, FiArrowRight, FiBarChart2, FiClock, FiLock, FiAlertTriangle } from 'react-icons/fi';

const EvaluacionFinal = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [yaAprobada, setYaAprobada] = useState(null);
  const [tiempo, setTiempo] = useState(0);
  const [tiempoLimite, setTiempoLimite] = useState(1800);
  const [modulosEvaluados, setModulosEvaluados] = useState([]);
  const timer = useRef(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/evaluacion-final');
        if (res.data.data.ya_aprobada) {
          setYaAprobada(res.data.data.resultado);
        } else {
          setPreguntas(res.data.data.preguntas);
          const limite = res.data.data.tiempo_limite || 1800;
          setTiempoLimite(limite);
          setTiempo(limite);
          setModulosEvaluados(res.data.data.modulos_evaluados || []);
          timer.current = setInterval(() => setTiempo(t => {
            if (t <= 1) { clearInterval(timer.current); return 0; }
            return t - 1;
          }), 1000);
        }
      } catch (err) {
        if (err.response?.status === 400) {
          setError(err.response.data);
        } else {
          toast.error('Error al cargar la evaluación');
        }
      }
      finally { setCargando(false); }
    };
    cargar();
    return () => clearInterval(timer.current);
  }, []);

  const seleccionar = (preguntaId, opcionId) => {
    setRespuestas({ ...respuestas, [preguntaId]: opcionId });
  };

  const enviar = async (autoSubmit = false) => {
    if (!autoSubmit && Object.keys(respuestas).length < preguntas.length) {
      toast.error('Responde todas las preguntas'); return;
    }
    setEnviando(true);
    clearInterval(timer.current);
    const tiempoUsado = tiempoLimite - tiempo;
    try {
      const data = preguntas.map(p => ({ pregunta_id: p.id, respuesta: respuestas[p.id] || null }));
      const res = await api.post('/evaluacion-final/submit', { respuestas: data, tiempo_empleado: tiempoUsado });
      setResultado(res.data.data);
      if (autoSubmit) toast('⏰ Tiempo agotado. Respuestas enviadas.', { icon: '⏰', duration: 5000 });
      else toast.success(res.data.message);
    } catch (err) { toast.error('Error al enviar'); }
    finally { setEnviando(false); }
  };

  // Auto-submit cuando se acaba el tiempo
  useEffect(() => {
    if (tiempo === 0 && preguntas.length > 0 && !resultado && !autoSubmitted.current && !yaAprobada) {
      autoSubmitted.current = true;
      enviar(true);
    }
  }, [tiempo, preguntas.length, resultado]);

  const formatTiempo = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  // No completó todos los módulos
  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card" style={{ textAlign: 'center', padding: '60px 36px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(243,156,18,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiLock size={36} color="#F39C12" />
            </div>
            <h2 style={{ marginBottom: '12px' }}>Evaluación Final Bloqueada</h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '1rem', marginBottom: '24px', maxWidth: 400, margin: '0 auto 24px' }}>
              {error.message}
            </p>
            {error.data && (
              <div style={{ marginBottom: '24px' }}>
                <div className="progress-bar-container" style={{ height: '12px', maxWidth: 300, margin: '0 auto' }}>
                  <div className="progress-bar-fill" style={{ width: `${(error.data.completados / error.data.total) * 100}%` }}></div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)', marginTop: '8px' }}>
                  {error.data.completados} de {error.data.total} módulos completados
                </p>
              </div>
            )}
            <Link to="/modulos" className="btn btn-primary">📚 Ir a los Módulos</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Ya aprobó la evaluación
  if (yaAprobada) {
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card" style={{ textAlign: 'center', padding: '60px 36px', borderTop: '5px solid #27AE60' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(39,174,96,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiAward size={36} color="#27AE60" />
            </div>
            <h2 style={{ marginBottom: '12px', color: '#27AE60' }}>🎓 Evaluación Final Aprobada</h2>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#27AE60', marginBottom: '12px' }}>{yaAprobada.porcentaje}%</div>
            <p style={{ color: 'var(--texto-terciario)', marginBottom: '24px' }}>
              Aprobaste con {yaAprobada.puntaje} de {yaAprobada.total_preguntas} preguntas correctas
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/certificado" className="btn btn-primary">📜 Ver mi Certificado</Link>
              <Link to="/mi-progreso" className="btn btn-secondary">📊 Mi Progreso</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Resultado de la evaluación
  if (resultado) {
    const { resultado: res, detalle, resumen_modulos } = resultado;
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card" style={{ textAlign: 'center', padding: '48px 36px', marginBottom: '24px',
              borderTop: `5px solid ${res.aprobado ? '#27AE60' : '#E74C3C'}` }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: res.aprobado ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {res.aprobado ? <FiAward size={36} color="#27AE60" /> : <FiAlertTriangle size={36} color="#E74C3C" />}
              </div>
              <h2 style={{ marginBottom: '8px' }}>
                {res.aprobado ? '🎓 ¡Felicidades! Evaluación Aprobada' : 'Evaluación No Aprobada'}
              </h2>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: res.aprobado ? '#27AE60' : '#E74C3C', marginBottom: '12px' }}>
                {res.porcentaje}%
              </div>
              <p style={{ color: 'var(--texto-terciario)', fontSize: '0.95rem' }}>
                {res.puntaje} de {res.total_preguntas} correctas | Tiempo: {formatTiempo(res.tiempo_empleado || 0)}
              </p>
              {res.aprobado && (
                <p style={{ color: '#27AE60', fontWeight: 600, marginTop: '12px' }}>
                  Ya puedes generar tu certificado de concientización
                </p>
              )}
            </div>

            {/* Resumen por módulo */}
            {resumen_modulos && resumen_modulos.length > 0 && (
              <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>📊 Rendimiento por Módulo</h3>
                {resumen_modulos.map((m, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{m.modulo}</span>
                      <span style={{ color: m.porcentaje >= 70 ? '#27AE60' : '#E74C3C', fontWeight: 700 }}>
                        {m.correctas}/{m.total} ({m.porcentaje}%)
                      </span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '8px' }}>
                      <div className="progress-bar-fill" style={{
                        width: `${m.porcentaje}%`,
                        background: m.porcentaje >= 70 ? '#27AE60' : m.porcentaje >= 40 ? '#F39C12' : '#E74C3C',
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Detalle de respuestas */}
            <h3 style={{ marginBottom: '16px' }}>Detalle de Respuestas</h3>
            {detalle?.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card" style={{ padding: '20px', marginBottom: '12px', borderLeft: `4px solid ${d.correcta ? '#27AE60' : '#E74C3C'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {d.correcta ? <FiCheckCircle color="#27AE60" /> : <FiXCircle color="#E74C3C" />}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Pregunta {i + 1}</span>
                  <span className={`badge ${d.correcta ? 'badge-success' : 'badge-danger'}`}>{d.correcta ? 'Correcta' : 'Incorrecta'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)', marginLeft: 'auto' }}>{d.modulo}</span>
                </div>
                <p style={{ marginBottom: '8px', fontSize: '0.92rem' }}>{d.pregunta_texto}</p>
                {!d.correcta && (
                  <div style={{ background: 'rgba(231,76,60,0.06)', padding: '10px 14px', borderRadius: 'var(--radio-sm)', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Tu respuesta: {d.opciones?.find(o => o.id === d.respuesta_usuario)?.texto || d.respuesta_usuario || 'Sin respuesta'}
                  </div>
                )}
                <div style={{ background: 'rgba(39,174,96,0.06)', padding: '10px 14px', borderRadius: 'var(--radio-sm)', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Respuesta correcta: {d.opciones?.find(o => o.id === d.respuesta_correcta)?.texto || d.respuesta_correcta}
                </div>
                {d.retroalimentacion && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)', fontStyle: 'italic', marginTop: '6px' }}>
                    {d.retroalimentacion}
                  </p>
                )}
              </motion.div>
            ))}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'center' }}>
              {res.aprobado ? (
                <Link to="/certificado" className="btn btn-primary" style={{ gap: '6px' }}>
                  <FiAward /> Generar Certificado
                </Link>
              ) : (
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                  🔄 Intentar de nuevo
                </button>
              )}
              <Link to="/mi-progreso" className="btn btn-secondary"><FiBarChart2 /> Mi Progreso</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz activo
  const pregunta = preguntas[preguntaActual];
  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiEdit3 size={20} color="var(--azul-institucional)" />
              <h2 style={{ fontSize: '1.4rem' }}>🎓 Evaluación Final</h2>
            </div>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.85rem' }}>
              Pregunta {preguntaActual + 1} de {preguntas.length}
              {pregunta?.modulo_titulo && <span> • <strong>{pregunta.modulo_titulo}</strong></span>}
            </p>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px',
            background: tiempo <= 120 ? 'rgba(231,76,60,0.1)' : '', border: tiempo <= 120 ? '2px solid #E74C3C' : '',
            animation: tiempo <= 60 && tiempo > 0 ? 'pulse 1s infinite' : 'none' }}>
            <FiClock size={16} color={tiempo <= 120 ? '#E74C3C' : 'var(--azul-institucional)'} />
            <span style={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: 'monospace', color: tiempo <= 120 ? '#E74C3C' : 'inherit' }}>
              {formatTiempo(tiempo)}
            </span>
          </div>
        </div>

        <div className="progress-bar-container" style={{ marginBottom: '24px' }}>
          <div className="progress-bar-fill" style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={preguntaActual} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.15rem', lineHeight: 1.5, marginBottom: '28px' }}>{pregunta?.pregunta}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pregunta?.opciones?.map((op) => (
                <button key={op.id} onClick={() => seleccionar(pregunta.id, op.id)} style={{
                  padding: '16px 20px', textAlign: 'left', borderRadius: 'var(--radio-md)',
                  border: `2px solid ${respuestas[pregunta.id] === op.id ? 'var(--azul-institucional)' : 'var(--gris-medio)'}`,
                  background: respuestas[pregunta.id] === op.id ? 'var(--azul-light)' : 'var(--blanco)',
                  fontSize: '0.95rem', cursor: 'pointer', transition: 'var(--transicion)', color: 'var(--texto-principal)',
                  fontWeight: respuestas[pregunta.id] === op.id ? 600 : 400,
                }}>
                  <strong style={{ marginRight: '10px', color: 'var(--azul-institucional)' }}>{op.id.toUpperCase()})</strong>{op.texto}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button onClick={() => setPreguntaActual(Math.max(0, preguntaActual - 1))} className="btn btn-secondary" disabled={preguntaActual === 0}>Anterior</button>
          {preguntaActual < preguntas.length - 1 ? (
            <button onClick={() => setPreguntaActual(preguntaActual + 1)} className="btn btn-primary" disabled={!respuestas[pregunta?.id]}>Siguiente <FiArrowRight /></button>
          ) : (
            <button onClick={() => enviar(false)} className="btn btn-success btn-lg" disabled={enviando || Object.keys(respuestas).length < preguntas.length}>
              {enviando ? 'Evaluando...' : '📋 Enviar Evaluación Final'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluacionFinal;
