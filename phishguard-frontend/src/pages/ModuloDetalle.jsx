// ============================================================
// PhishGuard UTB - Pagina: Detalle del Modulo
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiEdit3, FiBookOpen, FiAlertTriangle, FiZap, FiFileText, FiDownload, FiPlay } from 'react-icons/fi';
import { DynamicIcon } from '../components/IconMap';

const ModuloDetalle = () => {
  const { id } = useParams();
  const [modulo, setModulo] = useState(null);
  const [contenidoActual, setContenidoActual] = useState(0);
  const [maxIndexVisitado, setMaxIndexVisitado] = useState(0); // Rastrear el slide maximo visitado
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get(`/modulos/${id}`);
        const modData = res.data.data.modulo;

        // Ordenar contenidos ascendentemente por su número de orden
        if (modData.contenidos) {
          modData.contenidos.sort((a, b) => a.orden - b.orden);
        }
        
        setModulo(modData);

        // Si el estudiante ya tiene un progreso guardado y un ultimo contenido visitado
        if (modData.progreso?.ultimo_contenido_id && modData.contenidos) {
          const idx = modData.contenidos.findIndex(c => c.id === modData.progreso.ultimo_contenido_id);
          if (idx !== -1) {
            setContenidoActual(idx);
            setMaxIndexVisitado(idx); // Guardar que ya llego hasta este slide
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const marcarVisto = async (contenidoId) => {
    try {
      await api.post(`/progreso/${id}/contenido/${contenidoId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const siguiente = () => {
    if (modulo?.contenidos && contenidoActual < modulo.contenidos.length - 1) {
      const sigIndex = contenidoActual + 1;
      setContenidoActual(sigIndex);
      
      // Solo guardar en base de datos si el nuevo indice es mayor al maximo alcanzado
      if (sigIndex > maxIndexVisitado) {
        setMaxIndexVisitado(sigIndex);
        const sigId = modulo.contenidos[sigIndex].id;
        marcarVisto(sigId); // Guardar en DB el nuevo maximo alcanzado
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const anterior = () => {
    if (contenidoActual > 0) {
      const antIndex = contenidoActual - 1;
      setContenidoActual(antIndex);
      // NO modificamos maxIndexVisitado ni marcamos en DB al ir hacia atras
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;
  if (!modulo) return <div className="page-wrapper"><div className="container"><h2>Modulo no encontrado</h2></div></div>;

  const contenido = modulo.contenidos?.[contenidoActual];
  const esUltimo = contenidoActual === (modulo.contenidos?.length || 0) - 1;

  const tipoIcono = { ejemplo_interactivo: <FiZap size={14} />, caso_real: <FiAlertTriangle size={14} />, texto: <FiBookOpen size={14} /> };
  const tipoTexto = { ejemplo_interactivo: 'Ejemplo Interactivo', caso_real: 'Caso Real', texto: 'Lectura' };

  // Parseador de formato avanzado (soporta negritas, cursivas, subrayados, listas, videos, imagenes y PDFs)
  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // 1. Detectar videos [video](url)
    const regexVideo = /\[video\]\((.*?)\)/g;
    let matchVideo = regexVideo.exec(text);
    if (matchVideo) {
      const url = matchVideo[1];
      // Intentar extraer ID de YouTube
      let videoId = '';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        }
      }
      return (
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          {videoId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--sombra-md)' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
              <FiPlay /> Ver Video Instructivo
            </a>
          )}
        </div>
      );
    }

    // 2. Detectar PDFs [pdf](url)
    const regexPdf = /\[pdf\]\((.*?)\)/g;
    let matchPdf = regexPdf.exec(text);
    if (matchPdf) {
      const url = matchPdf[1];
      const nombreArchivo = url.substring(url.lastIndexOf('/') + 1) || 'documento_soporte.pdf';
      return (
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          background: 'var(--bg-light)', padding: '16px 20px', borderRadius: '12px',
          border: '1px solid var(--border)', marginTop: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(231,76,60,0.1)', color: '#E74C3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FiFileText />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{nombreArchivo}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)' }}>Documento PDF Instructivo</span>
            </div>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary" style={{ gap: '6px' }}>
            <FiDownload /> Descargar PDF
          </a>
        </div>
      );
    }

    // 3. Detectar imagenes [imagen](url)
    const regexImg = /\[imagen\]\((.*?)\)/g;
    let matchImg = regexImg.exec(text);
    if (matchImg) {
      const url = matchImg[1];
      return (
        <div style={{ marginTop: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <img src={url} alt="Recurso educativo" style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: 'var(--sombra-md)', border: '1px solid var(--border)' }} />
        </div>
      );
    }

    // 4. Formatear Negrita, Cursiva, Subrayado y elementos de lista en linea
    let segment = text;

    // Remplazar listas completas de linea
    if (segment.trim().startsWith('- ')) {
      return (
        <ul style={{ paddingLeft: '20px', marginBottom: '12px', listStyleType: 'disc' }}>
          <li style={{ color: 'var(--texto-secundario)' }}>
            {parseMarkdown(segment.trim().substring(2))}
          </li>
        </ul>
      );
    }

    // Remplazar formatos basicos en linea (Negrita, Cursiva, Subrayado)
    const regexBold = /\*\*(.*?)\*\*/g;
    const regexItalic = /\*(.*?)\*/g;
    const regexUnderline = /<u>(.*?)<\/u>/g;

    let parsedHtml = text
      .replace(regexBold, '<strong style="font-weight: 800; color: var(--azul-institucional)">$1</strong>')
      .replace(regexItalic, '<em style="font-style: italic">$1</em>')
      .replace(regexUnderline, '<u style="text-decoration: underline">$1</u>');

    // Reemplazar emojis nativos por SVGs vectoriales elegantes
    const warningSvg = '<span class="icon-svg-wrapper warning-svg" style="display: inline-flex; align-items: center; color: #E67E22; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>';
    const emailSvg = '<span class="icon-svg-wrapper email-svg" style="display: inline-flex; align-items: center; color: #2E6DA4; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span>';
    const searchSvg = '<span class="icon-svg-wrapper search-svg" style="display: inline-flex; align-items: center; color: #27AE60; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>';
    const chatSvg = '<span class="icon-svg-wrapper chat-svg" style="display: inline-flex; align-items: center; color: #9B59B6; margin-right: 4px; vertical-align: middle;"><svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>';

    parsedHtml = parsedHtml
      .replace(/⚠️/g, warningSvg)
      .replace(/📧/g, emailSvg)
      .replace(/🔍/g, searchSvg)
      .replace(/💬/g, chatSvg);

    return <span dangerouslySetInnerHTML={{ __html: parsedHtml }} />;
  };

  // Renderiza simulaciones de correos o SMS de forma interactiva y premium
  const renderContenidoEspecial = (tipo, titulo, texto) => {
    // 1. Separar las Señales de Alerta de la simulación del correo/SMS
    let textoModulo = texto;
    let textoAlertas = "";
    
    const alertasIndex = texto.search(/SEÑALES DE ALERTA|Señales de alerta|Señales de Alerta/i);
    if (alertasIndex !== -1) {
      const preText = texto.substring(0, alertasIndex);
      const postText = texto.substring(alertasIndex);
      
      // Limpiar el separador "---" que suele estar al final de preText
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
    
    // Validar si parece una plantilla de correo (tiene campos De/Para/Asunto, ignorando asteriscos de Markdown)
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
        <div style={{ marginTop: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: '#F8FAFC', overflow: 'hidden', boxShadow: 'var(--sombra-md)' }} className="simulador-correo">
          {/* Header del simulador de email */}
          <div style={{ background: '#E2E8F0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ marginLeft: '12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulador de Correo Seguro</span>
          </div>
          {/* Cabecera del correo */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.88rem' }}><strong style={{ color: 'var(--texto-terciario)' }}>De:</strong> <span style={{ color: '#E74C3C', fontWeight: 600 }}>{de}</span></div>
            <div style={{ marginBottom: '8px', fontSize: '0.88rem' }}><strong style={{ color: 'var(--texto-terciario)' }}>Para:</strong> <span style={{ color: 'var(--texto-principal)' }}>{para}</span></div>
            <div style={{ fontSize: '0.9rem' }}><strong style={{ color: 'var(--texto-terciario)' }}>Asunto:</strong> <span style={{ fontWeight: 700, color: 'var(--azul-institucional)' }}>{asunto}</span></div>
          </div>
          {/* Cuerpo del correo */}
          <div style={{ padding: '24px 20px', background: '#fff', fontSize: '0.98rem', minHeight: '150px', lineHeight: 1.7 }}>
            {cuerpo.map((parrafo, i) => (
              <p key={i} style={{ marginBottom: '14px', color: 'var(--texto-secundario)' }}>
                {parseMarkdown(parrafo)}
              </p>
            ))}
          </div>
        </div>
      );
    } else if (esSMS) {
      let remitente = 'Banco UTB';
      let mensaje = '';
      
      lineas.forEach(l => {
        const clean = l.replace(/\*/g, '').trim();
        const lower = clean.toLowerCase();

        if (lower.startsWith('remitente:')) {
          remitente = clean.substring(10).trim();
        } else if (lower.startsWith('mensaje:')) {
          mensaje = clean.substring(8).trim();
        } else if (
          l.trim() !== '' && 
          !lower.includes('ejemplo de sms') && 
          !clean.startsWith('---') &&
          !clean.startsWith('💬')
        ) {
          mensaje += (mensaje ? '\n' : '') + l;
        }
      });

      elementoSimulado = (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: '#000', borderRadius: '36px', padding: '14px 10px', boxShadow: 'var(--sombra-lg)', border: '4px solid #333' }}>
            <div style={{ width: '110px', height: '18px', background: '#333', margin: '0 auto 12px auto', borderRadius: '10px' }} />
            <div style={{ background: '#1C1C1E', borderRadius: '24px', padding: '16px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', color: '#fff', fontSize: '0.85rem', marginBottom: '20px', borderBottom: '1px solid #2C2C2E', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{remitente}</div>
                <span style={{ color: '#8E8E93', fontSize: '0.75rem' }}>SMS de texto hoy</span>
              </div>
              <div style={{ background: '#262629', color: '#fff', padding: '12px 16px', borderRadius: '18px', alignSelf: 'flex-start', maxWidth: '85%', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {parseMarkdown(mensaje)}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      elementoSimulado = (
        <div style={{ lineHeight: 1.8, fontSize: '1.02rem', color: 'var(--texto-principal)' }}>
          {lineas.map((parrafo, i) => {
            if (parrafo.trim() === '') return <br key={i} />;
            return <p key={i} style={{ marginBottom: '14px', color: 'var(--texto-secundario)' }}>{parseMarkdown(parrafo)}</p>;
          })}
        </div>
      );
    }

    // Retornar el elemento simulado + la caja de alertas externa (si aplica)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {elementoSimulado}
        
        {textoAlertas && (
          <div style={{ 
            background: 'var(--azul-light)', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--sombra-sm)'
          }}>
            {textoAlertas.split('\n').map((linea, idx) => {
              if (linea.trim() === '') return <br key={idx} />;
              return (
                <div key={idx} style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {parseMarkdown(linea)}
                </div>
              );
            })}
          </div>
        )}
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
            {renderContenidoEspecial(contenido.tipo, contenido.titulo, contenido.contenido)}
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
