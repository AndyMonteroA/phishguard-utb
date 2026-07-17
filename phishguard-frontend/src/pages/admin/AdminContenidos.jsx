// ============================================================
// PhishGuard UTB - Admin: Gestion de Contenidos
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiTrash2, FiArrowLeft, FiBookOpen, FiZap, FiAlertTriangle, FiBold, FiItalic, FiUnderline, FiList, FiMail, FiMessageSquare, FiYoutube, FiImage, FiFileText } from 'react-icons/fi';

const AdminContenidos = () => {
  const { moduloId } = useParams();
  const [contenidos, setContenidos] = useState([]);
  const [modulo, setModulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ titulo: '', tipo: 'texto', contenido: '', orden: 1 });
  const textareaRef = useRef(null);

  useEffect(() => { cargar(); }, [moduloId]);

  const cargar = async () => {
    try {
      const [contRes, modRes] = await Promise.all([
        api.get(`/contenidos/${moduloId}`),
        api.get(`/modulos/${moduloId}`).catch(() => null),
      ]);
      setContenidos(contRes.data.data.contenidos);
      if (modRes) setModulo(modRes.data.data.modulo);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/contenidos/${editando}`, form);
        toast.success('Contenido actualizado');
      } else {
        await api.post(`/contenidos/${moduloId}`, form);
        toast.success('Contenido creado');
      }
      setEditando(null);
      setForm({ titulo: '', tipo: 'texto', contenido: '', orden: contenidos.length + 2 });
      cargar();
    } catch (err) { toast.error('Error al guardar'); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Eliminar este contenido?')) return;
    try { await api.delete(`/contenidos/${id}`); toast.success('Eliminado'); cargar(); }
    catch (err) { toast.error('Error'); }
  };

  const iniciarEdicion = (c) => {
    setEditando(c.id);
    setForm({ titulo: c.titulo, tipo: c.tipo, contenido: c.contenido, orden: c.orden });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Funcion para insertar formato en la posicion del cursor
  const insertarFormato = (inicioTag, finTag = '') => {
    const txt = textareaRef.current;
    if (!txt) return;

    const start = txt.selectionStart;
    const end = txt.selectionEnd;
    const textVal = form.contenido;
    const selected = textVal.substring(start, end);
    
    // Si no hay seleccion, usamos un marcador de posicion
    const replacement = inicioTag + (selected || 'texto') + finTag;
    
    const nuevoContenido = textVal.substring(0, start) + replacement + textVal.substring(end);
    setForm({ ...form, contenido: nuevoContenido });

    // Devolver el foco e insertar cursor
    setTimeout(() => {
      txt.focus();
      txt.setSelectionRange(start + inicioTag.length, start + inicioTag.length + (selected || 'texto').length);
    }, 50);
  };

  const tipoIcono = { 
    texto: <FiBookOpen size={14} />, 
    ejemplo_interactivo: <FiZap size={14} />, 
    caso_real: <FiAlertTriangle size={14} /> 
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/admin/modulos" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--texto-terciario)', fontSize: '0.9rem', marginBottom: '20px' }}>
          <FiArrowLeft /> Volver a Modulos
        </Link>
        <h1 style={{ marginBottom: '8px' }}>Contenidos: {modulo?.titulo || `Modulo ${moduloId}`}</h1>
        <p style={{ color: 'var(--texto-terciario)', marginBottom: '32px' }}>{contenidos.length} secciones de contenido</p>

        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>{editando ? 'Editar Contenido' : 'Agregar Contenido'}</h3>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Titulo</label>
                <input type="text" className="form-input" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}>
                  <option value="texto">Lectura</option>
                  <option value="ejemplo_interactivo">Ejemplo Interactivo</option>
                  <option value="caso_real">Caso Real</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input type="number" className="form-input" min="1" value={form.orden} onChange={(e) => setForm({...form, orden: parseInt(e.target.value)})} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Contenido Educativo</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', fontWeight: 400 }}>Puedes dar formato usando la barra de abajo</span>
              </label>
              
              {/* Barra de herramientas para formato enriquecido */}
              <div style={{ 
                display: 'flex', gap: '6px', background: 'var(--gris-claro)', 
                padding: '8px 12px', border: '1px solid var(--border)', 
                borderBottom: 'none', borderRadius: '8px 8px 0 0', flexWrap: 'wrap'
              }}>
                <button type="button" onClick={() => insertarFormato('**', '**')} className="btn btn-sm btn-secondary" title="Negrita" style={{ padding: '6px 10px' }}><FiBold /></button>
                <button type="button" onClick={() => insertarFormato('*', '*')} className="btn btn-sm btn-secondary" title="Cursiva" style={{ padding: '6px 10px' }}><FiItalic /></button>
                <button type="button" onClick={() => insertarFormato('<u>', '</u>')} className="btn btn-sm btn-secondary" title="Subrayado" style={{ padding: '6px 10px' }}><FiUnderline /></button>
                <button type="button" onClick={() => insertarFormato('\n- ')} className="btn btn-sm btn-secondary" title="Lista" style={{ padding: '6px 10px' }}><FiList /></button>
                
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
                
                <button type="button" onClick={() => insertarFormato('De: remitente@falso.com\nPara: victima@utb.edu.ec\nAsunto: URGENTE: Cambia tu clave\n\nEste es el cuerpo del correo falso...')} className="btn btn-sm btn-secondary" title="Simular Correo de Phishing" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiMail /> Email</button>
                <button type="button" onClick={() => insertarFormato('Remitente: BANCO UTB\nMensaje: Tu cuenta ha sido bloqueada. Ingresa aqui para reactivarla: http://enlace.com')} className="btn btn-sm btn-secondary" title="Simular SMS de texto" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiMessageSquare /> SMS</button>
                
                <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
                
                <button type="button" onClick={() => insertarFormato('[video](', ')')} className="btn btn-sm btn-secondary" title="Insertar Video de YouTube" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiYoutube /> Video</button>
                <button type="button" onClick={() => insertarFormato('[imagen](', ')')} className="btn btn-sm btn-secondary" title="Insertar Imagen URL" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiImage /> Imagen</button>
                <button type="button" onClick={() => insertarFormato('[pdf](', ')')} className="btn btn-sm btn-secondary" title="Insertar Enlace PDF" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiFileText /> PDF</button>
              </div>

              <textarea 
                ref={textareaRef}
                className="form-input" 
                rows={12} 
                value={form.contenido} 
                onChange={(e) => setForm({...form, contenido: e.target.value})} 
                required
                placeholder="Escribe el contenido educativo aqui..." 
                style={{ 
                  fontFamily: 'inherit', 
                  lineHeight: 1.6, 
                  borderRadius: '0 0 8px 8px',
                  borderTop: 'none'
                }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary"><FiPlus /> {editando ? 'Actualizar' : 'Agregar'}</button>
              {editando && <button type="button" onClick={() => { setEditando(null); setForm({ titulo: '', tipo: 'texto', contenido: '', orden: contenidos.length + 1 }); }} className="btn btn-secondary">Cancelar</button>}
            </div>
          </form>
        </div>

        {contenidos.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card" style={{ padding: '20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--azul-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--azul-institucional)' }}>{c.orden}</span>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>{c.titulo}</h4>
                  <span className={`badge ${c.tipo === 'ejemplo_interactivo' ? 'badge-warning' : c.tipo === 'caso_real' ? 'badge-danger' : 'badge-info'}`} style={{ marginTop: '4px' }}>
                    {tipoIcono[c.tipo]} {c.tipo === 'ejemplo_interactivo' ? 'Ejemplo' : c.tipo === 'caso_real' ? 'Caso Real' : 'Lectura'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => iniciarEdicion(c)} className="btn btn-sm btn-secondary"><FiEdit3 /></button>
                <button onClick={() => eliminar(c.id)} className="btn btn-sm" style={{ background: 'rgba(231,76,60,0.1)', color: '#E74C3C', border: 'none' }}><FiTrash2 /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminContenidos;
