// ============================================================
// PhishGuard UTB - Rutas: Quiz
// ============================================================

const router = require('express').Router();
const { obtenerPreguntas, enviarRespuestas, obtenerResultados } = require('../controllers/quizController');
const auth = require('../middlewares/auth');
const { validarQuiz } = require('../middlewares/validator');

router.get('/:moduloId', auth, obtenerPreguntas);
router.post('/:moduloId/submit', auth, validarQuiz, enviarRespuestas);
router.get('/:moduloId/resultados', auth, obtenerResultados);

module.exports = router;
