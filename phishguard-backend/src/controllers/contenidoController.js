// ============================================================
// PhishGuard UTB - Controlador: Contenidos (CRUD Admin)
// ============================================================

const { Contenido, Modulo } = require('../models');

// GET /api/contenidos/:moduloId
const listarContenidos = async (req, res) => {
  try {
    const contenidos = await Contenido.findAll({
      where: { modulo_id: req.params.moduloId },
      order: [['orden', 'ASC']],
      include: [{ model: Modulo, as: 'modulo', attributes: ['titulo'] }],
    });
    res.json({ success: true, data: { contenidos } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener contenidos.' });
  }
};

// POST /api/contenidos/:moduloId
const crearContenido = async (req, res) => {
  try {
    const { titulo, tipo, contenido, orden } = req.body;
    const modulo = await Modulo.findByPk(req.params.moduloId);
    if (!modulo) return res.status(404).json({ success: false, message: 'Modulo no encontrado.' });

    const nuevoContenido = await Contenido.create({
      modulo_id: parseInt(req.params.moduloId),
      titulo, tipo, contenido,
      orden: orden || (await Contenido.count({ where: { modulo_id: req.params.moduloId } })) + 1,
    });
    res.status(201).json({ success: true, message: 'Contenido creado.', data: { contenido: nuevoContenido } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al crear contenido.' });
  }
};

// PUT /api/contenidos/:id
const actualizarContenido = async (req, res) => {
  try {
    const cont = await Contenido.findByPk(req.params.id);
    if (!cont) return res.status(404).json({ success: false, message: 'Contenido no encontrado.' });
    await cont.update(req.body);
    res.json({ success: true, message: 'Contenido actualizado.', data: { contenido: cont } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar.' });
  }
};

// DELETE /api/contenidos/:id
const eliminarContenido = async (req, res) => {
  try {
    const cont = await Contenido.findByPk(req.params.id);
    if (!cont) return res.status(404).json({ success: false, message: 'Contenido no encontrado.' });
    await cont.update({ activo: false });
    res.json({ success: true, message: 'Contenido eliminado.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar.' });
  }
};

module.exports = { listarContenidos, crearContenido, actualizarContenido, eliminarContenido };
