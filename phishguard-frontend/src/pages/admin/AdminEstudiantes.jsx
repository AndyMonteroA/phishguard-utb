// ============================================================
// PhishGuard UTB - Admin: Gestion de Estudiantes
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUsers, FiSearch, FiToggleLeft, FiToggleRight, FiUser, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdminEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

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

  const filtrados = estudiantes.filter(e =>
    `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}><FiUsers size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Gestion de Estudiantes</h1>
          <p style={{ color: 'var(--texto-terciario)' }}>{estudiantes.length} estudiantes registrados</p>
        </motion.div>

        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiSearch size={18} color="var(--texto-terciario)" />
            <input type="text" className="form-input" placeholder="Buscar por nombre, apellido o email..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              style={{ border: 'none', boxShadow: 'none', padding: '8px 0' }} />
          </div>
        </div>

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
                    <button onClick={() => toggleActivo(est.id)} className="btn btn-sm btn-secondary" style={{ gap: '4px' }}>
                      {est.activo ? <><FiToggleRight /> Desactivar</> : <><FiToggleLeft /> Activar</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--texto-terciario)' }}>No se encontraron estudiantes</p>}
      </div>
    </div>
  );
};

export default AdminEstudiantes;
