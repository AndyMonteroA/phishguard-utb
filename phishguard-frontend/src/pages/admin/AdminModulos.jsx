// ============================================================
// PhishGuard UTB - Admin: Gestion de Modulos
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiBookOpen, FiSettings, FiArrowRight } from 'react-icons/fi';
import { DynamicIcon } from '../../components/IconMap';

const colores = ['#E74C3C', '#9B59B6', '#3498DB', '#F39C12', '#1B3A6B', '#27AE60'];

const AdminModulos = () => {
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', icono: 'FiBookOpen', color: '#1B3A6B', duracion_estimada: '30 minutos' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { const res = await api.get('/modulos'); setModulos(res.data.data.modulos); }
    catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/modulos/${editando}`, form);
        toast.success('Modulo actualizado');
      } else {
        await api.post('/modulos', { ...form, orden: modulos.length + 1 });
        toast.success('Modulo creado');
      }
      setEditando(null);
      setForm({ titulo: '', descripcion: '', icono: 'FiBookOpen', color: '#1B3A6B', duracion_estimada: '30 minutos' });
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const iniciarEdicion = (mod) => {
    setEditando(mod.id);
    setForm({ titulo: mod.titulo, descripcion: mod.descripcion, icono: mod.icono, color: mod.color, duracion_estimada: mod.duracion_estimada });
  };

  const cancelar = () => {
    setEditando(null);
    setForm({ titulo: '', descripcion: '', icono: 'FiBookOpen', color: '#1B3A6B', duracion_estimada: '30 minutos' });
  };

  const iconOpciones = ['FiMail', 'FiUsers', 'FiPhone', 'FiHardDrive', 'FiShield', 'FiGlobe', 'FiAlertTriangle', 'FiSearch', 'FiTarget', 'FiBookOpen', 'FiZap'];

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}><FiSettings size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Gestion de Modulos</h1>
          <p style={{ color: 'var(--texto-terciario)' }}>Crea, edita y administra los modulos de aprendizaje</p>
        </motion.div>

        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>{editando ? 'Editar Modulo' : 'Crear Nuevo Modulo'}</h3>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Titulo</label>
                <input type="text" className="form-input" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required placeholder="Ej: Phishing" />
              </div>
              <div className="form-group">
                <label className="form-label">Duracion Estimada</label>
                <input type="text" className="form-input" value={form.duracion_estimada} onChange={(e) => setForm({...form, duracion_estimada: e.target.value})} placeholder="Ej: 30 minutos" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripcion</label>
              <textarea className="form-input" rows={3} value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} required placeholder="Descripcion del modulo..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Icono</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {iconOpciones.map(ic => (
                    <button type="button" key={ic} onClick={() => setForm({...form, icono: ic})}
                      style={{ padding: '8px', borderRadius: 'var(--radio-sm)', border: `2px solid ${form.icono === ic ? form.color : 'var(--gris-medio)'}`, background: form.icono === ic ? `${form.color}15` : 'transparent', cursor: 'pointer' }}>
                      <DynamicIcon name={ic} size={20} color={form.icono === ic ? form.color : '#999'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colores.map(c => (
                    <button type="button" key={c} onClick={() => setForm({...form, color: c})}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? '#333' : 'transparent'}`, cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary"><FiPlus /> {editando ? 'Actualizar' : 'Crear Modulo'}</button>
              {editando && <button type="button" onClick={cancelar} className="btn btn-secondary">Cancelar</button>}
            </div>
          </form>
        </div>

        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Modulos Existentes ({modulos.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {modulos.map((mod, i) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card" style={{ padding: '24px', borderTop: `4px solid ${mod.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radio-md)', background: `${mod.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DynamicIcon name={mod.icono} size={24} color={mod.color} />
                </div>
                <div>
                  <h3>{mod.titulo}</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>{mod.duracion_estimada}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--texto-terciario)', marginBottom: '16px', lineHeight: 1.5 }}>{mod.descripcion?.substring(0, 100)}...</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => iniciarEdicion(mod)} className="btn btn-sm btn-secondary"><FiEdit3 /> Editar</button>
                <Link to={`/admin/contenidos/${mod.id}`} className="btn btn-sm btn-primary"><FiBookOpen /> Contenidos</Link>
                <Link to={`/admin/preguntas/${mod.id}`} className="btn btn-sm btn-primary"><FiEdit3 /> Preguntas</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminModulos;
