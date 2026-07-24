// ============================================================
// PhishGuard UTB - Controlador: Autenticación
// ============================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { Usuario } = require('../models');
const { enviarCorreoRecuperacion } = require('../services/emailService');

// Generar JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRATION }
  );
};

// POST /api/auth/register
const registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, semestre, genero, usa_correo_institucional } = req.body;

    // Verificar si el email ya existe
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya está registrado.',
      });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      semestre,
      genero,
      usa_correo_institucional: usa_correo_institucional || false,
    });

    // Generar token
    const token = generarToken(usuario);

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. ¡Bienvenido a PhishGuard UTB!',
      data: {
        usuario: usuario.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Su cuenta ha sido desactivada. Contacte al administrador.',
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas.',
      });
    }

    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });

    // Generar token
    const token = generarToken(usuario);

    res.json({
      success: true,
      message: '¡Inicio de sesión exitoso!',
      data: {
        usuario: usuario.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

// GET /api/auth/me
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId, {
      attributes: { exclude: ['password'] },
    });

    res.json({
      success: true,
      data: { usuario },
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

// PUT /api/auth/perfil
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, semestre, genero, usa_correo_institucional } = req.body;
    const usuario = await Usuario.findByPk(req.usuarioId);

    await usuario.update({
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      semestre: semestre !== undefined ? semestre : usuario.semestre,
      genero: genero !== undefined ? genero : usuario.genero,
      usa_correo_institucional: usa_correo_institucional !== undefined ? usa_correo_institucional : usuario.usa_correo_institucional,
    });

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente.',
      data: { usuario: usuario.toJSON() },
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

// POST /api/auth/google
const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Token de Google requerido.' });
    }

    // Verificar token con Google
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Buscar o crear usuario
    let usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      // Crear usuario nuevo con datos de Google
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      usuario = await Usuario.create({
        nombre: given_name || 'Usuario',
        apellido: family_name || 'Google',
        email,
        password: randomPassword,
        rol: 'estudiante',
        activo: true,
      }, { hooks: false });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Su cuenta ha sido desactivada.',
      });
    }

    await usuario.update({ ultimo_acceso: new Date() });

    const token = generarToken(usuario);

    res.json({
      success: true,
      message: 'Inicio de sesion con Google exitoso.',
      data: {
        usuario: usuario.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Error en login Google:', error);
    res.status(401).json({
      success: false,
      message: 'Error al verificar credenciales de Google.',
    });
  }
};

// ============================================================
// POST /api/auth/recuperar-password
// Genera un token seguro y envía correo de recuperación
// ============================================================
const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es requerido.',
      });
    }

    // Buscar usuario (siempre respondemos igual para no revelar si el email existe)
    const usuario = await Usuario.findOne({ where: { email } });

    if (usuario && usuario.activo) {
      // Generar token aleatorio seguro (32 bytes = 64 caracteres hex)
      const tokenPlano = crypto.randomBytes(32).toString('hex');

      // Hashear el token para guardarlo en BD (seguridad extra)
      const tokenHasheado = await bcrypt.hash(tokenPlano, 10);

      // Guardar token y expiración (1 hora desde ahora)
      const expiracion = new Date(Date.now() + 60 * 60 * 1000);
      await usuario.update({
        reset_password_token: tokenHasheado,
        reset_password_expires: expiracion,
      }, { hooks: false });

      // Construir el enlace de recuperación
      const enlace = `${env.FRONTEND_URL}/nueva-password?token=${tokenPlano}&email=${encodeURIComponent(email)}`;

      // Enviar correo
      try {
        await enviarCorreoRecuperacion(email, usuario.nombre, enlace);
      } catch (emailError) {
        console.error('[EMAIL ERROR]', emailError.message);
        // Si el email falla, limpiamos el token para no dejar estado inconsistente
        await usuario.update({
          reset_password_token: null,
          reset_password_expires: null,
        }, { hooks: false });
        return res.status(500).json({
          success: false,
          message: 'No se pudo enviar el correo. Verifica la configuración de email del servidor.',
        });
      }
    }

    // Respuesta genérica (no revela si el email existe en el sistema)
    res.json({
      success: true,
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.',
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

// ============================================================
// POST /api/auth/restablecer-password
// Valida el token y actualiza la contraseña
// ============================================================
const restablecerPassword = async (req, res) => {
  try {
    const { token, email, nuevaPassword } = req.body;

    if (!token || !email || !nuevaPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, email y nueva contraseña son requeridos.',
      });
    }

    if (nuevaPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Buscar usuario con token válido y no expirado
    const usuario = await Usuario.findOne({
      where: { email },
    });

    if (!usuario || !usuario.reset_password_token || !usuario.reset_password_expires) {
      return res.status(400).json({
        success: false,
        message: 'El enlace de recuperación no es válido o ya fue utilizado.',
      });
    }

    // Verificar que el token no haya expirado
    if (new Date() > new Date(usuario.reset_password_expires)) {
      await usuario.update({
        reset_password_token: null,
        reset_password_expires: null,
      }, { hooks: false });
      return res.status(400).json({
        success: false,
        message: 'El enlace de recuperación ha expirado. Solicita uno nuevo.',
      });
    }

    // Verificar que el token coincida con el hasheado en BD
    const tokenValido = await bcrypt.compare(token, usuario.reset_password_token);
    if (!tokenValido) {
      return res.status(400).json({
        success: false,
        message: 'El enlace de recuperación no es válido.',
      });
    }

    // Actualizar contraseña y limpiar token (el hook beforeUpdate hashea automáticamente)
    await usuario.update({
      password: nuevaPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    res.json({
      success: true,
      message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.',
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
};

module.exports = {
  registro,
  login,
  obtenerPerfil,
  actualizarPerfil,
  loginGoogle,
  solicitarRecuperacion,
  restablecerPassword,
};

