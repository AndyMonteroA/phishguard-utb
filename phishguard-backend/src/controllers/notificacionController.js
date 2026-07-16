// ============================================================
// PhishGuard UTB - Controlador: Notificaciones
// ============================================================

const { Notificacion } = require('../models');
const { Op } = require('sequelize');

// GET /api/notificaciones
const obtenerNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuario_id: req.usuarioId },
      order: [['created_at', 'DESC']],
      limit: 30,
    });

    const noLeidas = await Notificacion.count({
      where: { usuario_id: req.usuarioId, leida: false },
    });

    res.json({
      success: true,
      data: { notificaciones, no_leidas: noLeidas },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones.' });
  }
};

// PUT /api/notificaciones/:id/leer
const marcarLeida = async (req, res) => {
  try {
    const notif = await Notificacion.findOne({
      where: { id: req.params.id, usuario_id: req.usuarioId },
    });
    if (!notif) return res.status(404).json({ success: false, message: 'Notificacion no encontrada.' });

    await notif.update({ leida: true });
    res.json({ success: true, message: 'Notificacion marcada como leida.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error.' });
  }
};

// PUT /api/notificaciones/leer-todas
const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.update(
      { leida: true },
      { where: { usuario_id: req.usuarioId, leida: false } }
    );
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leidas.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error.' });
  }
};

// Helper: crear notificacion
const crearNotificacion = async (usuarioId, tipo, titulo, mensaje, enlace = null) => {
  try {
    await Notificacion.create({ usuario_id: usuarioId, tipo, titulo, mensaje, enlace });
  } catch (error) {
    console.error('Error creando notificacion:', error);
  }
};

module.exports = { obtenerNotificaciones, marcarLeida, marcarTodasLeidas, crearNotificacion };
