// ============================================================
// PhishGuard UTB - Controlador: Módulos
// ============================================================

const { Modulo, Contenido, Pregunta, ProgresoModulo } = require('../models');

// GET /api/modulos - Listar todos los módulos
const listarModulos = async (req, res) => {
  try {
    const modulos = await Modulo.findAll({
      where: { activo: true },
      order: [['orden', 'ASC']],
      include: [
        {
          model: Contenido,
          as: 'contenidos',
          attributes: ['id'],
          where: { activo: true },
          required: false,
        },
      ],
    });

    // Si el usuario está autenticado, incluir su progreso
    let modulosConProgreso = modulos.map((m) => m.toJSON());

    if (req.usuario) {
      const progresos = await ProgresoModulo.findAll({
        where: { usuario_id: req.usuario.id },
      });

      modulosConProgreso = modulosConProgreso.map((modulo) => {
        const progreso = progresos.find((p) => p.modulo_id === modulo.id);
        return {
          ...modulo,
          total_contenidos: modulo.contenidos ? modulo.contenidos.length : 0,
          progreso: progreso
            ? {
                porcentaje_avance: progreso.porcentaje_avance,
                completado: progreso.completado,
              }
            : { porcentaje_avance: 0, completado: false },
        };
      });
    }

    res.json({
      success: true,
      data: { modulos: modulosConProgreso },
    });
  } catch (error) {
    console.error('Error al listar módulos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los módulos.',
    });
  }
};

// GET /api/modulos/:id - Detalle de un módulo con contenidos
const obtenerModulo = async (req, res) => {
  try {
    const { id } = req.params;

    const modulo = await Modulo.findByPk(id, {
      include: [
        {
          model: Contenido,
          as: 'contenidos',
          where: { activo: true },
          order: [['orden', 'ASC']],
          required: false,
        },
        {
          model: Pregunta,
          as: 'preguntas',
          attributes: ['id'],
          required: false,
        },
      ],
    });

    if (!modulo) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado.',
      });
    }

    // Obtener progreso del usuario si está autenticado
    let progreso = null;
    if (req.usuario) {
      progreso = await ProgresoModulo.findOne({
        where: { usuario_id: req.usuario.id, modulo_id: id },
      });
    }

    res.json({
      success: true,
      data: {
        modulo: {
          ...modulo.toJSON(),
          total_preguntas: modulo.preguntas ? modulo.preguntas.length : 0,
          progreso: progreso
            ? {
                porcentaje_avance: progreso.porcentaje_avance,
                completado: progreso.completado,
                contenidos_vistos: progreso.contenidos_vistos,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el módulo.',
    });
  }
};

// POST /api/modulos (Admin) - Crear módulo
const crearModulo = async (req, res) => {
  try {
    const { titulo, descripcion, orden, icono, color, duracion_estimada } = req.body;

    const modulo = await Modulo.create({
      titulo,
      descripcion,
      orden,
      icono,
      color,
      duracion_estimada,
    });

    res.status(201).json({
      success: true,
      message: 'Módulo creado exitosamente.',
      data: { modulo },
    });
  } catch (error) {
    console.error('Error al crear módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el módulo.',
    });
  }
};

// PUT /api/modulos/:id (Admin) - Actualizar módulo
const actualizarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const modulo = await Modulo.findByPk(id);

    if (!modulo) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado.',
      });
    }

    await modulo.update(req.body);

    res.json({
      success: true,
      message: 'Módulo actualizado exitosamente.',
      data: { modulo },
    });
  } catch (error) {
    console.error('Error al actualizar módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el módulo.',
    });
  }
};

module.exports = {
  listarModulos,
  obtenerModulo,
  crearModulo,
  actualizarModulo,
};
