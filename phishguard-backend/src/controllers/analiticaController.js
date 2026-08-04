// ============================================================
// PhishGuard UTB - Controlador: Analítica Avanzada
// Learning Analytics & BI para el módulo Admin
// ============================================================

const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const {
  Usuario, Modulo, Pregunta, ProgresoModulo,
  ResultadoQuiz, EncuestaDiagnostica, Certificado,
} = require('../models');

// ============================================================
// HELPERS
// ============================================================

/** Construye el WHERE de filtro de usuarios según query params */
const buildUserFilter = (query) => {
  const where = { rol: 'estudiante' };
  if (query.genero && query.genero !== 'todos') where.genero = query.genero;
  if (query.semestre && query.semestre !== 'todos') where.semestre = parseInt(query.semestre);
  if (query.estado === 'activo') where.activo = true;
  if (query.estado === 'inactivo') where.activo = false;
  return where;
};

/** Calcula nivel a partir de porcentaje */
const calcularNivel = (pct) => {
  if (pct >= 90) return 'Excelente';
  if (pct >= 70) return 'Alto';
  if (pct >= 50) return 'Medio';
  if (pct >= 30) return 'Bajo';
  return 'Muy Bajo';
};

/** Calcula estadísticas de un array de números */
const calcStats = (arr) => {
  if (!arr.length) return { promedio: 0, mediana: 0, desviacion: 0, min: 0, max: 0, total: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = sorted.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
  return {
    promedio: Math.round(mean * 10) / 10,
    mediana: Math.round(median * 10) / 10,
    desviacion: Math.round(Math.sqrt(variance) * 10) / 10,
    min: sorted[0],
    max: sorted[n - 1],
    total: n,
  };
};

// ============================================================
// 1. DASHBOARD KPIs
// ============================================================
const obtenerKPIs = async (req, res) => {
  try {
    const totalEstudiantes = await Usuario.count({ where: { rol: 'estudiante' } });
    const estudiantesActivos = await Usuario.count({ where: { rol: 'estudiante', activo: true } });
    const estudiantesInactivos = totalEstudiantes - estudiantesActivos;
    const totalEvaluaciones = await ResultadoQuiz.count();
    const quizzesAprobados = await ResultadoQuiz.count({ where: { aprobado: true } });
    const tasaAprobacion = totalEvaluaciones > 0 ? Math.round((quizzesAprobados / totalEvaluaciones) * 100) : 0;
    const encuestasCompletadas = await EncuestaDiagnostica.count();
    const certificadosEmitidos = await Certificado.count();

    // Promedio general
    const resultados = await ResultadoQuiz.findAll({ attributes: ['puntaje', 'total_preguntas', 'tiempo_empleado'] });
    const porcentajes = resultados.map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
    const promedioGeneral = porcentajes.length > 0 ? Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length) : 0;
    const nivelPromedio = calcularNivel(promedioGeneral);

    // Tiempo promedio por evaluación
    const tiempos = resultados.filter(r => r.tiempo_empleado).map(r => r.tiempo_empleado);
    const tiempoPromedio = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

    // Intentos promedio
    const intentosPorEstudiante = await ResultadoQuiz.findAll({
      attributes: ['usuario_id', [fn('COUNT', col('id')), 'intentos']],
      group: ['usuario_id'],
    });
    const intentosPromedio = intentosPorEstudiante.length > 0
      ? Math.round(intentosPorEstudiante.reduce((s, i) => s + parseInt(i.dataValues.intentos), 0) / intentosPorEstudiante.length * 10) / 10
      : 0;

    // Mejor y peor módulo
    const modulos = await Modulo.findAll({ where: { activo: true }, order: [['orden', 'ASC']] });
    const rendimientoModulos = [];
    for (const mod of modulos) {
      const resModulo = await ResultadoQuiz.findAll({ where: { modulo_id: mod.id }, attributes: ['puntaje', 'total_preguntas'] });
      const pcts = resModulo.map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
      const avg = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
      rendimientoModulos.push({ id: mod.id, titulo: mod.titulo, promedio: avg, total: pcts.length });
    }
    const mejorModulo = rendimientoModulos.filter(m => m.total > 0).sort((a, b) => b.promedio - a.promedio)[0] || null;
    const peorModulo = rendimientoModulos.filter(m => m.total > 0).sort((a, b) => a.promedio - b.promedio)[0] || null;

    // Pregunta con mayor error y mayor acierto
    const todosResultados = await ResultadoQuiz.findAll({ attributes: ['respuestas'] });
    const preguntaStats = {};
    todosResultados.forEach(r => {
      if (r.respuestas && Array.isArray(r.respuestas)) {
        r.respuestas.forEach(resp => {
          const k = resp.pregunta_id;
          if (!preguntaStats[k]) preguntaStats[k] = { texto: resp.pregunta_texto, errores: 0, aciertos: 0, total: 0 };
          preguntaStats[k].total++;
          if (resp.correcta) preguntaStats[k].aciertos++;
          else preguntaStats[k].errores++;
        });
      }
    });
    const preguntasArr = Object.values(preguntaStats).filter(p => p.total > 0);
    const mayorError = preguntasArr.sort((a, b) => (b.errores / b.total) - (a.errores / a.total))[0] || null;
    const mayorAcierto = preguntasArr.sort((a, b) => (b.aciertos / b.total) - (a.aciertos / a.total))[0] || null;

    // Progreso promedio del curso
    const totalModulosActivos = modulos.length;
    const estudiantesConProgreso = await Usuario.findAll({
      where: { rol: 'estudiante' },
      include: [{ model: ProgresoModulo, as: 'progresos', where: { completado: true }, required: false }],
    });
    const progresosIndividuales = estudiantesConProgreso.map(e => 
      totalModulosActivos > 0 ? Math.round(((e.progresos?.length || 0) / totalModulosActivos) * 100) : 0
    );
    const progresoCurso = progresosIndividuales.length > 0
      ? Math.round(progresosIndividuales.reduce((a, b) => a + b, 0) / progresosIndividuales.length)
      : 0;

    // Distribución niveles encuesta
    const nivelesEncuesta = await EncuestaDiagnostica.findAll({
      attributes: ['nivel', [fn('COUNT', col('nivel')), 'cantidad']],
      group: ['nivel'],
    });

    res.json({
      success: true,
      data: {
        totalEstudiantes,
        estudiantesActivos,
        estudiantesInactivos,
        totalEvaluaciones,
        tasaAprobacion,
        promedioGeneral,
        nivelPromedio,
        tiempoPromedio,
        intentosPromedio,
        encuestasCompletadas,
        certificadosEmitidos,
        mejorModulo,
        peorModulo,
        mayorError: mayorError ? { texto: mayorError.texto?.substring(0, 80), tasa: Math.round((mayorError.errores / mayorError.total) * 100) } : null,
        mayorAcierto: mayorAcierto ? { texto: mayorAcierto.texto?.substring(0, 80), tasa: Math.round((mayorAcierto.aciertos / mayorAcierto.total) * 100) } : null,
        progresoCurso,
        nivelesEncuesta,
        rendimientoModulos,
      },
    });
  } catch (error) {
    console.error('Error KPIs:', error);
    res.status(500).json({ success: false, message: 'Error al obtener KPIs.' });
  }
};

