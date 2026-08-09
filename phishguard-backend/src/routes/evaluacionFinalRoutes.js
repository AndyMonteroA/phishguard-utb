// ============================================================
// PhishGuard UTB - Rutas: Evaluación Final
// ============================================================

const router = require('express').Router();
const { obtenerEvaluacionFinal, enviarEvaluacionFinal } = require('../controllers/evaluacionFinalController');
const auth = require('../middlewares/auth');

router.get('/', auth, obtenerEvaluacionFinal);
router.post('/submit', auth, enviarEvaluacionFinal);

module.exports = router;
