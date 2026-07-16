// ============================================================
// PhishGuard UTB - Middleware: Control de Roles
// ============================================================

const autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Debe autenticarse primero.',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso.',
      });
    }

    next();
  };
};

module.exports = autorizar;
