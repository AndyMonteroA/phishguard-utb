// ============================================================
// PhishGuard UTB - Admin: Gestion de Contenidos (Visual Rich Toolbar & File Uploader)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit3, FiTrash2, FiArrowLeft, FiBookOpen, FiZap, 
  FiAlertTriangle, FiBold, FiItalic, FiUnderline, FiList, 
  FiMail, FiMessageSquare, FiYoutube, FiImage, FiFileText, FiUpload, FiEye, FiSearch 
} from 'react-icons/fi';

const AdminContenidos = () => {
  const { moduloId } = useParams();
  const [contenidos, setContenidos] = useState([]);
  const [modulo, setModulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ titulo: '', tipo: 'texto', contenido: '', orden: 1 });
  const [subiendo, setSubiendo] = useState(false);
  
  // Referencias
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileTypeRef = useRef('imagen'); // imagen o pdf

  useEffect(() => { cargar(); }, [moduloId]);

  const cargar = async () => {
    try {
      const [contRes, modRes] = await Promise.all([
        api.get(`/contenidos/${moduloId}`),
        api.get(`/modulos/${moduloId}`).catch(() => null),
      ]);
      const contData = contRes.data.data.contenidos;
      // Ordenar por defecto en el listado del admin para consistencia
      contData.sort((a, b) => a.orden - b.orden);
      setContenidos(contData);
      if (modRes) setModulo(modRes.data.data.modulo);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.contenido.trim()) {
      toast.error('El contenido educativo es obligatorio');
      return;
    }
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
    if (!window.confirm('¿Eliminar este contenido?')) return;
    try { await api.delete(`/contenidos/${id}`); toast.success('Eliminado'); cargar(); }
    catch (err) { toast.error('Error'); }
  };

  const iniciarEdicion = (c) => {
    setEditando(c.id);
    setForm({ titulo: c.titulo, tipo: c.tipo, contenido: c.contenido, orden: c.orden });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Insertar tags de formato enriquecido
  const insertarFormato = (inicioTag, finTag = '') => {
    const txt = textareaRef.current;
    if (!txt) return;

    const start = txt.selectionStart;
    const end = txt.selectionEnd;
    const textVal = form.contenido;
    const selected = textVal.substring(start, end);
    
    const replacement = inicioTag + (selected || 'texto') + finTag;
    const nuevoContenido = textVal.substring(0, start) + replacement + textVal.substring(end);
    
    setForm({ ...form, contenido: nuevoContenido });

    setTimeout(() => {
      txt.focus();
      txt.setSelectionRange(start + inicioTag.length, start + inicioTag.length + (selected || 'texto').length);
    }, 50);
  };

  // Manejar click de subida (abre selector de archivos)
  const abrirSubidor = (tipo) => {
    fileTypeRef.current = tipo;
    fileInputRef.current.click();
  };

  // Subir archivo al backend
  const handleSubidaArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('archivo', file);
    setSubiendo(true);

    try {
      const res = await api.post('/admin/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = res.data.url;
      // Insertar el tag correspondiente
      if (fileTypeRef.current === 'imagen') {
        insertarFormato(`[imagen](${fileUrl})`, '');
      } else {
        insertarFormato(`[pdf](${fileUrl})`, '');
      }
      toast.success('Archivo subido e insertado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setSubiendo(false);
      e.target.value = ''; // Limpiar input
    }
  };

  // Renderizar la previsualización en tiempo real (Live Preview)
  const renderLivePreview = () => {
    const text = form.contenido;
    if (!text) return <p style={{ color: 'var(--texto-terciario)', fontStyle: 'italic' }}>Escribe contenido para ver la previsualización...</p>;

    // Parsear Markdown simple para la vista previa
    const parsePreview = (txtLine) => {
      // Videos, PDFs, Imagenes
      if (txtLine.includes('[video](')) {
        return <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', background: '#f8fafc', color: 'var(--azul-institucional)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FiYoutube /> [Reproductor de Video YouTube Embebido]</div>;
      }
      if (txtLine.includes('[pdf](')) {
        return <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', background: '#fff', color: '#E74C3C', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FiFileText /> [Tarjeta de Descarga de PDF]</div>;
      }
      if (txtLine.includes('[imagen](')) {
        return <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', background: '#f8fafc', color: '#27AE60', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FiImage /> [Imagen Ilustrativa Cargada]</div>;
      }

      // Reemplazo inline para vista previa
      let parsed = txtLine
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: var(--azul-institucional)">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="font-style: italic">$1</em>')
        .replace(/<u>(.*?)<\/u>/g, '<u style="text-decoration: underline">$1</u>');

      // Emojis a SVGs
      const warningSvg = '<span class="icon-svg-wrapper warning-svg" style="display: inline-flex; align-items: center; color: #E67E22; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>';
      const emailSvg = '<span class="icon-svg-wrapper email-svg" style="display: inline-flex; align-items: center; color: #2E6DA4; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span>';
      const searchSvg = '<span class="icon-svg-wrapper search-svg" style="display: inline-flex; align-items: center; color: #27AE60; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>';
      const chatSvg = '<span class="icon-svg-wrapper chat-svg" style="display: inline-flex; align-items: center; color: #9B59B6; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>';

      parsed = parsed
        .replace(/⚠️/g, warningSvg)
        .replace(/📧/g, emailSvg)
        .replace(/🔍/g, searchSvg)
        .replace(/💬/g, chatSvg);

      if (txtLine.trim().startsWith('- ')) {
        return <ul style={{ paddingLeft: '20px', listStyleType: 'disc', margin: 0 }}><li dangerouslySetInnerHTML={{ __html: parsed.substring(2) }} /></ul>;
      }

      return <p style={{ marginBottom: '14px', color: 'var(--texto-secundario)' }} dangerouslySetInnerHTML={{ __html: parsed }} />;
    };

    // 1. Separar las Señales de Alerta
    let textoModulo = text;
    let textoAlertas = "";
    
    const alertasIndex = text.search(/SEÑALES DE ALERTA|Señales de alerta|Señales de Alerta/i);
    if (alertasIndex !== -1) {
      const preText = text.substring(0, alertasIndex);
      const postText = text.substring(alertasIndex);
      
      const lineasPre = preText.split('\n');
      while (lineasPre.length > 0 && (
        lineasPre[lineasPre.length - 1].trim() === '---' ||
        lineasPre[lineasPre.length - 1].trim() === ''
      )) {
        lineasPre.pop();
      }
      textoModulo = lineasPre.join('\n');
      textoAlertas = postText;
    }

    const lineas = textoModulo.split('\n');
    const esEmail = lineas.some(l => {
      const clean = l.replace(/\*/g, '').toLowerCase().trim();
      return clean.startsWith('de:') || clean.startsWith('asunto:');
    });

    const esSMS = lineas.some(l => {
      const clean = l.replace(/\*/g, '').toLowerCase().trim();
      return clean.startsWith('remitente:') || clean.startsWith('sms:');
    });

    let elementoSimulado = null;

    if (esEmail) {
      let de = 'remitente.sospechoso@seguridad-utb.com';
      let para = 'estudiante@utb.edu.ec';
      let asunto = 'URGENTE: Actualizacion de credenciales';
      let cuerpo = [];

      lineas.forEach(l => {
        const clean = l.replace(/\*/g, '').trim();
        const lower = clean.toLowerCase();
        
        if (lower.startsWith('de:')) {
          de = clean.substring(3).trim();
        } else if (lower.startsWith('para:')) {
          para = clean.substring(5).trim();
        } else if (lower.startsWith('asunto:')) {
          asunto = clean.substring(7).trim();
        } else if (
          l.trim() !== '' && 
          !lower.includes('ejemplo de correo') && 
          !clean.startsWith('---') &&
          !clean.startsWith('📧')
        ) {
          cuerpo.push(l);
        }
      });

      elementoSimulado = (
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', background: '#F8FAFC', overflow: 'hidden', textAlign: 'left', boxShadow: 'var(--sombra-md)' }} className="simulador-correo">
          <div style={{ background: '#E2E8F0', padding: '12px 20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-terciario)', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ marginLeft: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulador de Correo Seguro</span>
          </div>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#fff', fontSize: '0.88rem' }}>
            <div style={{ marginBottom: '8px' }}><strong>De:</strong> <span style={{ color: '#E74C3C', fontWeight: 600 }}>{de}</span></div>
            <div style={{ marginBottom: '8px' }}><strong>Para:</strong> <span>{para}</span></div>
            <div><strong>Asunto:</strong> <span style={{ fontWeight: 700, color: 'var(--azul-institucional)' }}>{asunto}</span></div>
          </div>
          <div style={{ padding: '24px 20px', background: '#fff', fontSize: '0.98rem', minHeight: '150px', lineHeight: 1.7 }}>
            {cuerpo.map((p, idx) => <div key={idx}>{parsePreview(p)}</div>)}
          </div>
        </div>
      );
    } else if (esSMS) {
      let remitente = 'Banco UTB';
      let mensaje = '';
      let cuerpo = [];
      
      lineas.forEach(l => {
        const clean = l.replace(/\*/g, '').trim();
        const lower = clean.toLowerCase();

        if (lower.startsWith('remitente:')) {
          remitente = clean.substring(10).trim();
        } else if (lower.startsWith('mensaje:')) {
          mensaje = clean.substring(8).trim();
          cuerpo.push(mensaje);
        } else if (
          l.trim() !== '' && 
          !lower.includes('ejemplo de sms') && 
          !clean.startsWith('---') &&
          !clean.startsWith('💬')
        ) {
          cuerpo.push(l);
        }
      });

      elementoSimulado = (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: '#000', borderRadius: '36px', padding: '14px 10px', boxShadow: 'var(--sombra-lg)', border: '4px solid #333' }}>
            <div style={{ width: '110px', height: '18px', background: '#333', margin: '0 auto 12px auto', borderRadius: '10px' }} />
            <div style={{ background: '#1C1C1E', borderRadius: '24px', padding: '16px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', color: '#fff', fontSize: '0.85rem', marginBottom: '20px', borderBottom: '1px solid #2C2C2E', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{remitente}</div>
                <span style={{ color: '#8E8E93', fontSize: '0.75rem' }}>SMS de texto hoy</span>
              </div>
              <div style={{ background: '#262629', color: '#fff', padding: '12px 16px', borderRadius: '18px', alignSelf: 'flex-start', maxWidth: '85%', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {cuerpo.map((p, idx) => <div key={idx}>{parsePreview(p)}</div>)}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      elementoSimulado = (
        <div style={{ textAlign: 'left', lineHeight: 1.8, fontSize: '1.02rem', color: 'var(--texto-principal)' }}>
          {lineas.map((linea, idx) => <div key={idx}>{parsePreview(linea)}</div>)}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {elementoSimulado}
        
        {textoAlertas && (
          <div style={{ 
            background: 'var(--azul-light)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--sombra-sm)',
            textAlign: 'left'
          }}>
            {textoAlertas.split('\n').map((linea, idx) => {
              if (linea.trim() === '') return <br key={idx} />;
              return (
                <div key={idx} style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {parsePreview(linea)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
        
        {/* Input de tipo file oculto para Multer */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleSubidaArchivo}
          accept={fileTypeRef.current === 'imagen' ? 'image/*' : 'application/pdf'}
        />

        <Link to="/admin/modulos" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--texto-terciario)', fontSize: '0.9rem', marginBottom: '20px' }}>
          <FiArrowLeft /> Volver a Modulos
        </Link>
        <h1 style={{ marginBottom: '8px' }}>Contenidos: {modulo?.titulo || `Modulo ${moduloId}`}</h1>
        <p style={{ color: 'var(--texto-terciario)', marginBottom: '32px' }}>{contenidos.length} secciones de contenido</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start', marginBottom: '32px' }}>
          
          {/* Formulario de Contenido */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '16px' }}>{editando ? 'Editar Contenido' : 'Agregar Contenido'}</h3>
            <form onSubmit={guardar}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Titulo</label>
                  <input type="text" className="form-input" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required style={{ borderRadius: '8px', padding: '10px 14px', border: '1.5px solid #cbd5e1' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})} style={{ borderRadius: '8px', padding: '10px 14px', border: '1.5px solid #cbd5e1' }}>
                    <option value="texto">Lectura</option>
                    <option value="ejemplo_interactivo">Ejemplo Interactivo</option>
                    <option value="caso_real">Caso Real</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Orden</label>
                  <input type="number" className="form-input" min="1" value={form.orden} onChange={(e) => setForm({...form, orden: parseInt(e.target.value)})} style={{ borderRadius: '8px', padding: '10px 14px', border: '1.5px solid #cbd5e1' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Contenido Educativo</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', fontWeight: 400 }}>Edición enriquecida</span>
                </label>
                
                {/* Barra de herramientas para formato enriquecido */}
                <div style={{ 
                  display: 'flex', gap: '6px', background: '#F8FAFC', 
                  padding: '8px 12px', border: '1.5px solid #cbd5e1', 
                  borderBottom: 'none', borderRadius: '8px 8px 0 0', flexWrap: 'wrap'
                }}>
                  <button type="button" onClick={() => insertarFormato('**', '**')} className="btn btn-sm btn-secondary" title="Negrita" style={{ padding: '6px 10px' }}><FiBold /></button>
                  <button type="button" onClick={() => insertarFormato('*', '*')} className="btn btn-sm btn-secondary" title="Cursiva" style={{ padding: '6px 10px' }}><FiItalic /></button>
                  <button type="button" onClick={() => insertarFormato('<u>', '</u>')} className="btn btn-sm btn-secondary" title="Subrayado" style={{ padding: '6px 10px' }}><FiUnderline /></button>
                  <button type="button" onClick={() => insertarFormato('\n- ')} className="btn btn-sm btn-secondary" title="Lista" style={{ padding: '6px 10px' }}><FiList /></button>
                  
                  <div style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }} />
                  
                  <button type="button" onClick={() => insertarFormato('⚠️ ')} className="btn btn-sm btn-secondary" title="Insertar Icono Alerta" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiAlertTriangle /> + Alerta</button>
                  <button type="button" onClick={() => insertarFormato('📧 ')} className="btn btn-sm btn-secondary" title="Insertar Icono Correo" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiMail /> + Correo</button>
                  <button type="button" onClick={() => insertarFormato('🔍 ')} className="btn btn-sm btn-secondary" title="Insertar Icono Lupa" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiSearch /> + Lupa</button>
                  <button type="button" onClick={() => insertarFormato('💬 ')} className="btn btn-sm btn-secondary" title="Insertar Icono Mensaje" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiMessageSquare /> + SMS</button>
                  
                  <div style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }} />
                  
                  <button type="button" onClick={() => insertarFormato('De: remitente.falso@bancario-seguro.com\nPara: estudiante.utb@utb.edu.ec\nAsunto: ⚠️ URGENTE: Bloqueo de cuenta\n\nEstimado usuario, se ha detectado un acceso no autorizado. Para evitar el bloqueo definitivo, verifique sus datos aqui: **http://enlace-phishing-utb.com**\n\n---\n\n🔍 SEÑALES DE ALERTA:\n- El remitente no es el dominio oficial.\n- Hay errores ortograficos y urgencia.')} className="btn btn-sm btn-secondary" title="Simular Correo de Phishing" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiMail /> Email</button>
                  <button type="button" onClick={() => insertarFormato('Remitente: SOPORTE UTB\nMensaje: Tu clave caduca hoy. Actualiza ahora ingresando a este enlace: http://utb-acceso-seguro.info')} className="btn btn-sm btn-secondary" title="Simular SMS de texto" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiMessageSquare /> SMS</button>
                  
                  <div style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }} />
                  
                  <button type="button" onClick={() => {
                    const url = prompt('Ingrese URL de YouTube:');
                    if (url) insertarFormato(`[video](${url})`, '');
                  }} className="btn btn-sm btn-secondary" title="Insertar Video de YouTube" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}><FiYoutube /> Video</button>
                  
                  <button type="button" onClick={() => abrirSubidor('imagen')} className="btn btn-sm btn-secondary" title="Subir Imagen desde PC" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}>
                    <FiImage /> {subiendo && fileTypeRef.current === 'imagen' ? '...' : '+ Imagen'}
                  </button>
                  
                  <button type="button" onClick={() => abrirSubidor('pdf')} className="btn btn-sm btn-secondary" title="Subir PDF desde PC" style={{ display: 'inline-flex', gap: '4px', padding: '6px 10px', fontSize: '0.8rem' }}>
                    <FiFileText /> {subiendo && fileTypeRef.current === 'pdf' ? '...' : '+ PDF'}
                  </button>
                </div>

                <textarea 
                  ref={textareaRef}
                  className="form-input" 
                  rows={14} 
                  value={form.contenido} 
                  onChange={(e) => setForm({...form, contenido: e.target.value})} 
                  required
                  placeholder="Escribe el contenido educativo aqui. Usa la barra para simular correos, SMS o subir PDFs e imágenes..." 
                  style={{ 
                    fontFamily: 'inherit', 
                    lineHeight: 1.6, 
                    borderRadius: '0 0 8px 8px',
                    borderTop: 'none',
                    border: '1.5px solid #cbd5e1'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" disabled={subiendo}><FiPlus /> {editando ? 'Actualizar' : 'Agregar'}</button>
                {editando && <button type="button" onClick={() => { setEditando(null); setForm({ titulo: '', tipo: 'texto', contenido: '', orden: contenidos.length + 1 }); }} className="btn btn-secondary">Cancelar</button>}
              </div>
            </form>
          </div>

          {/* Tarjeta de Previsualización en Tiempo Real (Live Preview) */}
          <div className="card" style={{ padding: '28px', borderTop: '4px solid var(--azul-claro)', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem' }}>
              <FiEye /> Vista Previa del Estudiante
            </h3>
            <div style={{ 
              background: '#F8FAFC', padding: '20px', borderRadius: '12px', 
              border: '1px solid var(--border)', minHeight: '300px', maxHeight: '500px', overflowY: 'auto' 
            }}>
              {renderLivePreview()}
            </div>
          </div>
        </div>

        {/* Listado de Contenidos Existentes */}
        <h3 style={{ marginBottom: '16px' }}>Listado de Secciones</h3>
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