// ============================================================
// 2. NIVEL DE CONOCIMIENTO (Encuesta diagnóstica con filtros)
// ============================================================
const obtenerNivelConocimiento = async (req, res) => {
  try {
    const { PREGUNTAS_ENCUESTA } = require('./encuestaController');
    const userWhere = buildUserFilter(req.query);
    const usuarios = await Usuario.findAll({
      where: userWhere,
      include: [{
        model: EncuestaDiagnostica,
        as: 'encuesta',
        required: true,
      }],
    });

    // Distribución general
    const niveles = { bajo: 0, medio: 0, alto: 0 };
    const puntajes = [];
    usuarios.forEach(u => {
      if (u.encuesta) {
        niveles[u.encuesta.nivel] = (niveles[u.encuesta.nivel] || 0) + 1;
        puntajes.push(u.encuesta.puntaje_conocimiento);
      }
    });

    const stats = calcStats(puntajes);

    // Análisis detallado por pregunta usando las preguntas reales
    const analisisPorPregunta = PREGUNTAS_ENCUESTA.map(pregDef => {
      const conteoOpciones = {};
      pregDef.opciones.forEach(o => { conteoOpciones[o.id] = 0; });
      let totalResp = 0;
      let aciertos = 0;

      // Encontrar la opción "correcta" (la de mayor puntaje)
      const mejorOpcion = pregDef.opciones.reduce((best, o) => o.puntaje > best.puntaje ? o : best, pregDef.opciones[0]);

      usuarios.forEach(u => {
        if (u.encuesta?.respuestas && Array.isArray(u.encuesta.respuestas)) {
          const resp = u.encuesta.respuestas.find(r => r.pregunta_id === pregDef.id);
          if (resp) {
            totalResp++;
            const seleccion = resp.respuesta;
            conteoOpciones[seleccion] = (conteoOpciones[seleccion] || 0) + 1;
            if (seleccion === mejorOpcion.id) aciertos++;
          }
        }
      });

      const errores = totalResp - aciertos;
      const tasaAcierto = totalResp > 0 ? Math.round((aciertos / totalResp) * 100) : 0;

      // Respuesta incorrecta más seleccionada
      let errorMasComun = null;
      let maxErrores = 0;
      Object.entries(conteoOpciones).forEach(([opId, count]) => {
        if (opId !== mejorOpcion.id && count > maxErrores) {
          maxErrores = count;
          errorMasComun = pregDef.opciones.find(o => o.id === opId);
        }
      });

      return {
        id: pregDef.id,
        seccion: pregDef.seccion,
        pregunta: pregDef.pregunta,
        respuesta_correcta: mejorOpcion.texto,
        error_mas_comun: errorMasComun ? errorMasComun.texto : 'N/A',
        error_mas_comun_count: maxErrores,
        aciertos,
        errores,
        total: totalResp,
        tasa_acierto: tasaAcierto,
        tasa_error: totalResp > 0 ? 100 - tasaAcierto : 0,
        opciones_detalle: pregDef.opciones.map(o => ({
          id: o.id,
          texto: o.texto,
          seleccionada: conteoOpciones[o.id] || 0,
          porcentaje: totalResp > 0 ? Math.round(((conteoOpciones[o.id] || 0) / totalResp) * 100) : 0,
          es_correcta: o.id === mejorOpcion.id,
        })),
      };
    });

    res.json({
      success: true,
      data: {
        total: usuarios.length,
        distribucion: niveles,
        estadisticas: stats,
        analisisPorPregunta,
      },
    });
  } catch (error) {
    console.error('Error nivel conocimiento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener nivel de conocimiento.' });
  }
};

