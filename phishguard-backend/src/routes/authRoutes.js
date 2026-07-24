// ============================================================
// PhishGuard UTB - Rutas: Autenticación
// ============================================================

const router = require('express').Router();
const { registro, login, obtenerPerfil, actualizarPerfil, loginGoogle, solicitarRecuperacion, restablecerPassword } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { validarRegistro, validarLogin } = require('../middlewares/validator');

router.post('/register', validarRegistro, registro);
router.post('/login', validarLogin, login);
router.post('/google', loginGoogle);
router.get('/me', auth, obtenerPerfil);
router.put('/perfil', auth, actualizarPerfil);

// Recuperación de contraseña (rutas públicas)
router.post('/recuperar-password', solicitarRecuperacion);
router.post('/restablecer-password', restablecerPassword);

module.exports = router;
