// ============================================================
// PhishGuard UTB - Pagina: Lista de Modulos
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiClock, FiArrowRight, FiCheckCircle, FiLoader, FiBookOpen } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const colores = ['#E74C3C', '#9B59B6', '#3498DB', '#F39C12'];

const ModulosList = () => {
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try { const res = await api.get('/modulos'); setModulos(res.data.data.modulos); }
      catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '12px' }}>Modulos de <span className="text-gradient">Aprendizaje</span></h1>
          <p style={{ color: 'var(--texto-terciario)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Explora los 4 modulos sobre las principales tecnicas de Ingenieria Social
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {modulos.map((mod, i) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={`/modulos/${mod.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ background: colores[i], padding: '32px 24px', textAlign: 'center' }}>
                    <DynamicIcon name={mod.icono} size={48} color="#fff" />
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '12px' }}>{mod.titulo}</h2>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <p style={{ color: 'var(--texto-secundario)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px', minHeight: '60px' }}>
                      {mod.descripcion?.substring(0, 120)}...
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--texto-terciario)', marginBottom: '16px' }}>
                      <FiClock size={14} /> {mod.duracion_estimada}
                      <span style={{ margin: '0 4px' }}>|</span>
                      {mod.total_contenidos || 0} secciones
                    </div>
                    {mod.progreso && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span className={`badge ${mod.progreso.completado ? 'badge-success' : mod.progreso.porcentaje_avance > 0 ? 'badge-warning' : 'badge-info'}`}>
                            {mod.progreso.completado ? 'Completado' : mod.progreso.porcentaje_avance > 0 ? 'En progreso' : 'Pendiente'}
                          </span>
                          <span style={{ color: 'var(--texto-terciario)' }}>{mod.progreso.porcentaje_avance}%</span>
                        </div>
                        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${mod.progreso.porcentaje_avance}%`, background: colores[i] }}></div></div>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '16px', color: colores[i], fontWeight: 600, fontSize: '0.9rem' }}>
                      {mod.progreso?.completado ? 'Revisar' : mod.progreso?.porcentaje_avance > 0 ? 'Continuar' : 'Comenzar'} <FiArrowRight style={{ marginLeft: '4px' }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModulosList;