// ============================================================
// 3. ERRORES FRECUENTES (Mejorado con filtros)
// ============================================================
const obtenerErroresAvanzados = async (req, res) => {
  try {
    const { modulo, genero, semestre, ordenar = 'mayor_error', limite = 20 } = req.query;

    // Filtrar resultados
    const quizWhere = {};
    if (modulo && modulo !== 'todos') quizWhere.modulo_id = parseInt(modulo);

    // Si hay filtros de usuario, obtener IDs
    let userIds = null;
    if ((genero && genero !== 'todos') || (semestre && semestre !== 'todos')) {
      const userWhere = { rol: 'estudiante' };
      if (genero && genero !== 'todos') userWhere.genero = genero;
      if (semestre && semestre !== 'todos') userWhere.semestre = parseInt(semestre);
      const users = await Usuario.findAll({ where: userWhere, attributes: ['id'] });
      userIds = users.map(u => u.id);
      if (userIds.length > 0) quizWhere.usuario_id = { [Op.in]: userIds };
      else return res.json({ success: true, data: { errores: [], total: 0 } });
    }

    const resultados = await ResultadoQuiz.findAll({ where: quizWhere, attributes: ['respuestas'] });

    const conteoErrores = {};
    resultados.forEach(r => {
      if (r.respuestas && Array.isArray(r.respuestas)) {
        r.respuestas.forEach(resp => {
          const key = resp.pregunta_id;
          if (!conteoErrores[key]) {
            conteoErrores[key] = {
              pregunta_id: key,
              pregunta_texto: resp.pregunta_texto,
              respuesta_correcta: resp.respuesta_correcta,
              opciones: resp.opciones,
              errores: 0,
              aciertos: 0,
              total: 0,
              respuestas_incorrectas: {},
              estudiantes_que_fallaron: new Set(),
            };
          }
          conteoErrores[key].total++;
          if (resp.correcta) {
            conteoErrores[key].aciertos++;
          } else {
            conteoErrores[key].errores++;
            conteoErrores[key].estudiantes_que_fallaron.add(resp.pregunta_id);
            // Contar respuesta incorrecta más seleccionada
            const respInc = resp.respuesta_usuario;
            conteoErrores[key].respuestas_incorrectas[respInc] = (conteoErrores[key].respuestas_incorrectas[respInc] || 0) + 1;
          }
        });
      }
    });

    let erroresArr = Object.values(conteoErrores).map(e => {
      // Encontrar respuesta incorrecta más seleccionada
      const respIncorrectas = Object.entries(e.respuestas_incorrectas);
      const masSeleccionada = respIncorrectas.sort((a, b) => b[1] - a[1])[0];
      const masSeleccionadaTexto = masSeleccionada
        ? e.opciones?.find(o => o.id === masSeleccionada[0])?.texto || masSeleccionada[0]
        : 'N/A';
      const respCorrectaTexto = e.opciones?.find(o => o.id === e.respuesta_correcta)?.texto || e.respuesta_correcta;

      const tasaError = e.total > 0 ? Math.round((e.errores / e.total) * 100) : 0;

      return {
        pregunta_id: e.pregunta_id,
        pregunta_texto: e.pregunta_texto,
        respuesta_correcta: respCorrectaTexto,
        respuesta_incorrecta_comun: masSeleccionadaTexto,
        respuesta_incorrecta_count: masSeleccionada ? masSeleccionada[1] : 0,
        errores: e.errores,
        aciertos: e.aciertos,
        total: e.total,
        tasa_error: tasaError,
        nivel_dificultad: tasaError >= 60 ? 'Difícil' : tasaError >= 40 ? 'Moderada' : 'Fácil',
      };
    });

    // Ordenar
    switch (ordenar) {
      case 'menor_error': erroresArr.sort((a, b) => a.tasa_error - b.tasa_error); break;
      case 'mas_respondidas': erroresArr.sort((a, b) => b.total - a.total); break;
      case 'menos_respondidas': erroresArr.sort((a, b) => a.total - b.total); break;
      default: erroresArr.sort((a, b) => b.tasa_error - a.tasa_error);
    }

    erroresArr = erroresArr.slice(0, parseInt(limite));

    res.json({ success: true, data: { errores: erroresArr, total: erroresArr.length } });
  } catch (error) {
    console.error('Error errores avanzados:', error);
    res.status(500).json({ success: false, message: 'Error al obtener errores.' });
  }
};

