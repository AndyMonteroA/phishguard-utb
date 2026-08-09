// ============================================================
// PhishGuard UTB - Rutas: Comentarios (Foros)
// ============================================================

const router = require('express').Router();
const { listarComentarios, crearComentario, eliminarComentario } = require('../controllers/comentarioController');
const auth = require('../middlewares/auth');

// Listar comentarios de un módulo (puede ser público o requerir auth, lo haremos requiere auth)
router.get('/modulos/:moduloId', auth, listarComentarios);

// Crear comentario
router.post('/modulos/:moduloId', auth, crearComentario);

// Eliminar comentario
router.delete('/:id', auth, eliminarComentario);

module.exports = router;
