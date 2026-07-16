// ============================================================
// PhishGuard UTB - Pagina: Quiz Interactivo
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiEdit3, FiCheckCircle, FiXCircle, FiAward, FiArrowRight, FiBarChart2, FiClock } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const Quiz = () => {
  const { moduloId } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [modulo, setModulo] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/quiz/${moduloId}`);
        setPreguntas(res.data.data.preguntas);
        setModulo(res.data.data.modulo);
        timer.current = setInterval(() => setTiempo(t => t + 1), 1000);
      } catch (err) { toast.error('Error al cargar quiz'); }
      finally { setCargando(false); }
    };
    cargar();
    return () => clearInterval(timer.current);
  }, [moduloId]);

  const seleccionar = (preguntaId, opcionId) => {
    setRespuestas({ ...respuestas, [preguntaId]: opcionId });
  };

  const enviar = async () => {
    if (Object.keys(respuestas).length < preguntas.length) { toast.error('Responde todas las preguntas'); return; }
    setEnviando(true);
    clearInterval(timer.current);
    try {
      const data = preguntas.map(p => ({ pregunta_id: p.id, respuesta: respuestas[p.id] }));
      const res = await api.post(`/quiz/${moduloId}`, { respuestas: data, tiempo_empleado: tiempo });
      setResultado(res.data.data);
      toast.success(res.data.message);
    } catch (err) { toast.error('Error al enviar'); }
    finally { setEnviando(false); }
  };

  const formatTiempo = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  if (resultado) {
    const { resultado: res, detalle } = resultado;
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card" style={{ textAlign: 'center', padding: '48px 36px', marginBottom: '24px',
              borderTop: `5px solid ${res.aprobado ? '#27AE60' : '#E74C3C'}` }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: res.aprobado ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {res.aprobado ? <FiAward size={36} color="#27AE60" /> : <FiBarChart2 size={36} color="#E74C3C" />}
              </div>
              <h2 style={{ marginBottom: '8px' }}>{res.aprobado ? 'Aprobado!' : 'Sigue practicando'}</h2>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: res.aprobado ? '#27AE60' : '#E74C3C', marginBottom: '12px' }}>{res.porcentaje}%</div>
              <p style={{ color: 'var(--texto-terciario)', fontSize: '0.95rem' }}>
                {res.puntaje} de {res.total_preguntas} correctas | Tiempo: {formatTiempo(res.tiempo_empleado || tiempo)}
              </p>
            </div>

            <h3 style={{ marginBottom: '16px' }}>Detalle de Respuestas</h3>
            {detalle?.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card" style={{ padding: '20px', marginBottom: '12px', borderLeft: `4px solid ${d.correcta ? '#27AE60' : '#E74C3C'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {d.correcta ? <FiCheckCircle color="#27AE60" /> : <FiXCircle color="#E74C3C" />}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Pregunta {i + 1}</span>
                  <span className={`badge ${d.correcta ? 'badge-success' : 'badge-danger'}`}>{d.correcta ? 'Correcta' : 'Incorrecta'}</span>
                </div>
                <p style={{ marginBottom: '8px', fontSize: '0.92rem' }}>{d.pregunta_texto}</p>
                {!d.correcta && (
                  <div style={{ background: 'rgba(231,76,60,0.06)', padding: '10px 14px', borderRadius: 'var(--radio-sm)', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Tu respuesta: {d.opciones?.find(o => o.id === d.respuesta_usuario)?.texto || d.respuesta_usuario}
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
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <Link to="/modulos" className="btn btn-secondary">Volver a Modulos</Link>
              {!res.aprobado && <Link to={`/modulos/${moduloId}`} className="btn btn-primary">Estudiar de nuevo</Link>}
              <Link to="/mi-progreso" className="btn btn-primary"><FiBarChart2 /> Ver mi Progreso</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const pregunta = preguntas[preguntaActual];
  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiEdit3 size={20} color="var(--azul-institucional)" />
              <h2 style={{ fontSize: '1.4rem' }}>Quiz: {modulo?.titulo}</h2>
            </div>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.88rem' }}>Pregunta {preguntaActual + 1} de {preguntas.length}</p>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiClock size={16} color="var(--azul-institucional)" />
            <span style={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: 'monospace' }}>{formatTiempo(tiempo)}</span>
          </div>
        </div>
        <div className="progress-bar-container" style={{ marginBottom: '24px' }}>
          <div className="progress-bar-fill" style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={preguntaActual} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.15rem', lineHeight: 1.5, marginBottom: '28px' }}>{pregunta.pregunta}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pregunta.opciones?.map((op) => (
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
            <button onClick={() => setPreguntaActual(preguntaActual + 1)} className="btn btn-primary" disabled={!respuestas[pregunta.id]}>Siguiente <FiArrowRight /></button>
          ) : (
            <button onClick={enviar} className="btn btn-success btn-lg" disabled={enviando || Object.keys(respuestas).length < preguntas.length}>
              {enviando ? 'Evaluando...' : 'Enviar Respuestas'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
