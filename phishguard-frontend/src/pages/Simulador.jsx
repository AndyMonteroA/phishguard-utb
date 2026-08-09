// ============================================================
// PhishGuard UTB - Pagina: Simulador de Phishing
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiShield, FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock, FiArrowRight, FiArrowLeft, FiEye, FiInfo } from 'react-icons/fi';

const Simulador = () => {
  const [emails, setEmails] = useState([]);
  const [emailActual, setEmailActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [tiempo, setTiempo] = useState(600);
  const timer = useRef(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/simulador');
        setEmails(res.data.data.emails);
        setTiempo(res.data.data.tiempo_limite || 600);
        timer.current = setInterval(() => setTiempo(t => {
          if (t <= 1) { clearInterval(timer.current); return 0; }
          return t - 1;
        }), 1000);
      } catch (err) { toast.error('Error al cargar simulador'); }
      finally { setCargando(false); }
    };
    cargar();
    return () => clearInterval(timer.current);
  }, []);

  const clasificar = (emailId, tipo) => {
    setRespuestas({ ...respuestas, [emailId]: tipo });
  };

  const enviar = async (auto = false) => {
    if (!auto && Object.keys(respuestas).length < emails.length) {
      toast.error('Clasifica todos los correos antes de enviar'); return;
    }
    setEnviando(true);
    clearInterval(timer.current);
    const tiempoUsado = 600 - tiempo;
    try {
      const data = emails.map(e => ({ email_id: e.id, respuesta: respuestas[e.id] || 'phishing' }));
      const res = await api.post('/simulador/submit', { respuestas: data, tiempo_empleado: tiempoUsado });
      setResultado(res.data.data);
      if (auto) toast('Se acabó el tiempo.', { icon: '⏰' });
      else toast.success(res.data.message);
    } catch (err) { toast.error('Error al enviar'); }
    finally { setEnviando(false); }
  };

  useEffect(() => {
    if (tiempo === 0 && emails.length > 0 && !resultado && !autoSubmitted.current) {
      autoSubmitted.current = true;
      enviar(true);
    }
  }, [tiempo, emails.length, resultado]);

  const formatTiempo = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  // Pantalla de resultados
  if (resultado) {
    const { resultado: res, detalle } = resultado;
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card" style={{ textAlign: 'center', padding: '48px 36px', marginBottom: '24px',
              borderTop: `5px solid ${res.porcentaje >= 70 ? '#27AE60' : '#E74C3C'}` }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: res.porcentaje >= 70 ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FiShield size={36} color={res.porcentaje >= 70 ? '#27AE60' : '#E74C3C'} />
              </div>
              <h2 style={{ marginBottom: '8px' }}>
                {res.porcentaje >= 90 ? 'Experto en detección' : res.porcentaje >= 70 ? 'Buena detección' : 'Necesitas más práctica'}
              </h2>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: res.porcentaje >= 70 ? '#27AE60' : '#E74C3C', marginBottom: '12px' }}>
                {res.porcentaje}%
              </div>
              <p style={{ color: 'var(--texto-terciario)', fontSize: '0.95rem' }}>
                {res.correctas} de {res.total} correos identificados correctamente | Tiempo: {formatTiempo(res.tiempo_empleado || 0)}
              </p>
            </div>

            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiEye color="var(--azul-institucional)" /> Análisis Detallado
            </h3>

            {detalle?.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card" style={{ padding: '20px', marginBottom: '12px', borderLeft: `4px solid ${d.correcta ? '#27AE60' : '#E74C3C'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {d.correcta ? <FiCheckCircle color="#27AE60" /> : <FiXCircle color="#E74C3C" />}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Correo {i + 1}</span>
                  <span className={`badge ${d.correcta ? 'badge-success' : 'badge-danger'}`}>{d.correcta ? 'Acertaste' : 'Fallaste'}</span>
                  <span className={`badge ${d.tipo_real === 'phishing' ? 'badge-danger' : 'badge-success'}`} style={{ marginLeft: 'auto' }}>
                    {d.tipo_real === 'phishing' ? 'Era PHISHING' : 'Era LEGÍTIMO'}
                  </span>
                </div>

                <div style={{ background: 'var(--gris-claro)', padding: '12px', borderRadius: 'var(--radio-sm)', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', marginBottom: '4px' }}>De: {d.de}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{d.asunto}</div>
                </div>

                {!d.correcta && (
                  <div style={{ background: 'rgba(231,76,60,0.06)', padding: '10px 14px', borderRadius: 'var(--radio-sm)', fontSize: '0.85rem', marginBottom: '8px', color: '#E74C3C' }}>
                    Tu respuesta: {d.respuesta_usuario === 'phishing' ? 'Phishing' : 'Legítimo'} — La respuesta correcta era: {d.tipo_real === 'phishing' ? 'Phishing' : 'Legítimo'}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px' }}>
                  <FiInfo size={14} color="var(--azul-institucional)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--azul-institucional)' }}>Señales clave:</span>
                    <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>
                      {d.pistas?.map((p, j) => <li key={j} style={{ marginBottom: '2px' }}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ gap: '6px' }}>
                <FiShield /> Intentar de nuevo
              </button>
              <Link to="/modulos" className="btn btn-secondary" style={{ gap: '6px' }}><FiArrowRight /> Volver a Módulos</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Simulador activo
  const email = emails[emailActual];
  const respondidos = Object.keys(respuestas).length;

  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiShield color="var(--azul-institucional)" /> Simulador de Phishing
            </h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '0.85rem' }}>
              Correo {emailActual + 1} de {emails.length} | {respondidos} clasificados
            </p>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px',
            background: tiempo <= 60 ? 'rgba(231,76,60,0.1)' : '', border: tiempo <= 60 ? '2px solid #E74C3C' : '' }}>
            <FiClock size={16} color={tiempo <= 60 ? '#E74C3C' : 'var(--azul-institucional)'} />
            <span style={{ fontWeight: 600, fontSize: '1.1rem', fontFamily: 'monospace', color: tiempo <= 60 ? '#E74C3C' : 'inherit' }}>
              {formatTiempo(tiempo)}
            </span>
          </div>
        </div>

        <div className="progress-bar-container" style={{ marginBottom: '24px' }}>
          <div className="progress-bar-fill" style={{ width: `${(respondidos / emails.length) * 100}%` }}></div>
        </div>

        {/* Instrucciones */}
        <div style={{ background: 'rgba(46,109,164,0.06)', padding: '12px 16px', borderRadius: 'var(--radio-md)', marginBottom: '20px',
          border: '1px solid rgba(46,109,164,0.15)', fontSize: '0.85rem', color: 'var(--texto-secundario)' }}>
          <FiInfo size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Lee cada correo y decide si es <strong style={{ color: '#E74C3C' }}>Phishing</strong> (fraudulento) o <strong style={{ color: '#27AE60' }}>Legítimo</strong> (seguro).
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={emailActual} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            {/* Email simulado */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
              {/* Header del email */}
              <div style={{ background: 'var(--azul-institucional)', color: '#fff', padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiMail size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Bandeja de Entrada</span>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--gris-medio)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>De: <strong style={{ color: 'var(--texto-principal)' }}>{email?.de}</strong></span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)', marginBottom: '4px' }}>Para: {email?.para}</div>
                  <h3 style={{ fontSize: '1.1rem', marginTop: '8px' }}>{email?.asunto}</h3>
                </div>

                <div style={{ whiteSpace: 'pre-line', fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--texto-secundario)' }}>
                  {email?.cuerpo}
                </div>
              </div>
            </div>

            {/* Botones de clasificación */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => clasificar(email.id, 'phishing')}
                style={{
                  padding: '20px', borderRadius: 'var(--radio-md)', cursor: 'pointer', transition: 'all 0.2s',
                  border: `3px solid ${respuestas[email?.id] === 'phishing' ? '#E74C3C' : 'var(--gris-medio)'}`,
                  background: respuestas[email?.id] === 'phishing' ? 'rgba(231,76,60,0.08)' : 'var(--blanco)',
                  textAlign: 'center',
                }}>
                <FiAlertTriangle size={28} color="#E74C3C" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#E74C3C' }}>Phishing</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', marginTop: '4px' }}>Es un correo fraudulento</div>
              </button>
              <button
                onClick={() => clasificar(email.id, 'legitimo')}
                style={{
                  padding: '20px', borderRadius: 'var(--radio-md)', cursor: 'pointer', transition: 'all 0.2s',
                  border: `3px solid ${respuestas[email?.id] === 'legitimo' ? '#27AE60' : 'var(--gris-medio)'}`,
                  background: respuestas[email?.id] === 'legitimo' ? 'rgba(39,174,96,0.08)' : 'var(--blanco)',
                  textAlign: 'center',
                }}>
                <FiCheckCircle size={28} color="#27AE60" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#27AE60' }}>Legítimo</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', marginTop: '4px' }}>Es un correo seguro</div>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navegación */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => setEmailActual(Math.max(0, emailActual - 1))} className="btn btn-secondary" disabled={emailActual === 0}>
            <FiArrowLeft /> Anterior
          </button>
          {emailActual < emails.length - 1 ? (
            <button onClick={() => setEmailActual(emailActual + 1)} className="btn btn-primary" disabled={!respuestas[email?.id]}>
              Siguiente <FiArrowRight />
            </button>
          ) : (
            <button onClick={() => enviar(false)} className="btn btn-success btn-lg" disabled={enviando || respondidos < emails.length}>
              {enviando ? 'Evaluando...' : 'Enviar Clasificación'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulador;
