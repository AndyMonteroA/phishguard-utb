// ============================================================
// PhishGuard UTB - Pagina: Encuesta Diagnostica
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiClipboard, FiAward, FiBarChart2, FiBookOpen, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const Encuesta = () => {
  const { actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/encuesta');
        if (res.data.data.completada) setResultado(res.data.data.resultado);
        else setPreguntas(res.data.data.preguntas);
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const seleccionarRespuesta = (preguntaId, opcionId) => { setRespuestas({ ...respuestas, [preguntaId]: opcionId }); };

  const enviar = async () => {
    if (Object.keys(respuestas).length < preguntas.length) { toast.error('Responde todas las preguntas'); return; }
    setEnviando(true);
    try {
      const data = preguntas.map(p => ({ pregunta_id: p.id, respuesta: respuestas[p.id] }));
      const res = await api.post('/encuesta', { respuestas: data });
      setResultado(res.data.data);
      actualizarUsuario({ encuesta_completada: true });
      toast.success('Encuesta completada');
    } catch (err) { toast.error(err.response?.data?.message || 'Error al enviar'); }
    finally { setEnviando(false); }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  if (resultado) {
    const NivelIcon = resultado.nivel === 'alto' ? FiAward : resultado.nivel === 'medio' ? FiBarChart2 : FiBookOpen;
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px 36px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <NivelIcon size={36} color="var(--azul-institucional)" />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Resultado de tu Diagnostico</h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--azul-institucional)', marginBottom: '8px' }}>{resultado.puntaje}%</div>
          <span className={`badge ${resultado.nivel === 'alto' ? 'badge-success' : resultado.nivel === 'medio' ? 'badge-warning' : 'badge-danger'}`}
            style={{ fontSize: '0.9rem', padding: '6px 16px', marginBottom: '16px', display: 'inline-block' }}>
            Nivel: {resultado.nivel?.charAt(0).toUpperCase() + resultado.nivel?.slice(1)}
          </span>
          <p style={{ color: 'var(--texto-terciario)', marginBottom: '28px', lineHeight: 1.6 }}>
            {resultado.interpretacion || 'Ahora puedes comenzar los modulos de aprendizaje.'}
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-lg">Ir al Dashboard</button>
        </motion.div>
      </div>
    );
  }

  const pregunta = preguntas[preguntaActual];
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <FiClipboard size={24} color="var(--azul-institucional)" />
          </div>
          <h2>Encuesta Diagnostica</h2>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem' }}>Evaluamos tu nivel de conocimiento sobre Ingenieria Social</p>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--texto-terciario)', marginBottom: '8px' }}>
            <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
            <span>{Math.round(((preguntaActual + 1) / preguntas.length) * 100)}%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}></div></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={preguntaActual} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="card" style={{ padding: '32px' }}>
            {pregunta.seccion && <span className="badge badge-info" style={{ marginBottom: '12px' }}>{pregunta.seccion}</span>}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', lineHeight: 1.5 }}>{pregunta.pregunta}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pregunta.opciones.map((op) => (
                <button key={op.id} onClick={() => seleccionarRespuesta(pregunta.id, op.id)} style={{
                  padding: '14px 18px', textAlign: 'left', borderRadius: 'var(--radio-md)',
                  border: `2px solid ${respuestas[pregunta.id] === op.id ? 'var(--azul-institucional)' : 'var(--gris-medio)'}`,
                  background: respuestas[pregunta.id] === op.id ? 'var(--azul-light)' : 'var(--blanco)',
                  fontSize: '0.92rem', cursor: 'pointer', transition: 'var(--transicion)', color: 'var(--texto-principal)',
                }}>
                  <strong style={{ marginRight: '8px', color: 'var(--azul-institucional)' }}>{op.id.toUpperCase()})</strong>{op.texto}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button onClick={() => setPreguntaActual(Math.max(0, preguntaActual - 1))} className="btn btn-secondary" disabled={preguntaActual === 0}><FiArrowLeft /> Anterior</button>
          {preguntaActual < preguntas.length - 1 ? (
            <button onClick={() => setPreguntaActual(preguntaActual + 1)} className="btn btn-primary" disabled={!respuestas[pregunta.id]}>Siguiente <FiArrowRight /></button>
          ) : (
            <button onClick={enviar} className="btn btn-success" disabled={enviando || Object.keys(respuestas).length < preguntas.length}>
              {enviando ? 'Enviando...' : 'Enviar Encuesta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Encuesta;
