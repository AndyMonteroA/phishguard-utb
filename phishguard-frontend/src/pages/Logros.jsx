// ============================================================
// PhishGuard UTB - Pagina: Logros
// ============================================================

import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiLock, FiCheck } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const Logros = () => {
  const [logros, setLogros] = useState([]);
  const [total, setTotal] = useState(0);
  const [obtenidos, setObtenidos] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/logros');
        setLogros(res.data.data.logros);
        setTotal(res.data.data.total);
        setObtenidos(res.data.data.obtenidos);
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '12px' }}>Mis <span className="text-gradient">Logros</span></h1>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '1rem' }}>
            Has desbloqueado {obtenidos} de {total} logros
          </p>
          <div className="progress-bar-container" style={{ maxWidth: '300px', margin: '16px auto 0', height: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${total > 0 ? (obtenidos / total) * 100 : 0}%` }}></div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {logros.map((logro, i) => (
            <motion.div key={logro.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card" style={{
                padding: '28px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                opacity: logro.obtenido ? 1 : 0.6,
                borderTop: `4px solid ${logro.obtenido ? logro.color : '#ccc'}`,
              }}>

              {logro.obtenido && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiCheck size={16} color="#fff" />
                </div>
              )}

              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: logro.obtenido ? `${logro.color}18` : '#f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: logro.obtenido ? `0 4px 20px ${logro.color}30` : 'none',
              }}>
                {logro.obtenido ? (
                  <DynamicIcon name={logro.icono} size={32} color={logro.color} />
                ) : (
                  <FiLock size={28} color="#bbb" />
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: logro.obtenido ? 'var(--texto-principal)' : 'var(--texto-terciario)' }}>
                {logro.titulo}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)', lineHeight: 1.5 }}>
                {logro.descripcion}
              </p>

              {logro.obtenido && logro.fecha_obtenido && (
                <span style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.75rem', color: logro.color, fontWeight: 600 }}>
                  Obtenido: {new Date(logro.fecha_obtenido).toLocaleDateString('es-EC')}
                </span>
              )}
              {!logro.obtenido && (
                <span className="badge badge-info" style={{ marginTop: '12px', display: 'inline-block' }}>Bloqueado</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logros;
