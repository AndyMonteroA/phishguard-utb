// ============================================================
// PhishGuard UTB - Controlador: Evaluación Final
// ============================================================

const { Pregunta, Modulo, ProgresoModulo, ResultadoQuiz } = require('../models');
const { verificarLogros } = require('./logroController');
const { crearNotificacion } = require('./notificacionController');
const { Op } = require('sequelize');

// GET /api/evaluacion-final - Obtener preguntas de la evaluación final
const obtenerEvaluacionFinal = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    // Verificar que completó todos los módulos
    const totalModulos = await Modulo.count({ where: { activo: true } });
    const modulosCompletados = await ProgresoModulo.count({
      where: { usuario_id: usuarioId, completado: true },
    });

    if (modulosCompletados < totalModulos) {
      return res.status(400).json({
        success: false,
        message: `Debes completar todos los módulos antes de presentar la evaluación final. Progreso: ${modulosCompletados}/${totalModulos}`,
        data: { completados: modulosCompletados, total: totalModulos },
      });
    }

    // Verificar si ya aprobó la evaluación final
    const moduloEvaluacion = await Modulo.findOne({ where: { titulo: 'Evaluación Final' } });
    const moduloIdFinal = moduloEvaluacion ? moduloEvaluacion.id : 0;
    const yaAprobada = await ResultadoQuiz.findOne({
      where: { usuario_id: usuarioId, modulo_id: { [Op.in]: [0, moduloIdFinal] }, aprobado: true },
    });

    if (yaAprobada) {
      return res.json({
        success: true,
        data: {
          ya_aprobada: true,
          resultado: {
            puntaje: yaAprobada.puntaje,
            total_preguntas: yaAprobada.total_preguntas,
            porcentaje: Math.round((yaAprobada.puntaje / yaAprobada.total_preguntas) * 100),
            fecha: yaAprobada.created_at,
          },
        },
      });
    }

    // 1. Buscar si hay preguntas exclusivas para "Evaluación Final"
    const moduloEvaluacion = await Modulo.findOne({ where: { titulo: 'Evaluación Final' } });
    let preguntasSeleccionadas = [];
    
    if (moduloEvaluacion) {
      const preguntasFinales = await Pregunta.findAll({
        where: { modulo_id: moduloEvaluacion.id },
        order: [Pregunta.sequelize.fn('RANDOM')],
        limit: 10, // o el límite que desees para la evaluación final
        attributes: ['id', 'pregunta', 'opciones', 'modulo_id'],
      });
      if (preguntasFinales.length > 0) {
        preguntasSeleccionadas = preguntasFinales.map(p => ({
          ...p.toJSON(),
          modulo_titulo: 'Evaluación Final',
        }));
      }
    }

    // 2. Si no hay preguntas exclusivas, hacer fallback a preguntas aleatorias de los módulos
    const modulos = await Modulo.findAll({
      where: { activo: true },
      order: [['orden', 'ASC']],
    });

    if (preguntasSeleccionadas.length === 0) {
      const preguntasPorModulo = Math.max(3, Math.ceil(20 / modulos.length));
      for (const modulo of modulos) {
        const preguntas = await Pregunta.findAll({
          where: { modulo_id: modulo.id },
          order: [Pregunta.sequelize.fn('RANDOM')],
          limit: preguntasPorModulo,
          attributes: ['id', 'pregunta', 'opciones', 'modulo_id'],
        });
        preguntasSeleccionadas.push(...preguntas.map(p => ({
          ...p.toJSON(),
          modulo_titulo: modulo.titulo,
        })));
      }
    }

    res.json({
      success: true,
      data: {
        ya_aprobada: false,
        preguntas: preguntasSeleccionadas,
        total: preguntasSeleccionadas.length,
        tiempo_limite: preguntasSeleccionadas.length * 90, // 90 segundos por pregunta
        modulos_evaluados: ['Evaluación Final'], // Para simplificar
      },
    });
  } catch (error) {
    console.error('Error evaluación final:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la evaluación final.' });
  }
};

