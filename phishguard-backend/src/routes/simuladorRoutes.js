// ============================================================
// PhishGuard UTB - Rutas: Simulador de Phishing
// ============================================================

const router = require('express').Router();
const { obtenerSimulacion, enviarSimulacion } = require('../controllers/simuladorController');
const auth = require('../middlewares/auth');

router.get('/', auth, obtenerSimulacion);
router.post('/submit', auth, enviarSimulacion);

module.exports = router;
