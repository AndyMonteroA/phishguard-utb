// ============================================================
// PhishGuard UTB - Controlador: Progreso
// ============================================================

const { ProgresoModulo, Modulo, ResultadoQuiz, Contenido } = require('../models');

// GET /api/progreso - Progreso general del usuario
const obtenerProgreso = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const modulos = await Modulo.findAll({
      where: { activo: true },
      order: [['orden', 'ASC']],
      include: [
        {
          model: Contenido,
          as: 'contenidos',
          attributes: ['id'],
          required: false,
        },
      ],
    });

    const progresos = await ProgresoModulo.findAll({
      where: { usuario_id: usuarioId },
      include: [{ model: Modulo, as: 'modulo', attributes: ['titulo', 'icono'] }],
    });

    const resultados = await ResultadoQuiz.findAll({
      where: { usuario_id: usuarioId },
      order: [['created_at', 'DESC']],
    });

    // Calcular progreso general
    const totalModulos = modulos.length;
    const modulosCompletados = progresos.filter((p) => p.completado).length;
    const progresoGeneral = totalModulos > 0
      ? Math.round((modulosCompletados / totalModulos) * 100)
      : 0;

    // Calcular puntaje promedio
    const quizzesAprobados = resultados.filter((r) => r.aprobado);
    const puntajePromedio = quizzesAprobados.length > 0
      ? Math.round(
          quizzesAprobados.reduce((acc, r) => acc + (r.puntaje / r.total_preguntas) * 100, 0) /
          quizzesAprobados.length
        )
      : 0;

    const detalleModulos = modulos.map((modulo) => {
      const progreso = progresos.find((p) => p.modulo_id === modulo.id);
      const mejorResultado = resultados
        .filter((r) => r.modulo_id === modulo.id && r.aprobado)
        .sort((a, b) => b.puntaje - a.puntaje)[0];

      return {
        modulo_id: modulo.id,
        titulo: modulo.titulo,
        icono: modulo.icono,
        total_contenidos: modulo.contenidos ? modulo.contenidos.length : 0,
        porcentaje_avance: progreso ? progreso.porcentaje_avance : 0,
        completado: progreso ? progreso.completado : false,
        mejor_puntaje: mejorResultado
          ? Math.round((mejorResultado.puntaje / mejorResultado.total_preguntas) * 100)
          : null,
        intentos_quiz: resultados.filter((r) => r.modulo_id === modulo.id).length,
      };
    });

    res.json({
      success: true,
      data: {
        progreso_general: progresoGeneral,
        modulos_completados: modulosCompletados,
        total_modulos: totalModulos,
        puntaje_promedio: puntajePromedio,
        total_quizzes: resultados.length,
        detalle: detalleModulos,
      },
    });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el progreso.',
    });
  }
};

// POST /api/progreso/:moduloId/contenido/:contenidoId - Marcar contenido como visto
const marcarContenidoVisto = async (req, res) => {
  try {
    const { moduloId, contenidoId } = req.params;
    const usuarioId = req.usuarioId;

    // Obtener o crear progreso
    const [progreso, created] = await ProgresoModulo.findOrCreate({
      where: { usuario_id: usuarioId, modulo_id: parseInt(moduloId) },
      defaults: { fecha_inicio: new Date(), contenidos_vistos: [] },
    });

    // Añadir contenido visto si no estaba ya
    let contenidosVistos = progreso.contenidos_vistos || [];
    const contenidoIdInt = parseInt(contenidoId);

    if (!contenidosVistos.includes(contenidoIdInt)) {
      contenidosVistos.push(contenidoIdInt);

      // Calcular porcentaje
      const totalContenidos = await Contenido.count({
        where: { modulo_id: parseInt(moduloId), activo: true },
      });

      const porcentaje = totalContenidos > 0
        ? Math.round((contenidosVistos.length / totalContenidos) * 100)
        : 0;

      await progreso.update({
        contenidos_vistos: contenidosVistos,
        porcentaje_avance: Math.min(porcentaje, 100),
        ultimo_contenido_id: contenidoIdInt,
      });
    } else {
      // Si ya estaba visto, de todas formas actualizamos el ultimo visitado para guardar el estado de la diapositiva
      await progreso.update({
        ultimo_contenido_id: contenidoIdInt,
      });
    }

    res.json({
      success: true,
      message: 'Progreso actualizado.',
      data: {
        contenidos_vistos: contenidosVistos,
        porcentaje_avance: progreso.porcentaje_avance,
        ultimo_contenido_id: contenidoIdInt,
      },
    });
  } catch (error) {
    console.error('Error al marcar contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el progreso.',
    });
  }
};

module.exports = {
  obtenerProgreso,
  marcarContenidoVisto,
};
