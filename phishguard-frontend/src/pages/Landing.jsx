// ============================================================
// PhishGuard UTB - Pagina: Landing (Inicio)
// ============================================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiAward, FiBarChart2, FiBookOpen, FiCheckCircle, FiMail, FiUsers, FiPhone, FiHardDrive } from 'react-icons/fi';

const stats = [
  { valor: '95%', desc: 'de ciberataques inician por error humano', fuente: 'IBM, 2023' },
  { valor: '1.3M+', desc: 'sitios de phishing detectados en Q1 2023', fuente: 'APWG, 2023' },
  { valor: '74%', desc: 'de brechas involucran el factor humano', fuente: 'Verizon, 2023' },
  { valor: '554%', desc: 'aumento del vishing entre 2020-2023', fuente: 'Verizon, 2023' },
];

const modulos = [
  { icon: FiMail, titulo: 'Phishing', desc: 'Identifica correos y mensajes fraudulentos', color: '#E74C3C' },
  { icon: FiUsers, titulo: 'Pretexting', desc: 'Detecta historias falsas para manipularte', color: '#9B59B6' },
  { icon: FiPhone, titulo: 'Vishing', desc: 'Reconoce fraudes por llamadas telefonicas', color: '#3498DB' },
  { icon: FiHardDrive, titulo: 'Baiting', desc: 'Evita trampas con dispositivos y descargas', color: '#F39C12' },
];

const features = [
  { icon: <FiBookOpen />, titulo: 'Modulos Interactivos', desc: 'Contenido educativo con ejemplos reales y simulaciones de ataques' },
  { icon: <FiCheckCircle />, titulo: 'Quizzes con Retroalimentacion', desc: 'Evalua tus conocimientos con retroalimentacion inmediata' },
  { icon: <FiBarChart2 />, titulo: 'Seguimiento de Progreso', desc: 'Visualiza tu avance y areas de mejora en tiempo real' },
  { icon: <FiAward />, titulo: 'Certificacion Digital', desc: 'Obten un certificado al completar todos los modulos' },
];

const Landing = () => {
  return (
    <div>
      {/* HERO */}
      <section style={{
        background: 'var(--gradiente-hero)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(46,109,164,0.15) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', left: '10%',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(39,174,96,0.1) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(30px)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{
                  background: 'rgba(39, 174, 96, 0.15)', color: '#27AE60',
                  padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}>
                  <FiShield size={14} /> UTB — Proyecto Intradisciplinar 2026
                </span>
              </div>

              <h1 style={{ color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.1, marginBottom: '24px' }}>
                Aprende a <span style={{ color: '#5BA4E6' }}>protegerte</span> de la{' '}
                <span style={{ color: '#F39C12' }}>Ingenieria Social</span>
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>
                Plataforma educativa interactiva para estudiantes de Sistemas de Informacion de la
                Universidad Tecnica de Babahoyo. Domina las tecnicas de defensa contra phishing,
                pretexting, vishing y baiting.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/registro" className="btn btn-primary btn-lg" style={{ background: '#27AE60', boxShadow: '0 4px 20px rgba(39,174,96,0.4)' }}>
                  Comenzar Ahora — Es Gratis
                </Link>
                <Link to="/login" className="btn btn-lg" style={{ color: '#fff', border: '2px solid rgba(255,255,255,0.3)' }}>
                  Ya tengo cuenta
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '220px', height: '220px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(46,109,164,0.3) 0%, rgba(39,174,96,0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'float 3s ease-in-out infinite',
              }}>
                <FiShield size={100} color="rgba(255,255,255,0.85)" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ESTADISTICAS */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '12px' }}>La amenaza es <span className="text-gradient">real</span></h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              La Ingenieria Social es la principal amenaza de ciberseguridad a nivel mundial
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }} className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--azul-institucional)', marginBottom: '8px' }}>{stat.valor}</div>
                <p style={{ color: 'var(--texto-secundario)', fontSize: '0.92rem', marginBottom: '8px' }}>{stat.desc}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--texto-terciario)' }}>{stat.fuente}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULOS */}
      <section style={{ background: 'var(--gris-claro)', padding: '80px 0' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '12px' }}>4 Modulos de <span className="text-gradient">Aprendizaje</span></h2>
            <p style={{ color: 'var(--texto-terciario)', fontSize: '1.05rem' }}>
              Contenido educativo interactivo basado en las principales tecnicas de Ingenieria Social
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {modulos.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} className="card"
                  style={{ textAlign: 'center', padding: '36px 24px', cursor: 'pointer', borderTop: `4px solid ${mod.color}` }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: `${mod.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Icon size={32} color={mod.color} />
                  </div>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>{mod.titulo}</h3>
                  <p style={{ color: 'var(--texto-terciario)', fontSize: '0.92rem' }}>{mod.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CARACTERISTICAS */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '12px' }}>Por que <span className="text-gradient">PhishGuard UTB</span>?</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {features.map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} className="card" style={{ padding: '32px 24px' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: 'var(--radio-md)',
                  background: 'var(--azul-light)', color: 'var(--azul-institucional)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '16px',
                }}>
                  {feat.icon}
                </div>
                <h4 style={{ marginBottom: '8px' }}>{feat.titulo}</h4>
                <p style={{ color: 'var(--texto-terciario)', fontSize: '0.9rem' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gradiente-azul)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              Listo para protegerte de la Ingenieria Social?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
              Unete a PhishGuard UTB y fortalece tus conocimientos en ciberseguridad.
              100% gratuito para estudiantes de la UTB.
            </p>
            <Link to="/registro" className="btn btn-lg" style={{
              background: '#fff', color: 'var(--azul-institucional)', fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              Crear Cuenta Gratuita
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
