// ============================================================
// PhishGuard UTB - Componente: Comentarios por Módulo (Foro)
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiSend, FiTrash2, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ComentariosModulo = ({ moduloId }) => {
  const { usuario } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarComentarios = async () => {
      try {
        const res = await api.get(`/comentarios/modulos/${moduloId}`);
        setComentarios(res.data.data || []);
      } catch (error) {
        console.error('Error al cargar comentarios', error);
      } finally {
        setCargando(false);
      }
    };
    if (moduloId) cargarComentarios();
  }, [moduloId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setEnviando(true);
    try {
      const res = await api.post(`/comentarios/modulos/${moduloId}`, {
        contenido: nuevoComentario
      });
      setComentarios([res.data.data, ...comentarios]);
      setNuevoComentario('');
      toast.success('Comentario agregado');
    } catch (error) {
      toast.error('Error al agregar comentario');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este comentario?')) return;
    
    try {
      await api.delete(`/comentarios/${id}`);
      setComentarios(comentarios.filter(c => c.id !== id));
      toast.success('Comentario eliminado');
    } catch (error) {
      toast.error('Error al eliminar comentario');
    }
  };

  const formatearFecha = (fechaStr) => {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaStr).toLocaleDateString('es-EC', opciones);
  };

  return (
    <div className="card" style={{ padding: '28px', marginTop: '32px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <FiMessageSquare size={20} color="var(--azul-institucional)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Foro del Módulo</h3>
        <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{comentarios.length} comentarios</span>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--azul-institucional)', 
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <FiUser size={18} />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              className="form-input"
              style={{ width: '100%', minHeight: '80px', padding: '12px', resize: 'vertical' }}
              placeholder="Comparte tus dudas, experiencias o consejos sobre este tema..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              disabled={enviando}
            ></textarea>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm" 
              style={{ position: 'absolute', bottom: '12px', right: '12px', padding: '6px 12px' }}
              disabled={!nuevoComentario.trim() || enviando}
            >
              {enviando ? 'Enviando...' : <><FiSend /> Enviar</>}
            </button>
          </div>
        </div>
      </form>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--texto-terciario)' }}>Cargando comentarios...</div>
      ) : comentarios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', background: 'var(--gris-claro)', borderRadius: 'var(--radio-md)', color: 'var(--texto-terciario)' }}>
          <FiMessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No hay comentarios aún. ¡Sé el primero en participar!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {comentarios.map((comentario) => (
              <motion.div 
                key={comentario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ 
                  display: 'flex', gap: '12px', padding: '16px', background: 'var(--gris-claro)', 
                  borderRadius: 'var(--radio-md)', border: '1px solid var(--border)' 
                }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: comentario.usuario?.rol === 'admin' ? '#E74C3C' : 'var(--azul-light)', 
                  color: comentario.usuario?.rol === 'admin' ? '#fff' : 'var(--azul-institucional)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FiUser size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{comentario.usuario?.nombre || 'Usuario Desconocido'}</span>
                      {comentario.usuario?.rol === 'admin' && (
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Profesor</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>{formatearFecha(comentario.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--texto-secundario)', whiteSpace: 'pre-wrap' }}>
                    {comentario.contenido}
                  </p>
                </div>
                
                {(usuario?.id === comentario.usuario_id || usuario?.rol === 'admin') && (
                  <button 
                    onClick={() => handleEliminar(comentario.id)}
                    style={{ 
                      background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', 
                      padding: '4px', opacity: 0.6, transition: 'opacity 0.2s', alignSelf: 'flex-start'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    title="Eliminar comentario"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ComentariosModulo;
