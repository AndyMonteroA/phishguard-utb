// ============================================================
// PhishGuard UTB - Rutas: Notificaciones
// ============================================================

const router = require('express').Router();
const { obtenerNotificaciones, marcarLeida, marcarTodasLeidas } = require('../controllers/notificacionController');
const auth = require('../middlewares/auth');

router.get('/', auth, obtenerNotificaciones);
router.put('/:id/leer', auth, marcarLeida);
router.put('/leer-todas', auth, marcarTodasLeidas);

module.exports = router;
