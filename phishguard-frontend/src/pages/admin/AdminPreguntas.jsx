// ============================================================
// PhishGuard UTB - Admin: Gestion de Preguntas de Quiz
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiTrash2, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdminPreguntas = () => {
  const { moduloId } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [modulo, setModulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    pregunta: '',
    opciones: [
      { id: 'a', texto: '' },
      { id: 'b', texto: '' },
      { id: 'c', texto: '' },
      { id: 'd', texto: '' },
    ],
    respuesta_correcta: 'a',
    retroalimentacion: '',
    orden: 1,
  });

  useEffect(() => { cargar(); }, [moduloId]);

  const cargar = async () => {
    try {
      const [pregRes, modRes] = await Promise.all([
        api.get(`/preguntas/${moduloId}`),
        api.get(`/modulos/${moduloId}`).catch(() => null),
      ]);
      setPreguntas(pregRes.data.data.preguntas);
      if (modRes) setModulo(modRes.data.data.modulo);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const opcionesVacias = form.opciones.some(o => !o.texto.trim());
    if (opcionesVacias) { toast.error('Todas las opciones deben tener texto'); return; }
    try {
      if (editando) {
        await api.put(`/preguntas/${editando}`, form);
        toast.success('Pregunta actualizada');
      } else {
        await api.post(`/preguntas/${moduloId}`, form);
        toast.success('Pregunta creada');
      }
      resetForm();
      cargar();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Eliminar esta pregunta?')) return;
    try { await api.delete(`/preguntas/${id}`); toast.success('Eliminada'); cargar(); }
    catch (err) { toast.error('Error'); }
  };

  const iniciarEdicion = (p) => {
    setEditando(p.id);
    setForm({
      pregunta: p.pregunta,
      opciones: p.opciones || [{ id: 'a', texto: '' }, { id: 'b', texto: '' }, { id: 'c', texto: '' }, { id: 'd', texto: '' }],
      respuesta_correcta: p.respuesta_correcta,
      retroalimentacion: p.retroalimentacion || '',
      orden: p.orden,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditando(null);
    setForm({
      pregunta: '', opciones: [{ id: 'a', texto: '' }, { id: 'b', texto: '' }, { id: 'c', texto: '' }, { id: 'd', texto: '' }],
      respuesta_correcta: 'a', retroalimentacion: '', orden: preguntas.length + 1,
    });
  };

  const updateOpcion = (index, texto) => {
    const nuevas = [...form.opciones];
    nuevas[index] = { ...nuevas[index], texto };
    setForm({ ...form, opciones: nuevas });
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/admin/modulos" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--texto-terciario)', fontSize: '0.9rem', marginBottom: '20px' }}>
          <FiArrowLeft /> Volver a Modulos
        </Link>
        <h1 style={{ marginBottom: '8px' }}>Preguntas: {modulo?.titulo || `Modulo ${moduloId}`}</h1>
        <p style={{ color: 'var(--texto-terciario)', marginBottom: '32px' }}>{preguntas.length} preguntas configuradas</p>

        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px' }}>{editando ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}</h3>
          <form onSubmit={guardar}>
            <div className="form-group">
              <label className="form-label">Pregunta</label>
              <textarea className="form-input" rows={3} value={form.pregunta} onChange={(e) => setForm({...form, pregunta: e.target.value})} required
                placeholder="Escribe la pregunta del quiz..." />
            </div>

            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              Opciones de Respuesta — Selecciona la correcta
            </label>
            {form.opciones.map((op, i) => (
              <div key={op.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <button type="button" onClick={() => setForm({...form, respuesta_correcta: op.id})}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    border: `3px solid ${form.respuesta_correcta === op.id ? '#27AE60' : 'var(--gris-medio)'}`,
                    background: form.respuesta_correcta === op.id ? 'rgba(39,174,96,0.12)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', color: form.respuesta_correcta === op.id ? '#27AE60' : 'var(--texto-terciario)',
                  }}>
                  {form.respuesta_correcta === op.id ? <FiCheckCircle color="#27AE60" /> : op.id.toUpperCase()}
                </button>
                <input type="text" className="form-input" value={op.texto}
                  onChange={(e) => updateOpcion(i, e.target.value)} required
                  placeholder={`Opcion ${op.id.toUpperCase()}`}
                  style={{ flex: 1, borderColor: form.respuesta_correcta === op.id ? '#27AE60' : undefined }} />
                {form.respuesta_correcta === op.id && (
                  <span className="badge badge-success" style={{ flexShrink: 0 }}>Correcta</span>
                )}
              </div>
            ))}

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Retroalimentacion (se muestra al terminar el quiz)</label>
              <textarea className="form-input" rows={2} value={form.retroalimentacion}
                onChange={(e) => setForm({...form, retroalimentacion: e.target.value})}
                placeholder="Explicacion de por que esta respuesta es correcta..." />
            </div>

            <div className="form-group" style={{ maxWidth: '120px' }}>
              <label className="form-label">Orden</label>
              <input type="number" className="form-input" min="1" value={form.orden} onChange={(e) => setForm({...form, orden: parseInt(e.target.value)})} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary"><FiPlus /> {editando ? 'Actualizar' : 'Crear Pregunta'}</button>
              {editando && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>}
            </div>
          </form>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Preguntas Existentes</h2>
        {preguntas.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="card" style={{ padding: '20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--azul-institucional)' }}>{p.orden}</span>
                  <h4 style={{ fontSize: '0.95rem', flex: 1 }}>{p.pregunta}</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginLeft: '36px' }}>
                  {p.opciones?.map(op => (
                    <span key={op.id} style={{
                      padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem',
                      background: p.respuesta_correcta === op.id ? 'rgba(39,174,96,0.12)' : 'var(--gris-claro)',
                      color: p.respuesta_correcta === op.id ? '#27AE60' : 'var(--texto-secundario)',
                      fontWeight: p.respuesta_correcta === op.id ? 600 : 400,
                      border: p.respuesta_correcta === op.id ? '1px solid rgba(39,174,96,0.3)' : '1px solid transparent',
                    }}>
                      {p.respuesta_correcta === op.id && <FiCheckCircle size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                      {op.id.toUpperCase()}) {op.texto?.substring(0, 40)}{op.texto?.length > 40 ? '...' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                <button onClick={() => iniciarEdicion(p)} className="btn btn-sm btn-secondary"><FiEdit3 /></button>
                <button onClick={() => eliminar(p.id)} className="btn btn-sm" style={{ background: 'rgba(231,76,60,0.1)', color: '#E74C3C', border: 'none' }}><FiTrash2 /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminPreguntas;
