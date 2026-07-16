// ============================================================
// PhishGuard UTB - Rutas: Contenidos (Admin CRUD)
// ============================================================

const router = require('express').Router();
const { listarContenidos, crearContenido, actualizarContenido, eliminarContenido } = require('../controllers/contenidoController');
const auth = require('../middlewares/auth');
const autorizar = require('../middlewares/roles');

router.get('/:moduloId', auth, autorizar('admin'), listarContenidos);
router.post('/:moduloId', auth, autorizar('admin'), crearContenido);
router.put('/:id', auth, autorizar('admin'), actualizarContenido);
router.delete('/:id', auth, autorizar('admin'), eliminarContenido);

module.exports = router;
