// ============================================================
// PhishGuard UTB - Rutas: Módulos
// ============================================================

const router = require('express').Router();
const { listarModulos, obtenerModulo, crearModulo, actualizarModulo } = require('../controllers/moduloController');
const auth = require('../middlewares/auth');
const autorizar = require('../middlewares/roles');

// Rutas públicas (pero con auth opcional para progreso)
router.get('/', (req, res, next) => {
  // Auth opcional: intenta verificar token pero no falla si no hay
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
}, listarModulos);

router.get('/:id', (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
}, obtenerModulo);

// Rutas admin
router.post('/', auth, autorizar('admin'), crearModulo);
router.put('/:id', auth, autorizar('admin'), actualizarModulo);

module.exports = router;
