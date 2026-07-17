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
    });

    const resultados = await ResultadoQuiz.findAll({
      where: { usuario_id: usuarioId },
      order: [['created_at', 'DESC']],
    });

    // Calcular progreso detallado por módulo de forma dinámica
    let sumaPorcentajes = 0;
    let modulosCompletadosCount = 0;

    const detalleModulos = modulos.map((modulo) => {
      const progreso = progresos.find((p) => p.modulo_id === modulo.id);
      const mejorResultado = resultados
        .filter((r) => r.modulo_id === modulo.id && r.aprobado)
        .sort((a, b) => b.puntaje - a.puntaje)[0];

      const mejorIntento = resultados
        .filter((r) => r.modulo_id === modulo.id)
        .sort((a, b) => b.puntaje - a.puntaje)[0];

      const totalLecturas = modulo.contenidos ? modulo.contenidos.length : 0;
      const lecturasVistas = progreso && progreso.contenidos_vistos ? progreso.contenidos_vistos.length : 0;

      // El progreso de las lecturas representa hasta el 80% del módulo
      const porcentajeLecturas = totalLecturas > 0
        ? Math.round((lecturasVistas / totalLecturas) * 80)
        : 0;

      // El quiz aprobado representa el 20% restante del módulo
      const tieneQuizAprobado = mejorResultado ? true : false;
      const porcentajeAvance = porcentajeLecturas + (tieneQuizAprobado ? 20 : 0);
      const completado = tieneQuizAprobado && porcentajeLecturas >= 78; // 78% o más (equivale a haber leído todo)

      sumaPorcentajes += completado ? 100 : porcentajeAvance;
      if (completado) modulosCompletadosCount++;

      return {
        modulo_id: modulo.id,
        titulo: modulo.titulo,
        icono: modulo.icono,
        total_contenidos: totalLecturas,
        porcentaje_avance: completado ? 100 : porcentajeAvance,
        completado: completado,
        mejor_puntaje: mejorIntento
          ? Math.round((mejorIntento.puntaje / mejorIntento.total_preguntas) * 100)
          : null,
        intentos_quiz: resultados.filter((r) => r.modulo_id === modulo.id).length,
      };
    });

    // Calcular progreso general como promedio real
    const totalModulos = modulos.length;
    const progresoGeneral = totalModulos > 0
      ? Math.round(sumaPorcentajes / totalModulos)
      : 0;

    // Calcular puntaje promedio de todos los intentos del usuario
    const puntajePromedio = resultados.length > 0
      ? Math.round(
          resultados.reduce((acc, r) => acc + (r.puntaje / r.total_preguntas) * 100, 0) /
          resultados.length
        )
      : 0;

    res.json({
      success: true,
      data: {
        progreso_general: progresoGeneral,
        modulos_completados: modulosCompletadosCount,
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
    let contenidosVistos = [...(progreso.contenidos_vistos || [])];
    const contenidoIdInt = parseInt(contenidoId);

    if (!contenidosVistos.includes(contenidoIdInt)) {
      contenidosVistos.push(contenidoIdInt);

      // Calcular porcentaje de lecturas (hasta el 80% del progreso total)
      const totalContenidos = await Contenido.count({
        where: { modulo_id: parseInt(moduloId), activo: true },
      });

      const porcentajeLecturas = totalContenidos > 0
        ? Math.round((contenidosVistos.length / totalContenidos) * 80)
        : 0;

      // Verificar si ya tiene el quiz aprobado para este módulo
      const quizAprobado = await ResultadoQuiz.findOne({
        where: { usuario_id: usuarioId, modulo_id: parseInt(moduloId), aprobado: true },
      });

      const porcentajeTotal = porcentajeLecturas + (quizAprobado ? 20 : 0);
      const esCompletado = quizAprobado && porcentajeLecturas >= 78;

      progreso.contenidos_vistos = contenidosVistos;
      progreso.porcentaje_avance = Math.min(esCompletado ? 100 : porcentajeTotal, 100);
      progreso.ultimo_contenido_id = contenidoIdInt;
      progreso.completado = esCompletado;
      if (esCompletado && !progreso.fecha_completado) {
        progreso.fecha_completado = new Date();
      }
      
      progreso.changed('contenidos_vistos', true);
      await progreso.save();
    } else {
      // Si ya estaba visto, de todas formas actualizamos el ultimo visitado para guardar el estado de la diapositiva
      progreso.ultimo_contenido_id = contenidoIdInt;
      await progreso.save();
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
