// ============================================================
// PhishGuard UTB - Admin: Gestion de Estudiantes (Mejorado)
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUsers, FiSearch, FiToggleLeft, FiToggleRight, FiUser, FiCheckCircle, FiXCircle,
  FiFilter, FiEye, FiX, FiBarChart2, FiClock, FiAward, FiBookOpen, FiDownload } from 'react-icons/fi';

const AdminEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('todos');
  const [filtroGenero, setFiltroGenero] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [detalleEstudiante, setDetalleEstudiante] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { const res = await api.get('/admin/estudiantes'); setEstudiantes(res.data.data.estudiantes); }
    catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const toggleActivo = async (id) => {
    try { await api.put(`/admin/usuarios/${id}/toggle`); toast.success('Estado actualizado'); cargar(); }
    catch (err) { toast.error('Error al actualizar'); }
  };

  const verDetalle = async (est) => {
    setCargandoDetalle(true);
    setDetalleEstudiante({ ...est, progreso: null });
    try {
      const res = await api.get(`/admin/estudiantes/${est.id}/detalle`);
      setDetalleEstudiante({ ...est, ...res.data.data });
    } catch (err) {
      // Si el endpoint no existe aún, mostramos lo que tenemos
      setDetalleEstudiante({ ...est });
    }
    finally { setCargandoDetalle(false); }
  };

  // Obtener valores únicos para filtros
  const semestres = [...new Set(estudiantes.map(e => e.semestre).filter(Boolean))].sort((a, b) => a - b);
  const generos = [...new Set(estudiantes.map(e => e.genero).filter(Boolean))];

  const filtrados = estudiantes.filter(e => {
    const matchBusqueda = `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchSemestre = filtroSemestre === 'todos' || e.semestre === parseInt(filtroSemestre);
    const matchGenero = filtroGenero === 'todos' || e.genero === filtroGenero;
    const matchEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && e.activo) ||
      (filtroEstado === 'inactivo' && !e.activo) ||
      (filtroEstado === 'encuesta_si' && e.encuesta_completada) ||
      (filtroEstado === 'encuesta_no' && !e.encuesta_completada);
    return matchBusqueda && matchSemestre && matchGenero && matchEstado;
  });

  const hayFiltros = filtroSemestre !== 'todos' || filtroGenero !== 'todos' || filtroEstado !== 'todos';

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}><FiUsers size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Gestión de Estudiantes</h1>
            <p style={{ color: 'var(--texto-terciario)' }}>
              {estudiantes.length} registrados • {filtrados.length} mostrados
              {hayFiltros && <span style={{ color: 'var(--azul-institucional)', fontWeight: 600 }}> (filtrado)</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--gris-claro)', padding: '6px 8px', borderRadius: 'var(--radio-md)', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 600, color: '#27AE60' }}>{estudiantes.filter(e => e.activo).length} activos</span>
              <span style={{ color: 'var(--texto-terciario)' }}>•</span>
              <span style={{ fontWeight: 600, color: '#E74C3C' }}>{estudiantes.filter(e => !e.activo).length} inactivos</span>
            </div>
          </div>
        </motion.div>

        {/* Barra de búsqueda y filtros */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <FiSearch size={18} color="var(--texto-terciario)" />
            <input type="text" className="form-input" placeholder="Buscar por nombre, apellido o email..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              style={{ border: 'none', boxShadow: 'none', padding: '8px 0', flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <FiFilter size={14} color="var(--texto-terciario)" />
            <select value={filtroSemestre} onChange={e => setFiltroSemestre(e.target.value)}
              className="form-input" style={{ padding: '6px 10px', fontSize: '0.82rem', minWidth: 120 }}>
              <option value="todos">Semestre: Todos</option>
              {semestres.map(s => <option key={s} value={s}>Semestre {s}</option>)}
            </select>
            <select value={filtroGenero} onChange={e => setFiltroGenero(e.target.value)}
              className="form-input" style={{ padding: '6px 10px', fontSize: '0.82rem', minWidth: 120 }}>
              <option value="todos">Género: Todos</option>
              {generos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="form-input" style={{ padding: '6px 10px', fontSize: '0.82rem', minWidth: 140 }}>
              <option value="todos">Estado: Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="encuesta_si">Encuesta completada</option>
              <option value="encuesta_no">Sin encuesta</option>
            </select>
            {hayFiltros && (
              <button onClick={() => { setFiltroSemestre('todos'); setFiltroGenero('todos'); setFiltroEstado('todos'); }}
                className="btn btn-sm btn-secondary" style={{ gap: '4px', fontSize: '0.78rem' }}>
                <FiX size={12} /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--blanco)', borderRadius: 'var(--radio-lg)', overflow: 'hidden', boxShadow: 'var(--sombra-md)' }}>
            <thead>
              <tr style={{ background: 'var(--azul-institucional)', color: '#fff' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Estudiante</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Semestre</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Encuesta</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((est, i) => (
                <tr key={est.id} style={{ borderBottom: '1px solid var(--gris-medio)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gris-claro)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiUser size={16} color="var(--azul-institucional)" />
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{est.nombre} {est.apellido}</span>
                        {est.genero && <div style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>{est.genero}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.88rem', color: 'var(--texto-secundario)' }}>{est.email}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.88rem' }}>{est.semestre || '-'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {est.encuesta_completada ? <FiCheckCircle color="#27AE60" /> : <FiXCircle color="#ccc" />}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span className={`badge ${est.activo ? 'badge-success' : 'badge-danger'}`}>
                      {est.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => verDetalle(est)} className="btn btn-sm btn-primary" style={{ gap: '4px', padding: '6px 10px' }}>
                        <FiEye size={13} /> Ver
                      </button>
                      <button onClick={() => toggleActivo(est.id)} className="btn btn-sm btn-secondary" style={{ gap: '4px', padding: '6px 10px' }}>
                        {est.activo ? <><FiToggleRight size={13} /> Desactivar</> : <><FiToggleLeft size={13} /> Activar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--texto-terciario)' }}>No se encontraron estudiantes</p>}

        {/* Modal Detalle Estudiante */}
        <AnimatePresence>
          {detalleEstudiante && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
              onClick={() => setDetalleEstudiante(null)}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: 'var(--blanco)', borderRadius: 'var(--radio-lg)', maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '32px', boxShadow: 'var(--sombra-lg)' }}
                onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.3rem' }}>Perfil del Estudiante</h2>
                  <button onClick={() => setDetalleEstudiante(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <FiX size={20} color="var(--texto-terciario)" />
                  </button>
                </div>

                {/* Info personal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--gris-claro)', borderRadius: 'var(--radio-md)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUser size={24} color="var(--azul-institucional)" />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{detalleEstudiante.nombre} {detalleEstudiante.apellido}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--texto-terciario)', margin: 0 }}>{detalleEstudiante.email}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {detalleEstudiante.semestre && <span className="badge badge-default">Semestre {detalleEstudiante.semestre}</span>}
                      {detalleEstudiante.genero && <span className="badge badge-default">{detalleEstudiante.genero}</span>}
                      <span className={`badge ${detalleEstudiante.activo ? 'badge-success' : 'badge-danger'}`}>
                        {detalleEstudiante.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center', padding: '14px', background: 'var(--gris-claro)', borderRadius: 'var(--radio-md)' }}>
                    <FiCheckCircle size={18} color="#27AE60" style={{ marginBottom: 4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{detalleEstudiante.encuesta_completada ? 'Sí' : 'No'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>Encuesta</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '14px', background: 'var(--gris-claro)', borderRadius: 'var(--radio-md)' }}>
                    <FiBookOpen size={18} color="#2E6DA4" style={{ marginBottom: 4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{detalleEstudiante.modulos_completados ?? '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>Módulos</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '14px', background: 'var(--gris-claro)', borderRadius: 'var(--radio-md)' }}>
                    <FiBarChart2 size={18} color="#F39C12" style={{ marginBottom: 4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{detalleEstudiante.promedio ?? '—'}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>Promedio</div>
                  </div>
                </div>

                {/* Resultados de quizzes */}
                {detalleEstudiante.resultados && detalleEstudiante.resultados.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiAward size={16} color="var(--azul-institucional)" /> Historial de Quizzes
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--gris-medio)' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Módulo</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Nota</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Estado</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Tiempo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleEstudiante.resultados.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--gris-medio)' }}>
                            <td style={{ padding: '8px' }}>{r.modulo}</td>
                            <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: r.aprobado ? '#27AE60' : '#E74C3C' }}>
                              {r.porcentaje}%
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <span className={`badge ${r.aprobado ? 'badge-success' : 'badge-danger'}`}>
                                {r.aprobado ? 'Aprobado' : 'Reprobado'}
                              </span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center', color: 'var(--texto-terciario)' }}>
                              {r.tiempo ? `${Math.floor(r.tiempo / 60)}m ${r.tiempo % 60}s` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {cargandoDetalle && (
                  <div style={{ textAlign: 'center', padding: '20px' }}><div className="spinner"></div></div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                  <button onClick={() => toggleActivo(detalleEstudiante.id)} className="btn btn-sm btn-secondary" style={{ gap: '4px' }}>
                    {detalleEstudiante.activo ? <><FiToggleRight /> Desactivar</> : <><FiToggleLeft /> Activar</>}
                  </button>
                  <button onClick={() => setDetalleEstudiante(null)} className="btn btn-sm btn-primary">Cerrar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminEstudiantes;
