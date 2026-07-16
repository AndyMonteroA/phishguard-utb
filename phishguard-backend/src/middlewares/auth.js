// ============================================================
// PhishGuard UTB - Middleware: Autenticación JWT
// ============================================================

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { Usuario } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó token de autenticación.',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar y decodificar token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Buscar usuario en la BD
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Usuario no encontrado.',
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Su cuenta ha sido desactivada. Contacte al administrador.',
      });
    }

    // Adjuntar usuario al request
    req.usuario = usuario;
    req.usuarioId = usuario.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Por favor, inicie sesión nuevamente.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación.',
    });
  }
};

module.exports = auth;
