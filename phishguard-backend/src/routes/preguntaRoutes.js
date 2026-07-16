// ============================================================
// PhishGuard UTB - Rutas: Preguntas (Admin CRUD)
// ============================================================

const router = require('express').Router();
const { listarPreguntas, obtenerPregunta, crearPregunta, actualizarPregunta, eliminarPregunta } = require('../controllers/preguntaController');
const auth = require('../middlewares/auth');
const autorizar = require('../middlewares/roles');

router.get('/:moduloId', auth, autorizar('admin'), listarPreguntas);
router.get('/detalle/:id', auth, autorizar('admin'), obtenerPregunta);
router.post('/:moduloId', auth, autorizar('admin'), crearPregunta);
router.put('/:id', auth, autorizar('admin'), actualizarPregunta);
router.delete('/:id', auth, autorizar('admin'), eliminarPregunta);

module.exports = router;
