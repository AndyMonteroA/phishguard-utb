// ============================================================
// PhishGuard UTB - Controlador: Logros
// ============================================================

const { Logro, LogroUsuario, Notificacion, ProgresoModulo, ResultadoQuiz, EncuestaDiagnostica, Certificado, Modulo } = require('../models');

// Verificar y otorgar logros automáticamente
const verificarLogros = async (usuarioId) => {
  try {
    const logros = await Logro.findAll({ where: { activo: true } });
    const logrosObtenidos = await LogroUsuario.findAll({ where: { usuario_id: usuarioId } });
    const idsObtenidos = logrosObtenidos.map(l => l.logro_id);
    const nuevosLogros = [];

    for (const logro of logros) {
      if (idsObtenidos.includes(logro.id)) continue;

      let cumple = false;

      switch (logro.condicion) {
        case 'encuesta_completada': {
          const encuesta = await EncuestaDiagnostica.findOne({ where: { usuario_id: usuarioId } });
          cumple = !!encuesta;
          break;
        }
        case 'primer_modulo': {
          const completados = await ProgresoModulo.count({ where: { usuario_id: usuarioId, completado: true } });
          cumple = completados >= logro.valor_requerido;
          break;
        }
        case 'primer_quiz': {
          const aprobados = await ResultadoQuiz.count({ where: { usuario_id: usuarioId, aprobado: true } });
          cumple = aprobados >= logro.valor_requerido;
          break;
        }
        case 'quiz_perfecto': {
          const perfectos = await ResultadoQuiz.findAll({ where: { usuario_id: usuarioId, aprobado: true } });
          cumple = perfectos.some(r => r.puntaje === r.total_preguntas);
          break;
        }
        case 'todos_modulos': {
          const totalModulos = await Modulo.count({ where: { activo: true } });
          const modulosComp = await ProgresoModulo.count({ where: { usuario_id: usuarioId, completado: true } });
          cumple = modulosComp >= totalModulos && totalModulos > 0;
          break;
        }
        case 'certificado': {
          const cert = await Certificado.findOne({ where: { usuario_id: usuarioId } });
          cumple = !!cert;
          break;
        }
        case 'quizzes_90': {
          const resultados = await ResultadoQuiz.findAll({ where: { usuario_id: usuarioId, aprobado: true } });
          const totalMods = await Modulo.count({ where: { activo: true } });
          const modulosConQuiz = new Set(resultados.map(r => r.modulo_id));
          if (modulosConQuiz.size >= totalMods && totalMods > 0) {
            const todosAltos = [...modulosConQuiz].every(modId => {
              const mejorRes = resultados.filter(r => r.modulo_id === modId).sort((a, b) => b.puntaje - a.puntaje)[0];
              return mejorRes && (mejorRes.puntaje / mejorRes.total_preguntas) * 100 >= 90;
            });
            cumple = todosAltos;
          }
          break;
        }
      }

      if (cumple) {
        await LogroUsuario.create({ usuario_id: usuarioId, logro_id: logro.id });
        await Notificacion.create({
          usuario_id: usuarioId,
          tipo: 'logro',
          titulo: 'Nuevo logro desbloqueado',
          mensaje: `Has obtenido el logro "${logro.titulo}": ${logro.descripcion}`,
          enlace: '/logros',
        });
        nuevosLogros.push(logro);
      }
    }

    return nuevosLogros;
  } catch (error) {
    console.error('Error verificando logros:', error);
    return [];
  }
};

// GET /api/logros - Logros del usuario
const obtenerLogros = async (req, res) => {
  try {
    const todosLogros = await Logro.findAll({ where: { activo: true }, order: [['id', 'ASC']] });
    const obtenidos = await LogroUsuario.findAll({
      where: { usuario_id: req.usuarioId },
      include: [{ model: Logro, as: 'logro' }],
    });
    const idsObtenidos = obtenidos.map(l => l.logro_id);

    const logrosConEstado = todosLogros.map(logro => ({
      ...logro.toJSON(),
      obtenido: idsObtenidos.includes(logro.id),
      fecha_obtenido: obtenidos.find(l => l.logro_id === logro.id)?.fecha_obtenido || null,
    }));

    res.json({
      success: true,
      data: {
        logros: logrosConEstado,
        total: todosLogros.length,
        obtenidos: idsObtenidos.length,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener logros.' });
  }
};

module.exports = { verificarLogros, obtenerLogros };
