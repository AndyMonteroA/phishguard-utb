// ============================================================
// PhishGuard UTB - Controlador: Comentarios (Foro)
// ============================================================

const { Comentario, Usuario } = require('../models');

// GET /api/modulos/:moduloId/comentarios
const listarComentarios = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const comentarios = await Comentario.findAll({
      where: { modulo_id: moduloId },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'rol'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: comentarios });
  } catch (error) {
    console.error('Error al listar comentarios:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

// POST /api/modulos/:moduloId/comentarios
const crearComentario = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const { contenido } = req.body;
    const usuarioId = req.usuarioId; // del token

    if (!contenido || contenido.trim() === '') {
      return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío.' });
    }

    const nuevoComentario = await Comentario.create({
      modulo_id: moduloId,
      usuario_id: usuarioId,
      contenido: contenido.trim()
    });

    // Cargar los datos del usuario para retornarlos
    const comentarioConUsuario = await Comentario.findByPk(nuevoComentario.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'rol'] }
      ]
    });

    res.status(201).json({ success: true, message: 'Comentario agregado con éxito.', data: comentarioConUsuario });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

// DELETE /api/comentarios/:id
const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuarioId;
    const rol = req.usuarioRol;

    const comentario = await Comentario.findByPk(id);
    if (!comentario) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
    }

    // Solo el autor original o un admin puede borrarlo
    if (comentario.usuario_id !== usuarioId && rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este comentario.' });
    }

    await comentario.destroy();
    res.json({ success: true, message: 'Comentario eliminado.' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

module.exports = {
  listarComentarios,
  crearComentario,
  eliminarComentario
};
