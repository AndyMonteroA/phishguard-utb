// ============================================================
// PhishGuard UTB - Componente: NotificacionDropdown
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiBell, FiCheck, FiCheckCircle, FiAward, FiEdit3, FiBookOpen } from 'react-icons/fi';

const tipoIcono = {
  logro: <FiAward size={16} color="#F39C12" />,
  quiz: <FiEdit3 size={16} color="#27AE60" />,
  modulo: <FiBookOpen size={16} color="#3498DB" />,
  sistema: <FiCheckCircle size={16} color="#1B3A6B" />,
};

const NotificacionDropdown = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const cargar = async () => {
    try {
      const res = await api.get('/notificaciones');
      setNotificaciones(res.data.data.notificaciones);
      setNoLeidas(res.data.data.no_leidas);
    } catch (err) { /* silencioso */ }
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const marcarLeida = async (id, enlace) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      cargar();
      if (enlace) navigate(enlace);
      setAbierto(false);
    } catch (err) { /* silencioso */ }
  };

  const marcarTodas = async () => {
    try {
      await api.put('/notificaciones/leer-todas');
      cargar();
    } catch (err) { /* silencioso */ }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '6px', color: 'var(--texto-secundario)',
        }}
      >
        <FiBell size={20} />
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute', top: '0', right: '0',
            width: '18px', height: '18px', borderRadius: '50%',
            background: 'var(--rojo-alerta)', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div style={{
          position: 'absolute', top: '100%', right: '0', marginTop: '8px',
          width: '340px', maxHeight: '400px', overflowY: 'auto',
          background: 'var(--blanco)', borderRadius: 'var(--radio-lg)',
          boxShadow: 'var(--sombra-xl)', border: '1px solid var(--gris-medio)',
          zIndex: 1000,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--gris-medio)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={marcarTodas}
                style={{ background: 'none', border: 'none', color: 'var(--azul-claro)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                <FiCheck size={12} /> Marcar todas
              </button>
            )}
          </div>

          {notificaciones.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--texto-terciario)', fontSize: '0.88rem' }}>
              No tienes notificaciones
            </div>
          ) : (
            notificaciones.slice(0, 10).map((notif) => (
              <div
                key={notif.id}
                onClick={() => marcarLeida(notif.id, notif.enlace)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: '1px solid var(--gris-medio)',
                  background: notif.leida ? 'transparent' : 'rgba(46, 109, 164, 0.04)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gris-claro)'}
                onMouseLeave={(e) => e.currentTarget.style.background = notif.leida ? 'transparent' : 'rgba(46, 109, 164, 0.04)'}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px' }}>{tipoIcono[notif.tipo] || tipoIcono.sistema}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: notif.leida ? 400 : 600, fontSize: '0.85rem', marginBottom: '2px' }}>
                      {notif.titulo}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--texto-terciario)', lineHeight: 1.4 }}>
                      {notif.mensaje}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--texto-terciario)' }}>
                      {new Date(notif.created_at).toLocaleDateString('es-EC')}
                    </span>
                  </div>
                  {!notif.leida && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--azul-claro)', marginTop: '6px', flexShrink: 0 }}></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacionDropdown;
