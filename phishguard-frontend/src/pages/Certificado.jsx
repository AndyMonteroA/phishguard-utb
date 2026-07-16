// ============================================================
// PhishGuard UTB - Pagina: Certificado
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiAward, FiDownload, FiCheckCircle, FiBookOpen, FiLock } from 'react-icons/fi';

const Certificado = () => {
  const { usuario } = useAuth();
  const [certificado, setCertificado] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [certRes, progRes] = await Promise.all([api.get('/certificado').catch(() => null), api.get('/progreso')]);
        if (certRes?.data?.data?.certificado) setCertificado(certRes.data.data.certificado);
        setProgreso(progRes.data.data);
      } catch (err) { console.error(err); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const generar = async () => {
    setGenerando(true);
    try {
      const res = await api.post('/certificado/generar');
      setCertificado(res.data.data.certificado);
      toast.success('Certificado generado');
    } catch (err) { toast.error(err.response?.data?.message || 'Error al generar certificado'); }
    finally { setGenerando(false); }
  };

  const descargar = async () => {
    try {
      const res = await api.get(`/certificado/descargar/${certificado.codigo_verificacion}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `PhishGuard_UTB_Certificado_${usuario?.nombre}_${usuario?.apellido}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Certificado descargado');
    } catch (err) { toast.error('Error al descargar'); }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  const puedeGenerar = progreso?.progreso_general === 100;

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container-narrow" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {certificado ? (
            <div className="card" style={{ padding: '48px 36px', borderTop: '5px solid #F39C12' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(243,156,18,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FiAward size={44} color="#F39C12" />
              </div>
              <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Certificado Obtenido</h2>
              <p style={{ color: 'var(--texto-terciario)', marginBottom: '24px' }}>Completaste todos los modulos de PhishGuard UTB</p>

              <div style={{ background: 'var(--gris-claro)', borderRadius: 'var(--radio-lg)', padding: '32px', marginBottom: '24px', border: '2px solid var(--gris-medio)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#F39C12', color: '#fff', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                  CERTIFICADO DIGITAL
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--texto-terciario)', marginBottom: '12px' }}>Se certifica que</p>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--azul-institucional)', marginBottom: '12px' }}>
                  {usuario?.nombre} {usuario?.apellido}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--texto-secundario)', lineHeight: 1.6, marginBottom: '16px' }}>
                  Ha completado satisfactoriamente el programa de concientizacion sobre
                  Ingenieria Social de PhishGuard UTB.
                </p>
                <div style={{ borderTop: '1px solid var(--gris-medio)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--texto-terciario)' }}>
                  <span>Codigo: <strong>{certificado.codigo_verificacion}</strong></span>
                  <span>Fecha: {new Date(certificado.fecha_emision || certificado.created_at).toLocaleDateString('es-EC')}</span>
                </div>
              </div>

              <button onClick={descargar} className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
                <FiDownload size={20} /> Descargar PDF
              </button>
            </div>
          ) : puedeGenerar ? (
            <div className="card" style={{ padding: '48px 36px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(39,174,96,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FiCheckCircle size={40} color="#27AE60" />
              </div>
              <h2 style={{ marginBottom: '8px' }}>Felicidades!</h2>
              <p style={{ color: 'var(--texto-terciario)', marginBottom: '28px' }}>
                Has completado todos los modulos. Ya puedes generar tu certificado digital.
              </p>
              <button onClick={generar} className="btn btn-success btn-lg" disabled={generando} style={{ gap: '8px' }}>
                {generando ? <><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> Generando...</> : <><FiAward size={20} /> Generar Certificado</>}
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '48px 36px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FiLock size={40} color="var(--texto-terciario)" />
              </div>
              <h2 style={{ marginBottom: '8px' }}>Certificado Bloqueado</h2>
              <p style={{ color: 'var(--texto-terciario)', marginBottom: '20px' }}>
                Completa todos los modulos y aprueba los quizzes para obtener tu certificado.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--azul-institucional)', marginBottom: '16px' }}>
                {progreso?.progreso_general || 0}%
              </div>
              <div className="progress-bar-container" style={{ maxWidth: '300px', margin: '0 auto', height: '12px' }}>
                <div className="progress-bar-fill" style={{ width: `${progreso?.progreso_general || 0}%` }}></div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Certificado;
