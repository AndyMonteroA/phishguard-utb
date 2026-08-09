// ============================================================
// PhishGuard UTB - Pagina: Certificado
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiAward, FiDownload, FiCheckCircle, FiBookOpen, FiLock, FiShield } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Certificado = () => {
  const { usuario } = useAuth();
  const [certificado, setCertificado] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const certificadoRef = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [certRes, progRes] = await Promise.all([api.get('/certificado/mi-certificado').catch(() => null), api.get('/progreso')]);
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
    if (!certificadoRef.current) return;
    
    try {
      toast.loading('Generando PDF...', { id: 'pdf' });
      
      const canvas = await html2canvas(certificadoRef.current, {
        scale: 3, // Alta calidad
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PhishGuard_UTB_Certificado_${usuario?.nombre}_${usuario?.apellido}.pdf`);
      
      toast.success('Certificado descargado con éxito', { id: 'pdf' });
    } catch (err) { 
      console.error(err);
      toast.error('Error al generar el PDF', { id: 'pdf' }); 
    }
  };

  if (cargando) return <div className="page-wrapper"><div className="loading-screen"><div className="spinner"></div></div></div>;

  const puedeGenerar = progreso?.progreso_general === 100;

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container-narrow" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {certificado ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              
              {/* Contenedor del Certificado a Exportar */}
              <div 
                ref={certificadoRef}
                style={{
                  width: '900px', // Tamaño fijo para que html2canvas siempre lo capture igual
                  height: '636px', // Proporción A4 apaisado
                  background: 'white',
                  position: 'relative',
                  padding: '40px',
                  boxSizing: 'border-box',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {/* Bordes decorativos */}
                <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '3px solid #1B3A6B' }}></div>
                <div style={{ position: 'absolute', top: '22px', left: '22px', right: '22px', bottom: '22px', border: '1px solid #1B3A6B' }}></div>
                
                {/* Esquinas decorativas */}
                <div style={{ position: 'absolute', top: '0', left: '0', width: '100px', height: '100px', background: 'linear-gradient(135deg, #27AE60 50%, transparent 50%)' }}></div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '100px', height: '100px', background: 'linear-gradient(-45deg, #1B3A6B 50%, transparent 50%)' }}></div>

                {/* Contenido Central */}
                <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, position: 'relative' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <FiAward size={48} color="#F39C12" />
                    <h1 style={{ fontSize: '2.5rem', color: '#1B3A6B', margin: 0, fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '2px' }}>Certificado de Aprobación</h1>
                    <FiAward size={48} color="#F39C12" />
                  </div>

                  <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
                    La plataforma educativa PhishGuard UTB certifica que
                  </p>

                  <h2 style={{ fontSize: '3rem', color: '#27AE60', marginBottom: '20px', fontFamily: 'Georgia, serif', borderBottom: '2px solid #27AE60', display: 'inline-block', paddingBottom: '10px' }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </h2>

                  <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                    Ha completado satisfactoriamente el programa de entrenamiento, demostrando habilidades destacadas en la detección y prevención de amenazas de <strong>Ingeniería Social y Phishing</strong>.
                  </p>

                  {/* Firmas y sellos */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', padding: '0 40px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #333', width: '200px', margin: '0 auto 10px', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '1.8rem', color: '#1B3A6B' }}>Admin PhishGuard</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Instructor UTB</p>
                    </div>

                    <div style={{ textAlign: 'center', background: 'rgba(243, 156, 18, 0.1)', padding: '15px', borderRadius: '50%', border: '2px dashed #F39C12', width: '120px', height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <FiShield size={32} color="#F39C12" style={{ marginBottom: '5px' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#F39C12' }}>APROBADO</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #333', width: '200px', margin: '0 auto 10px', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.1rem', color: '#333' }}>{new Date(certificado.fecha_emision || certificado.created_at).toLocaleDateString('es-EC')}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Fecha de Emisión</p>
                    </div>
                  </div>

                  {/* ID Verificación */}
                  <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', fontSize: '0.75rem', color: '#999' }}>
                    Código de Verificación: {certificado.codigo_verificacion}
                  </div>
                </div>
              </div>

              {/* Controles */}
              <button onClick={descargar} className="btn btn-primary btn-lg" style={{ gap: '8px', padding: '16px 32px', fontSize: '1.1rem', borderRadius: '50px', boxShadow: '0 10px 20px rgba(27,58,107,0.2)' }}>
                <FiDownload size={24} /> Descargar Certificado (PDF)
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