// ============================================================
// 4. RENDIMIENTO (por género, semestre, módulo)
// ============================================================
const obtenerRendimiento = async (req, res) => {
  try {
    const { tipo = 'genero' } = req.query;
    const modulos = await Modulo.findAll({ where: { activo: true }, order: [['orden', 'ASC']] });

    if (tipo === 'modulo') {
      // Rendimiento por módulo
      const datos = [];
      for (const mod of modulos) {
        const resultados = await ResultadoQuiz.findAll({
          where: { modulo_id: mod.id },
          attributes: ['puntaje', 'total_preguntas', 'aprobado', 'tiempo_empleado'],
        });
        const pcts = resultados.map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
        const stats = calcStats(pcts);
        const aprobados = resultados.filter(r => r.aprobado).length;
        const tiempos = resultados.filter(r => r.tiempo_empleado).map(r => r.tiempo_empleado);
        const tiempoPromedio = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

        datos.push({
          grupo: mod.titulo,
          ...stats,
          porcentaje_aprobacion: resultados.length > 0 ? Math.round((aprobados / resultados.length) * 100) : 0,
          tiempo_promedio: tiempoPromedio,
          nivel: calcularNivel(stats.promedio),
          evaluaciones: resultados.length,
        });
      }
      return res.json({ success: true, data: { tipo, datos } });
    }

    // Rendimiento por género o semestre
    const groupField = tipo === 'genero' ? 'genero' : 'semestre';
    const estudiantes = await Usuario.findAll({
      where: { rol: 'estudiante' },
      attributes: ['id', groupField],
    });

    const grupos = {};
    estudiantes.forEach(e => {
      const key = e[groupField] || 'No especificado';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(e.id);
    });

    const datos = [];
    for (const [grupo, ids] of Object.entries(grupos)) {
      const resultados = await ResultadoQuiz.findAll({
        where: { usuario_id: { [Op.in]: ids } },
        attributes: ['puntaje', 'total_preguntas', 'aprobado', 'tiempo_empleado'],
      });
      const pcts = resultados.map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
      const stats = calcStats(pcts);
      const aprobados = resultados.filter(r => r.aprobado).length;
      const tiempos = resultados.filter(r => r.tiempo_empleado).map(r => r.tiempo_empleado);
      const tiempoPromedio = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

      let label = grupo;
      if (tipo === 'genero') {
        const labels = { masculino: 'Masculino', femenino: 'Femenino', prefiero_no_indicar: 'Prefiere no indicar' };
        label = labels[grupo] || grupo;
      } else if (tipo === 'semestre') {
        label = `${grupo}° Semestre`;
      }

      datos.push({
        grupo: label,
        grupo_key: grupo,
        estudiantes: ids.length,
        ...stats,
        porcentaje_aprobacion: resultados.length > 0 ? Math.round((aprobados / resultados.length) * 100) : 0,
        tiempo_promedio: tiempoPromedio,
        nivel: calcularNivel(stats.promedio),
        evaluaciones: resultados.length,
      });
    }

    datos.sort((a, b) => b.promedio - a.promedio);

    res.json({ success: true, data: { tipo, datos } });
  } catch (error) {
    console.error('Error rendimiento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener rendimiento.' });
  }
};

