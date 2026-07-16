// ============================================================
// PhishGuard UTB - Rutas: Encuesta Diagnóstica
// ============================================================

const router = require('express').Router();
const { obtenerEncuesta, enviarEncuesta } = require('../controllers/encuestaController');
const auth = require('../middlewares/auth');
const { validarEncuesta } = require('../middlewares/validator');

router.get('/', auth, obtenerEncuesta);
router.post('/', auth, validarEncuesta, enviarEncuesta);

module.exports = router;
