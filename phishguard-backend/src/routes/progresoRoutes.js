// ============================================================
// PhishGuard UTB - Rutas: Progreso
// ============================================================

const router = require('express').Router();
const { obtenerProgreso, marcarContenidoVisto } = require('../controllers/progresoController');
const auth = require('../middlewares/auth');

router.get('/', auth, obtenerProgreso);
router.post('/:moduloId/contenido/:contenidoId', auth, marcarContenidoVisto);

module.exports = router;
