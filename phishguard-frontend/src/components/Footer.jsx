// ============================================================
// PhishGuard UTB - Componente: Footer
// ============================================================

import { Link } from 'react-router-dom';
import { FiShield, FiMail, FiUsers, FiPhone, FiHardDrive } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiShield size={20} /> PhishGuard UTB
            </h3>
            <p>
              Plataforma de concientizacion sobre Ingenieria Social para la comunidad estudiantil
              de la Universidad Tecnica de Babahoyo.
            </p>
          </div>

          <div className="footer-section">
            <h3>Modulos</h3>
            <p><Link to="/modulos" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMail size={14} /> Phishing</Link></p>
            <p><Link to="/modulos" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiUsers size={14} /> Pretexting</Link></p>
            <p><Link to="/modulos" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone size={14} /> Vishing</Link></p>
            <p><Link to="/modulos" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiHardDrive size={14} /> Baiting</Link></p>
          </div>

          <div className="footer-section">
            <h3>Informacion</h3>
            <p>Universidad Tecnica de Babahoyo</p>
            <p>Facultad de Administracion, Finanzas e Informatica</p>
            <p>Carrera de Sistemas de Informacion</p>
            <p>Babahoyo - Los Rios - Ecuador</p>
          </div>

          <div className="footer-section">
            <h3>Proyecto</h3>
            <p>Proyecto Intradisciplinar de Grado</p>
            <p>6to Semestre - Periodo 2026</p>
            <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
              Linea: Sistemas de Informacion y Comunicacion, Emprendimiento e Innovacion
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 PhishGuard UTB - Todos los derechos reservados</p>
          <p style={{ marginTop: '4px' }}>Desarrollado como parte del Proyecto Intradisciplinar de Grado - UTB FAFI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
