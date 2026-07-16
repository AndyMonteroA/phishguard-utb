// ============================================================
// PhishGuard UTB - Controlador: Quiz
// ============================================================

const { Pregunta, ResultadoQuiz, ProgresoModulo, Modulo } = require('../models');
const { verificarLogros } = require('./logroController');
const { crearNotificacion } = require('./notificacionController');

// GET /api/quiz/:moduloId - Obtener preguntas del quiz
const obtenerPreguntas = async (req, res) => {
  try {
    const { moduloId } = req.params;

    // Verificar que el módulo existe
    const modulo = await Modulo.findByPk(moduloId);
    if (!modulo) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado.',
      });
    }

    const preguntas = await Pregunta.findAll({
      where: { modulo_id: moduloId },
      order: [['orden', 'ASC']],
      attributes: ['id', 'pregunta', 'opciones', 'orden'],
      // NO enviamos respuesta_correcta ni retroalimentacion al frontend
    });

    res.json({
      success: true,
      data: {
        modulo: { id: modulo.id, titulo: modulo.titulo },
        preguntas,
        total: preguntas.length,
      },
    });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las preguntas del quiz.',
    });
  }
};

// POST /api/quiz/:moduloId/submit - Enviar respuestas del quiz
const enviarRespuestas = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const { respuestas, tiempo_empleado } = req.body;
    const usuarioId = req.usuarioId;

    // Obtener preguntas con respuestas correctas
    const preguntas = await Pregunta.findAll({
      where: { modulo_id: moduloId },
      order: [['orden', 'ASC']],
    });

    if (preguntas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay preguntas para este módulo.',
      });
    }

    // Evaluar respuestas
    let puntaje = 0;
    const resultadosDetallados = respuestas.map((resp) => {
      const pregunta = preguntas.find((p) => p.id === resp.pregunta_id);
      if (!pregunta) return null;

      const esCorrecta = pregunta.respuesta_correcta === resp.respuesta;
      if (esCorrecta) puntaje++;

      return {
        pregunta_id: resp.pregunta_id,
        pregunta_texto: pregunta.pregunta,
        respuesta_usuario: resp.respuesta,
        respuesta_correcta: pregunta.respuesta_correcta,
        correcta: esCorrecta,
        retroalimentacion: pregunta.retroalimentacion,
        opciones: pregunta.opciones,
      };
    }).filter(Boolean);

    const totalPreguntas = preguntas.length;
    const porcentaje = Math.round((puntaje / totalPreguntas) * 100);
    const aprobado = porcentaje >= 70;

    // Guardar resultado
    const resultado = await ResultadoQuiz.create({
      usuario_id: usuarioId,
      modulo_id: parseInt(moduloId),
      puntaje,
      total_preguntas: totalPreguntas,
      respuestas: resultadosDetallados,
      aprobado,
      tiempo_empleado: tiempo_empleado || null,
    });

    // Si aprobó, actualizar progreso del módulo
    if (aprobado) {
      const [progreso] = await ProgresoModulo.findOrCreate({
        where: { usuario_id: usuarioId, modulo_id: parseInt(moduloId) },
        defaults: { fecha_inicio: new Date() },
      });

      await progreso.update({
        completado: true,
        porcentaje_avance: 100,
        fecha_completado: new Date(),
      });

      await crearNotificacion(usuarioId, 'quiz', 'Quiz aprobado', `Aprobaste el quiz del modulo con ${porcentaje}%.`, `/modulos/${moduloId}`);
    }

    // Verificar logros
    const nuevosLogros = await verificarLogros(usuarioId);

    res.json({
      success: true,
      message: aprobado
        ? '¡Felicidades! Has aprobado el quiz.'
        : 'No alcanzaste el puntaje mínimo. ¡Sigue estudiando e inténtalo de nuevo!',
      data: {
        resultado: {
          id: resultado.id,
          puntaje,
          total_preguntas: totalPreguntas,
          porcentaje,
          aprobado,
          tiempo_empleado,
        },
        detalle: resultadosDetallados,
      },
    });
  } catch (error) {
    console.error('Error al enviar respuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar las respuestas del quiz.',
    });
  }
};

// GET /api/quiz/:moduloId/resultados - Historial de intentos del usuario
const obtenerResultados = async (req, res) => {
  try {
    const { moduloId } = req.params;

    const resultados = await ResultadoQuiz.findAll({
      where: { usuario_id: req.usuarioId, modulo_id: moduloId },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: { resultados },
    });
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los resultados.',
    });
  }
};

module.exports = {
  obtenerPreguntas,
  enviarRespuestas,
  obtenerResultados,
};