// ============================================================
// 5. EVOLUCIÓN DEL APRENDIZAJE
// ============================================================
const obtenerEvolucionAprendizaje = async (req, res) => {
  try {
    const userWhere = buildUserFilter(req.query);
    const { estudiante } = req.query;
    if (estudiante && estudiante !== 'todos') userWhere.id = parseInt(estudiante);

    const usuarios = await Usuario.findAll({
      where: userWhere,
      include: [
        { model: EncuestaDiagnostica, as: 'encuesta' },
        { model: ResultadoQuiz, as: 'resultados', include: [{ model: Modulo, as: 'modulo' }] },
        { model: ProgresoModulo, as: 'progresos' },
      ],
    });

    const modulos = await Modulo.findAll({ where: { activo: true }, order: [['orden', 'ASC']] });

    const evoluciones = [];
    for (const u of usuarios) {
      if (!u.encuesta) continue;

      const notaInicial = u.encuesta.puntaje_conocimiento || 0;
      const nivelInicial = u.encuesta.nivel || 'bajo';

      // Mejor resultado por módulo, ordenados por orden del módulo
      const resultadosPorModulo = [];
      for (const mod of modulos) {
        const resModulo = (u.resultados || []).filter(r => r.modulo_id === mod.id);
        if (resModulo.length > 0) {
          const mejor = resModulo.sort((a, b) => b.puntaje - a.puntaje)[0];
          resultadosPorModulo.push({
            modulo_id: mod.id,
            modulo_titulo: mod.titulo,
            puntaje: Math.round((mejor.puntaje / mejor.total_preguntas) * 100),
            aprobado: mejor.aprobado,
            intentos: resModulo.length,
            tiempo: mejor.tiempo_empleado || 0,
          });
        }
      }

      if (resultadosPorModulo.length === 0) continue;

      const notaFinal = resultadosPorModulo[resultadosPorModulo.length - 1].puntaje;
      const nivelFinal = calcularNivel(notaFinal);
      const modulosCompletados = (u.progresos || []).filter(p => p.completado).length;
      const totalIntentos = resultadosPorModulo.reduce((s, r) => s + r.intentos, 0);
      const tiempoTotal = resultadosPorModulo.reduce((s, r) => s + r.tiempo, 0);

      evoluciones.push({
        estudiante_id: u.id,
        estudiante: `${u.nombre} ${u.apellido}`,
        semestre: u.semestre,
        genero: u.genero,
        nota_inicial: notaInicial,
        nivel_inicial: nivelInicial,
        nota_final: notaFinal,
        nivel_final: nivelFinal,
        incremento_porcentual: notaFinal - notaInicial,
        modulos_completados: modulosCompletados,
        total_modulos: modulos.length,
        total_intentos: totalIntentos,
        tiempo_total: tiempoTotal,
        progresion: [
          { etapa: 'Diagnóstico', puntaje: notaInicial },
          ...resultadosPorModulo.map(r => ({ etapa: r.modulo_titulo, puntaje: r.puntaje })),
        ],
        detalle_modulos: resultadosPorModulo,
      });
    }

    evoluciones.sort((a, b) => b.incremento_porcentual - a.incremento_porcentual);

    // Resumen general
    const incrementos = evoluciones.map(e => e.incremento_porcentual);
    const statsIncremento = calcStats(incrementos);
    const mejoraron = evoluciones.filter(e => e.incremento_porcentual > 0).length;
    const empeoraron = evoluciones.filter(e => e.incremento_porcentual < 0).length;
    const iguales = evoluciones.filter(e => e.incremento_porcentual === 0).length;

    res.json({
      success: true,
      data: {
        evoluciones,
        resumen: {
          total: evoluciones.length,
          mejoraron,
          empeoraron,
          iguales,
          incremento_promedio: statsIncremento.promedio,
          nota_inicial_promedio: evoluciones.length > 0
            ? Math.round(evoluciones.reduce((s, e) => s + e.nota_inicial, 0) / evoluciones.length)
            : 0,
          nota_final_promedio: evoluciones.length > 0
            ? Math.round(evoluciones.reduce((s, e) => s + e.nota_final, 0) / evoluciones.length)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error evolución:', error);
    res.status(500).json({ success: false, message: 'Error al obtener evolución.' });
  }
};

// ============================================================
// 6. COMPARACIONES (género vs género, semestre vs semestre, etc.)
// ============================================================
const obtenerComparaciones = async (req, res) => {
  try {
    const { tipo = 'genero' } = req.query;

    // Reutilizamos la lógica de rendimiento
    const modulos = await Modulo.findAll({ where: { activo: true }, order: [['orden', 'ASC']] });

    if (tipo === 'modulo') {
      const datos = [];
      for (const mod of modulos) {
        const resultados = await ResultadoQuiz.findAll({
          where: { modulo_id: mod.id },
          attributes: ['puntaje', 'total_preguntas', 'aprobado', 'tiempo_empleado'],
        });
        const pcts = resultados.map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
        const stats = calcStats(pcts);
        const aprobados = resultados.filter(r => r.aprobado).length;
        const tiempos = resultados.filter(r => r.tiempo_empleado).map(r => r.tiempo_empleado);

        datos.push({
          grupo: mod.titulo,
          ...stats,
          porcentaje_aprobacion: resultados.length > 0 ? Math.round((aprobados / resultados.length) * 100) : 0,
          tiempo_promedio: tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0,
          nivel: calcularNivel(stats.promedio),
        });
      }
      return res.json({ success: true, data: { tipo, comparaciones: datos } });
    }

    const groupField = tipo === 'genero' ? 'genero' : 'semestre';
    const estudiantes = await Usuario.findAll({
      where: { rol: 'estudiante' },
      attributes: ['id', groupField],
    });

    const grupos = {};
    estudiantes.forEach(e => {
      const key = e[groupField] || 'No especificado';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(e.id);
    });

    const comparaciones = [];
    for (const [grupo, ids] of Object.entries(grupos)) {
      const resultados = await ResultadoQuiz.findAll({
        where: { usuario_id: { [Op.in]: ids } },
        attributes: ['puntaje', 'total_preguntas', 'aprobado', 'tiempo_empleado'],
      });
      const pcts = resultados.map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
      const stats = calcStats(pcts);
      const aprobados = resultados.filter(r => r.aprobado).length;
      const tiempos = resultados.filter(r => r.tiempo_empleado).map(r => r.tiempo_empleado);

      let label = grupo;
      if (tipo === 'genero') {
        label = { masculino: 'Masculino', femenino: 'Femenino', prefiero_no_indicar: 'Prefiere no indicar' }[grupo] || grupo;
      } else {
        label = `${grupo}° Semestre`;
      }

      comparaciones.push({
        grupo: label,
        estudiantes: ids.length,
        ...stats,
        porcentaje_aprobacion: resultados.length > 0 ? Math.round((aprobados / resultados.length) * 100) : 0,
        tiempo_promedio: tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0,
        nivel: calcularNivel(stats.promedio),
      });
    }

    comparaciones.sort((a, b) => b.promedio - a.promedio);

    res.json({ success: true, data: { tipo, comparaciones } });
  } catch (error) {
    console.error('Error comparaciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener comparaciones.' });
  }
};

// ============================================================
// 7. EXPORTAR (Excel / CSV mejorado)
// ============================================================
const exportarDatos = async (req, res) => {
  try {
    const { formato = 'xlsx', seccion = 'general' } = req.query;
    const ExcelJS = require('exceljs');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PhishGuard UTB';
    workbook.created = new Date();

    const headerStyle = { bold: true, color: { argb: 'FFFFFF' } };
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B3A6B' } };

    // Hoja: Estudiantes
    const sheet1 = workbook.addWorksheet('Estudiantes');
    sheet1.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Semestre', key: 'semestre', width: 12 },
      { header: 'Género', key: 'genero', width: 18 },
      { header: 'Nivel Encuesta', key: 'nivel_encuesta', width: 18 },
      { header: 'Puntaje Encuesta', key: 'puntaje_encuesta', width: 18 },
      { header: 'Módulos Completados', key: 'modulos_completados', width: 22 },
      { header: 'Promedio Quizzes', key: 'promedio_quiz', width: 18 },
      { header: 'Certificado', key: 'certificado', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Fecha Registro', key: 'fecha_registro', width: 18 },
    ];
    sheet1.getRow(1).font = headerStyle;
    sheet1.getRow(1).fill = headerFill;

    const estudiantes = await Usuario.findAll({
      where: { rol: 'estudiante' },
      attributes: { exclude: ['password'] },
      include: [
        { model: ProgresoModulo, as: 'progresos' },
        { model: ResultadoQuiz, as: 'resultados' },
        { model: EncuestaDiagnostica, as: 'encuesta' },
        { model: Certificado, as: 'certificado' },
      ],
      order: [['apellido', 'ASC']],
    });

    estudiantes.forEach(est => {
      const pcts = (est.resultados || []).map(r => Math.round((r.puntaje / r.total_preguntas) * 100));
      const promQuiz = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;

      sheet1.addRow({
        nombre: est.nombre,
        apellido: est.apellido,
        email: est.email,
        semestre: est.semestre || 'N/A',
        genero: est.genero || 'N/A',
        nivel_encuesta: est.encuesta?.nivel || 'No completada',
        puntaje_encuesta: est.encuesta ? `${est.encuesta.puntaje_conocimiento}%` : 'N/A',
        modulos_completados: (est.progresos || []).filter(p => p.completado).length,
        promedio_quiz: `${promQuiz}%`,
        certificado: est.certificado ? 'Sí' : 'No',
        estado: est.activo ? 'Activo' : 'Inactivo',
        fecha_registro: est.created_at ? new Date(est.created_at).toLocaleDateString('es-EC') : '',
      });
    });

    // Hoja: Resultados Quizzes
    const sheet2 = workbook.addWorksheet('Resultados Quizzes');
    sheet2.columns = [
      { header: 'Estudiante', key: 'estudiante', width: 30 },
      { header: 'Módulo', key: 'modulo', width: 25 },
      { header: 'Puntaje', key: 'puntaje', width: 12 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Porcentaje', key: 'porcentaje', width: 12 },
      { header: 'Aprobado', key: 'aprobado', width: 12 },
      { header: 'Tiempo (seg)', key: 'tiempo', width: 14 },
      { header: 'Fecha', key: 'fecha', width: 18 },
    ];
    sheet2.getRow(1).font = headerStyle;
    sheet2.getRow(1).fill = headerFill;

    const todosResultados = await ResultadoQuiz.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] },
        { model: Modulo, as: 'modulo', attributes: ['titulo'] },
      ],
      order: [['created_at', 'DESC']],
    });

    todosResultados.forEach(r => {
      sheet2.addRow({
        estudiante: `${r.usuario?.nombre || ''} ${r.usuario?.apellido || ''}`,
        modulo: r.modulo?.titulo || '',
        puntaje: r.puntaje,
        total: r.total_preguntas,
        porcentaje: `${Math.round((r.puntaje / r.total_preguntas) * 100)}%`,
        aprobado: r.aprobado ? 'Sí' : 'No',
        tiempo: r.tiempo_empleado || 'N/A',
        fecha: r.created_at ? new Date(r.created_at).toLocaleDateString('es-EC') : '',
      });
    });

    if (formato === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=phishguard_reporte_${Date.now()}.csv`);
      // Generar CSV simple de la hoja 1
      const rows = [sheet1.columns.map(c => c.header).join(',')];
      sheet1.eachRow((row, rowNumber) => {
        if (rowNumber > 1) rows.push(row.values.slice(1).join(','));
      });
      return res.send(rows.join('\n'));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=phishguard_reporte_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportar:', error);
    res.status(500).json({ success: false, message: 'Error al exportar datos.' });
  }
};

module.exports = {
  obtenerKPIs,
  obtenerNivelConocimiento,
  obtenerErroresAvanzados,
  obtenerRendimiento,
  obtenerEvolucionAprendizaje,
  obtenerComparaciones,
  exportarDatos,
};
