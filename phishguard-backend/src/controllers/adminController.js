// ============================================================
// PhishGuard UTB - Controlador: Administración
// ============================================================

const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { Usuario, Modulo, Pregunta, ProgresoModulo, ResultadoQuiz, EncuestaDiagnostica, Certificado } = require('../models');

// GET /api/admin/estadisticas - Dashboard de estadísticas
const obtenerEstadisticas = async (req, res) => {
  try {
    const totalEstudiantes = await Usuario.count({ where: { rol: 'estudiante' } });
    const estudiantesActivos = await Usuario.count({ where: { rol: 'estudiante', activo: true } });
    const encuestasCompletadas = await EncuestaDiagnostica.count();
    const certificadosEmitidos = await Certificado.count();
    const totalQuizzes = await ResultadoQuiz.count();
    const quizzesAprobados = await ResultadoQuiz.count({ where: { aprobado: true } });

    // Distribución de niveles en encuesta diagnóstica
    const nivelesEncuesta = await EncuestaDiagnostica.findAll({
      attributes: [
        'nivel',
        [require('sequelize').fn('COUNT', require('sequelize').col('nivel')), 'cantidad'],
      ],
      group: ['nivel'],
    });

    // Progreso por módulo
    const modulos = await Modulo.findAll({ where: { activo: true }, order: [['orden', 'ASC']] });
    const progresoModulos = await Promise.all(
      modulos.map(async (modulo) => {
        const completados = await ProgresoModulo.count({
          where: { modulo_id: modulo.id, completado: true },
        });
        const enProgreso = await ProgresoModulo.count({
          where: {
            modulo_id: modulo.id,
            completado: false,
            porcentaje_avance: { [Op.gt]: 0 },
          },
        });
        return {
          modulo_id: modulo.id,
          titulo: modulo.titulo,
          icono: modulo.icono,
          completados,
          en_progreso: enProgreso,
        };
      })
    );

    // Registros recientes (últimos 7 días)
    const registrosRecientes = await Usuario.count({
      where: {
        rol: 'estudiante',
        created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    res.json({
      success: true,
      data: {
        total_estudiantes: totalEstudiantes,
        estudiantes_activos: estudiantesActivos,
        encuestas_completadas: encuestasCompletadas,
        certificados_emitidos: certificadosEmitidos,
        total_quizzes: totalQuizzes,
        quizzes_aprobados: quizzesAprobados,
        tasa_aprobacion: totalQuizzes > 0 ? Math.round((quizzesAprobados / totalQuizzes) * 100) : 0,
        registros_recientes: registrosRecientes,
        niveles_encuesta: nivelesEncuesta,
        progreso_modulos: progresoModulos,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas.',
    });
  }
};

// GET /api/admin/estudiantes - Listar estudiantes con progreso
const listarEstudiantes = async (req, res) => {
  try {
    const { buscar, estado, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { rol: 'estudiante' };
    if (estado === 'activo') where.activo = true;
    if (estado === 'inactivo') where.activo = false;
    if (buscar) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${buscar}%` } },
        { apellido: { [Op.iLike]: `%${buscar}%` } },
        { email: { [Op.iLike]: `%${buscar}%` } },
      ];
    }

    const { count, rows: estudiantes } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: ProgresoModulo, as: 'progresos' },
        { model: EncuestaDiagnostica, as: 'encuesta', attributes: ['puntaje_conocimiento', 'nivel'] },
        { model: Certificado, as: 'certificado', attributes: ['codigo_unico', 'fecha_emision'] },
      ],
    });

    const totalModulos = await Modulo.count({ where: { activo: true } });

    const estudiantesConProgreso = estudiantes.map((est) => {
      const modulosCompletados = est.progresos ? est.progresos.filter((p) => p.completado).length : 0;
      return {
        ...est.toJSON(),
        progreso_general: totalModulos > 0 ? Math.round((modulosCompletados / totalModulos) * 100) : 0,
        modulos_completados: modulosCompletados,
        total_modulos: totalModulos,
      };
    });

    res.json({
      success: true,
      data: {
        estudiantes: estudiantesConProgreso,
        paginacion: {
          total: count,
          pagina: parseInt(page),
          total_paginas: Math.ceil(count / limit),
          por_pagina: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los estudiantes.',
    });
  }
};

// PUT /api/admin/usuarios/:id/toggle - Activar/desactivar usuario
const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    if (usuario.rol === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No se puede desactivar a un administrador.',
      });
    }

    await usuario.update({ activo: !usuario.activo });

    res.json({
      success: true,
      message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente.`,
      data: { usuario: usuario.toJSON() },
    });
  } catch (error) {
    console.error('Error al toggle usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario.',
    });
  }
};

// GET /api/admin/exportar - Exportar datos en Excel
const exportarExcel = async (req, res) => {
  try {
    const estudiantes = await Usuario.findAll({
      where: { rol: 'estudiante' },
      attributes: { exclude: ['password'] },
      include: [
        { model: ProgresoModulo, as: 'progresos', include: [{ model: Modulo, as: 'modulo' }] },
        { model: ResultadoQuiz, as: 'resultados', include: [{ model: Modulo, as: 'modulo' }] },
        { model: EncuestaDiagnostica, as: 'encuesta' },
        { model: Certificado, as: 'certificado' },
      ],
      order: [['apellido', 'ASC']],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PhishGuard UTB';
    workbook.created = new Date();

    // Hoja 1: Resumen de Estudiantes
    const sheet1 = workbook.addWorksheet('Estudiantes');
    sheet1.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Semestre', key: 'semestre', width: 12 },
      { header: 'Encuesta (Nivel)', key: 'nivel_encuesta', width: 18 },
      { header: 'Encuesta (Puntaje)', key: 'puntaje_encuesta', width: 18 },
      { header: 'Módulos Completados', key: 'modulos_completados', width: 22 },
      { header: 'Certificado', key: 'certificado', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Fecha Registro', key: 'fecha_registro', width: 18 },
    ];

    // Estilo del encabezado
    sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet1.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1B3A6B' },
    };

    estudiantes.forEach((est) => {
      sheet1.addRow({
        nombre: est.nombre,
        apellido: est.apellido,
        email: est.email,
        semestre: est.semestre || 'N/A',
        nivel_encuesta: est.encuesta ? est.encuesta.nivel : 'No completada',
        puntaje_encuesta: est.encuesta ? `${est.encuesta.puntaje_conocimiento}%` : 'N/A',
        modulos_completados: est.progresos ? est.progresos.filter((p) => p.completado).length : 0,
        certificado: est.certificado ? 'Sí' : 'No',
        estado: est.activo ? 'Activo' : 'Inactivo',
        fecha_registro: est.created_at ? new Date(est.created_at).toLocaleDateString('es-EC') : '',
      });
    });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=phishguard_reporte_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar los datos.',
    });
  }
};

// GET /api/admin/analitica/errores - Preguntas mas falladas
const obtenerErrores = async (req, res) => {
  try {
    const resultados = await ResultadoQuiz.findAll();
    const conteoErrores = {};

    resultados.forEach(r => {
      if (r.respuestas && Array.isArray(r.respuestas)) {
        r.respuestas.forEach(resp => {
          if (!resp.correcta) {
            const key = resp.pregunta_id;
            if (!conteoErrores[key]) {
              conteoErrores[key] = { pregunta_id: key, pregunta_texto: resp.pregunta_texto, errores: 0, total: 0 };
            }
            conteoErrores[key].errores++;
          }
          const key2 = resp.pregunta_id;
          if (!conteoErrores[key2]) {
            conteoErrores[key2] = { pregunta_id: key2, pregunta_texto: resp.pregunta_texto, errores: 0, total: 0 };
          }
          conteoErrores[key2].total++;
        });
      }
    });

    const erroresOrdenados = Object.values(conteoErrores)
      .map(e => ({ ...e, tasa_error: e.total > 0 ? Math.round((e.errores / e.total) * 100) : 0 }))
      .sort((a, b) => b.tasa_error - a.tasa_error)
      .slice(0, 15);

    res.json({ success: true, data: { errores: erroresOrdenados } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener errores.' });
  }
};

// GET /api/admin/analitica/evolucion - Evolucion temporal
const obtenerEvolucion = async (req, res) => {
  try {
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const registros = await Usuario.findAll({
      where: { rol: 'estudiante', created_at: { [Op.gte]: treintaDiasAtras } },
      attributes: ['created_at'],
      order: [['created_at', 'ASC']],
    });

    const quizzes = await ResultadoQuiz.findAll({
      where: { created_at: { [Op.gte]: treintaDiasAtras } },
      attributes: ['created_at', 'aprobado'],
      order: [['created_at', 'ASC']],
    });

    // Agrupar por dia
    const porDia = {};
    registros.forEach(r => {
      const dia = r.created_at.toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = { fecha: dia, registros: 0, quizzes: 0, aprobados: 0 };
      porDia[dia].registros++;
    });
    quizzes.forEach(q => {
      const dia = q.created_at.toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = { fecha: dia, registros: 0, quizzes: 0, aprobados: 0 };
      porDia[dia].quizzes++;
      if (q.aprobado) porDia[dia].aprobados++;
    });

    const evolucion = Object.values(porDia).sort((a, b) => a.fecha.localeCompare(b.fecha));
    res.json({ success: true, data: { evolucion } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error.' });
  }
};

// GET /api/admin/analitica/mejora - Comparativa encuesta vs quiz
const obtenerMejora = async (req, res) => {
  try {
    const estudiantes = await Usuario.findAll({
      where: { rol: 'estudiante' },
      include: [
        { model: EncuestaDiagnostica, as: 'encuesta', attributes: ['puntaje_conocimiento', 'nivel'] },
      ],
    });

    const mejoras = [];
    for (const est of estudiantes) {
      if (!est.encuesta) continue;
      const mejorResultado = await ResultadoQuiz.findOne({
        where: { usuario_id: est.id },
        order: [['puntaje', 'DESC']],
      });
      if (!mejorResultado) continue;

      const puntajeQuiz = Math.round((mejorResultado.puntaje / mejorResultado.total_preguntas) * 100);
      mejoras.push({
        estudiante: `${est.nombre} ${est.apellido}`,
        puntaje_encuesta: est.encuesta.puntaje_conocimiento,
        nivel_encuesta: est.encuesta.nivel,
        mejor_puntaje_quiz: puntajeQuiz,
        mejora: puntajeQuiz - est.encuesta.puntaje_conocimiento,
      });
    }

    mejoras.sort((a, b) => b.mejora - a.mejora);

    const promedioEncuesta = mejoras.length > 0 ? Math.round(mejoras.reduce((s, m) => s + m.puntaje_encuesta, 0) / mejoras.length) : 0;
    const promedioQuiz = mejoras.length > 0 ? Math.round(mejoras.reduce((s, m) => s + m.mejor_puntaje_quiz, 0) / mejoras.length) : 0;

    res.json({
      success: true,
      data: {
        mejoras,
        resumen: { promedio_encuesta: promedioEncuesta, promedio_quiz: promedioQuiz, mejora_promedio: promedioQuiz - promedioEncuesta },
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error.' });
  }
};

module.exports = {
  obtenerEstadisticas,
  listarEstudiantes,
  toggleUsuario,
  exportarExcel,
  obtenerErrores,
  obtenerEvolucion,
  obtenerMejora,
};