// POST /api/evaluacion-final/submit - Enviar respuestas de la evaluación final
const enviarEvaluacionFinal = async (req, res) => {
  try {
    const { respuestas, tiempo_empleado } = req.body;
    const usuarioId = req.usuarioId;

    // Obtener las preguntas con respuestas correctas
    const preguntaIds = respuestas.map(r => r.pregunta_id).filter(Boolean);
    const preguntas = await Pregunta.findAll({
      where: { id: { [Op.in]: preguntaIds } },
      include: [{ model: Modulo, as: 'modulo', attributes: ['titulo'] }],
    });

    // Evaluar respuestas
    let puntaje = 0;
    const resultadosDetallados = respuestas.map(resp => {
      const pregunta = preguntas.find(p => p.id === resp.pregunta_id);
      if (!pregunta) return null;

      const esCorrecta = pregunta.respuesta_correcta === resp.respuesta;
      if (esCorrecta) puntaje++;

      return {
        pregunta_id: resp.pregunta_id,
        pregunta_texto: pregunta.pregunta,
        modulo: pregunta.modulo?.titulo || 'General',
        respuesta_usuario: resp.respuesta,
        respuesta_correcta: pregunta.respuesta_correcta,
        correcta: esCorrecta,
        retroalimentacion: pregunta.retroalimentacion,
        opciones: pregunta.opciones,
      };
    }).filter(Boolean);

    const totalPreguntas = resultadosDetallados.length;
    // Evitar NaN si totalPreguntas es 0
    const porcentaje = totalPreguntas > 0 ? Math.round((puntaje / totalPreguntas) * 100) : 0;
    const aprobado = porcentaje >= 70;

    // Obtener el módulo de Evaluación Final si existe, sino usar 0
    const moduloEvaluacion = await Modulo.findOne({ where: { titulo: 'Evaluación Final' } });
    const moduloIdFinal = moduloEvaluacion ? moduloEvaluacion.id : 0;

    // Guardar resultado de evaluación final
    await ResultadoQuiz.create({
      usuario_id: usuarioId,
      modulo_id: moduloIdFinal, // Usar el ID real del módulo en lugar de 0 para evitar errores de Foreign Key
      puntaje,
      total_preguntas: totalPreguntas,
      respuestas: resultadosDetallados,
      aprobado,
      tiempo_empleado: tiempo_empleado || null,
    });

    if (aprobado) {
      await crearNotificacion(
        usuarioId,
        'evaluacion',
        '🎓 Evaluación Final Aprobada',
        `¡Felicidades! Aprobaste la evaluación final con ${porcentaje}%. Ya puedes generar tu certificado.`,
        '/certificado'
      );
    }

    // Verificar logros
    if (typeof verificarLogros === 'function') {
      try { await verificarLogros(usuarioId); } catch(e) { console.error('Error al verificar logros:', e); }
    }

    // Análisis por módulo
    const analisisPorModulo = {};
    resultadosDetallados.forEach(r => {
      if (!analisisPorModulo[r.modulo]) {
        analisisPorModulo[r.modulo] = { correctas: 0, total: 0 };
      }
      analisisPorModulo[r.modulo].total++;
      if (r.correcta) analisisPorModulo[r.modulo].correctas++;
    });

    const resumenModulos = Object.entries(analisisPorModulo).map(([modulo, stats]) => ({
      modulo,
      correctas: stats.correctas,
      total: stats.total,
      porcentaje: Math.round((stats.correctas / stats.total) * 100),
    }));

    res.json({
      success: true,
      message: aprobado
        ? '🎓 ¡Felicidades! Has aprobado la evaluación final. Ya puedes generar tu certificado.'
        : 'No alcanzaste el puntaje mínimo (70%). Puedes intentarlo de nuevo.',
      data: {
        resultado: {
          puntaje,
          total_preguntas: totalPreguntas,
          porcentaje,
          aprobado,
          tiempo_empleado,
        },
        resumen_modulos: resumenModulos,
        detalle: resultadosDetallados,
      },
    });
  } catch (error) {
    console.error('Error al enviar evaluación final:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la evaluación final.' });
  }
};

module.exports = {
  obtenerEvaluacionFinal,
  enviarEvaluacionFinal,
};
