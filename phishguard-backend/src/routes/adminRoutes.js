// ============================================================
// PhishGuard UTB - Rutas: Administración
// ============================================================

const router = require('express').Router();
const {
  obtenerEstadisticas,
  listarEstudiantes,
  toggleUsuario,
  exportarExcel,
  obtenerErrores,
  obtenerEvolucion,
  obtenerMejora,
} = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const autorizar = require('../middlewares/roles');

router.use(auth, autorizar('admin'));

router.get('/estadisticas', obtenerEstadisticas);
router.get('/estudiantes', listarEstudiantes);
router.put('/usuarios/:id/toggle', toggleUsuario);
router.get('/exportar', exportarExcel);
router.get('/analitica/errores', obtenerErrores);
router.get('/analitica/evolucion', obtenerEvolucion);
router.get('/analitica/mejora', obtenerMejora);

module.exports = router;
