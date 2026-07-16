// ============================================================
// PhishGuard UTB - Rutas: Logros
// ============================================================

const router = require('express').Router();
const { obtenerLogros } = require('../controllers/logroController');
const auth = require('../middlewares/auth');

router.get('/', auth, obtenerLogros);

module.exports = router;
