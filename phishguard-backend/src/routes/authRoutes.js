// ============================================================
// PhishGuard UTB - Rutas: Autenticación
// ============================================================

const router = require('express').Router();
const { registro, login, obtenerPerfil, actualizarPerfil, loginGoogle } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { validarRegistro, validarLogin } = require('../middlewares/validator');

router.post('/register', validarRegistro, registro);
router.post('/login', validarLogin, login);
router.post('/google', loginGoogle);
router.get('/me', auth, obtenerPerfil);
router.put('/perfil', auth, actualizarPerfil);

module.exports = router;
