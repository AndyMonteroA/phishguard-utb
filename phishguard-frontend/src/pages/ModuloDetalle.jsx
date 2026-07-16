// ============================================================
// PhishGuard UTB - Pagina: Detalle del Modulo
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiEdit3, FiBookOpen, FiAlertTriangle, FiZap } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const ModuloDetalle = () => {
  const { id } = useParams();
  const [modulo, setModulo] = useState(null);
  const [contenidoActual, setContenidoActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try { const res = await api.get(`/modulos/${id}`); setModulo(res.data.data.modulo); }
      catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, [id]);

  const marcarVisto = async (contenidoId) => {
    try { await api.post(`/progreso/${id}/contenido/${contenidoId}`); } catch (err) { console.error(err); }
  };

  const siguiente = () => {
    if (modulo?.contenidos && contenidoActual < modulo.contenidos.length - 1) {
      marcarVisto(modulo.contenidos[contenidoActual].id);
      setContenidoActual(contenidoActual + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const anterior = () => {
    if (contenidoActual > 0) { setContenidoActual(contenidoActual - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;
  if (!modulo) return <div className="page-wrapper"><div className="container"><h2>Modulo no encontrado</h2></div></div>;

  const contenido = modulo.contenidos?.[contenidoActual];
  const esUltimo = contenidoActual === (modulo.contenidos?.length || 0) - 1;

  const tipoIcono = { ejemplo_interactivo: <FiZap size={14} />, caso_real: <FiAlertTriangle size={14} />, texto: <FiBookOpen size={14} /> };
  const tipoTexto = { ejemplo_interactivo: 'Ejemplo Interactivo', caso_real: 'Caso Real', texto: 'Lectura' };

  const renderContenido = (cont) => {
    if (!cont) return null;
    return (
      <div style={{ lineHeight: 1.8, fontSize: '1rem', color: 'var(--texto-principal)' }}>
        {cont.contenido.split('\n').map((parrafo, i) => {
          if (parrafo.startsWith('**') && parrafo.endsWith('**')) return <h4 key={i} style={{ marginTop: '20px', marginBottom: '8px', color: 'var(--azul-institucional)' }}>{parrafo.replace(/\*\*/g, '')}</h4>;
          if (parrafo.trim() === '') return <br key={i} />;
          return <p key={i} style={{ marginBottom: '10px' }}>{parrafo}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/modulos" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--texto-terciario)', fontSize: '0.9rem', marginBottom: '20px' }}>
            <FiArrowLeft /> Volver a modulos
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radio-md)', background: `${modulo.color || '#1B3A6B'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DynamicIcon name={modulo.icono} size={28} color={modulo.color || '#1B3A6B'} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{modulo.titulo}</h1>
              <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem' }}>{modulo.duracion_estimada}</p>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--texto-terciario)', marginBottom: '6px' }}>
              <span>Seccion {contenidoActual + 1} de {modulo.contenidos?.length || 0}</span>
              <span>{Math.round(((contenidoActual + 1) / (modulo.contenidos?.length || 1)) * 100)}%</span>
            </div>
            <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((contenidoActual + 1) / (modulo.contenidos?.length || 1)) * 100}%`, background: modulo.color }}></div></div>
          </div>
        </motion.div>

        {contenido && (
          <motion.div key={contenidoActual} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '36px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span className={`badge ${contenido.tipo === 'ejemplo_interactivo' ? 'badge-warning' : contenido.tipo === 'caso_real' ? 'badge-danger' : 'badge-info'}`}>
                {tipoIcono[contenido.tipo]} {tipoTexto[contenido.tipo] || 'Lectura'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--azul-institucional)' }}>{contenido.titulo}</h2>
            {renderContenido(contenido)}
          </motion.div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <button onClick={anterior} className="btn btn-secondary" disabled={contenidoActual === 0}><FiArrowLeft /> Anterior</button>
          {esUltimo ? (
            <Link to={`/quiz/${id}`} className="btn btn-success btn-lg" onClick={() => contenido && marcarVisto(contenido.id)}>
              <FiEdit3 /> Ir al Quiz
            </Link>
          ) : (
            <button onClick={siguiente} className="btn btn-primary">Siguiente <FiArrowRight /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuloDetalle;
