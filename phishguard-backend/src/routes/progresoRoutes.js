// ============================================================
// PhishGuard UTB - Rutas: Progreso
// ============================================================

const router = require('express').Router();
const { obtenerProgreso, marcarContenidoVisto, obtenerHistorial } = require('../controllers/progresoController');
const auth = require('../middlewares/auth');

router.get('/', auth, obtenerProgreso);
router.get('/historial', auth, obtenerHistorial);
router.post('/:moduloId/contenido/:contenidoId', auth, marcarContenidoVisto);

module.exports = router;
