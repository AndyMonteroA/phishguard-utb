// ============================================================
// PhishGuard UTB - Rutas: Certificados
// ============================================================

const router = require('express').Router();
const {
  generarCertificado,
  descargarCertificado,
  verificarCertificado,
  obtenerMiCertificado,
} = require('../controllers/certificadoController');
const auth = require('../middlewares/auth');

router.post('/generar', auth, generarCertificado);
router.get('/descargar', auth, descargarCertificado);
router.get('/mi-certificado', auth, obtenerMiCertificado);
router.get('/verificar/:codigo', verificarCertificado); // Ruta pública

module.exports = router;
