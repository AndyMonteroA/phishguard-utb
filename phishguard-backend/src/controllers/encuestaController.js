// ============================================================
// PhishGuard UTB - Controlador: Encuesta Diagnóstica
// ============================================================

const { EncuestaDiagnostica, Usuario } = require('../models');
const { verificarLogros } = require('./logroController');

// Preguntas de la encuesta diagnóstica (Anexo A del proyecto)
const PREGUNTAS_ENCUESTA = [
  {
    id: 1,
    seccion: 'Conocimiento sobre Ingeniería Social',
    pregunta: '¿Ha escuchado el término "Ingeniería Social" en el contexto de la ciberseguridad?',
    opciones: [
      { id: 'a', texto: 'Sí, lo conozco bien y puedo explicarlo', puntaje: 3 },
      { id: 'b', texto: 'Lo he escuchado pero no lo entiendo del todo', puntaje: 1 },
      { id: 'c', texto: 'No lo había escuchado antes', puntaje: 0 },
    ],
  },
  {
    id: 2,
    seccion: 'Conocimiento sobre Ingeniería Social',
    pregunta: '¿Qué es el phishing?',
    opciones: [
      { id: 'a', texto: 'Un tipo de virus informático que daña archivos', puntaje: 0 },
      { id: 'b', texto: 'Un correo o mensaje falso diseñado para robar información', puntaje: 3 },
      { id: 'c', texto: 'Una herramienta de protección para contraseñas', puntaje: 0 },
      { id: 'd', texto: 'No lo sé', puntaje: 0 },
    ],
  },
  {
    id: 3,
    seccion: 'Conocimiento sobre Ingeniería Social',
    pregunta: '¿Qué es el pretexting?',
    opciones: [
      { id: 'a', texto: 'Crear una historia falsa para obtener información de alguien', puntaje: 3 },
      { id: 'b', texto: 'Un ataque directo a servidores web', puntaje: 0 },
      { id: 'c', texto: 'Un método de cifrado de datos', puntaje: 0 },
      { id: 'd', texto: 'No lo sé', puntaje: 0 },
    ],
  },
  {
    id: 4,
    seccion: 'Conocimiento sobre Ingeniería Social',
    pregunta: '¿Qué es el vishing?',
    opciones: [
      { id: 'a', texto: 'Un ataque de virus a través de redes Wi-Fi', puntaje: 0 },
      { id: 'b', texto: 'Un fraude realizado mediante llamadas telefónicas', puntaje: 3 },
      { id: 'c', texto: 'Un programa de seguridad para dispositivos móviles', puntaje: 0 },
      { id: 'd', texto: 'No lo sé', puntaje: 0 },
    ],
  },
  {
    id: 5,
    seccion: 'Conocimiento sobre Ingeniería Social',
    pregunta: '¿Qué es el baiting?',
    opciones: [
      { id: 'a', texto: 'Un ataque que usa dispositivos físicos (como USB) como cebo', puntaje: 3 },
      { id: 'b', texto: 'Un sistema de autenticación de dos factores', puntaje: 0 },
      { id: 'c', texto: 'Una técnica de respaldo de datos', puntaje: 0 },
      { id: 'd', texto: 'No lo sé', puntaje: 0 },
    ],
  },
  {
    id: 6,
    seccion: 'Percepción y Experiencia',
    pregunta: '¿Ha recibido alguna vez un correo o mensaje sospechoso que podría ser un intento de phishing?',
    opciones: [
      { id: 'a', texto: 'Sí, lo identifiqué y no hice clic en ningún enlace', puntaje: 3 },
      { id: 'b', texto: 'Sí, pero no estaba seguro/a de si era legítimo', puntaje: 1 },
      { id: 'c', texto: 'No estoy seguro/a si he recibido alguno', puntaje: 0 },
      { id: 'd', texto: 'No he recibido mensajes de ese tipo', puntaje: 0 },
    ],
  },
  {
    id: 7,
    seccion: 'Percepción y Experiencia',
    pregunta: '¿Considera que un estudiante universitario de Sistemas de Información está en riesgo de caer en un ataque de Ingeniería Social?',
    opciones: [
      { id: 'a', texto: 'Sí, todos somos vulnerables independientemente de nuestros conocimientos técnicos', puntaje: 3 },
      { id: 'b', texto: 'Solo si no tiene conocimientos en ciberseguridad', puntaje: 1 },
      { id: 'c', texto: 'No, los estudiantes de Sistemas tienen suficiente preparación', puntaje: 0 },
      { id: 'd', texto: 'No lo había considerado', puntaje: 0 },
    ],
  },
  {
    id: 8,
    seccion: 'Percepción y Experiencia',
    pregunta: '¿Le gustaría fortalecer sus conocimientos sobre Ingeniería Social a través de una plataforma web interactiva?',
    opciones: [
      { id: 'a', texto: 'Sí, me parece muy útil', puntaje: 3 },
      { id: 'b', texto: 'Posiblemente, dependiendo del contenido', puntaje: 1 },
      { id: 'c', texto: 'No tengo interés en este tema', puntaje: 0 },
    ],
  },
];

// GET /api/encuesta - Obtener preguntas de la encuesta
const obtenerEncuesta = async (req, res) => {
  try {
    // Verificar si el usuario ya completó la encuesta
    const encuestaExistente = await EncuestaDiagnostica.findOne({
      where: { usuario_id: req.usuarioId },
    });

    if (encuestaExistente) {
      return res.json({
        success: true,
        data: {
          completada: true,
          resultado: {
            puntaje: encuestaExistente.puntaje_conocimiento,
            nivel: encuestaExistente.nivel,
          },
        },
      });
    }

    // Enviar preguntas sin puntajes
    const preguntasSinPuntaje = PREGUNTAS_ENCUESTA.map((p) => ({
      id: p.id,
      seccion: p.seccion,
      pregunta: p.pregunta,
      opciones: p.opciones.map((o) => ({ id: o.id, texto: o.texto })),
    }));

    res.json({
      success: true,
      data: {
        completada: false,
        preguntas: preguntasSinPuntaje,
        total: preguntasSinPuntaje.length,
      },
    });
  } catch (error) {
    console.error('Error al obtener encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la encuesta diagnóstica.',
    });
  }
};

// POST /api/encuesta - Enviar respuestas de la encuesta
const enviarEncuesta = async (req, res) => {
  try {
    const { respuestas } = req.body;
    const usuarioId = req.usuarioId;

    // Verificar si ya completó la encuesta
    const existente = await EncuestaDiagnostica.findOne({
      where: { usuario_id: usuarioId },
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Ya has completado la encuesta diagnóstica.',
      });
    }

    // Calcular puntaje
    let puntajeTotal = 0;
    const puntajeMaximo = PREGUNTAS_ENCUESTA.reduce((acc, p) => {
      const maxPuntaje = Math.max(...p.opciones.map((o) => o.puntaje));
      return acc + maxPuntaje;
    }, 0);

    respuestas.forEach((resp) => {
      const pregunta = PREGUNTAS_ENCUESTA.find((p) => p.id === resp.pregunta_id);
      if (pregunta) {
        const opcion = pregunta.opciones.find((o) => o.id === resp.respuesta);
        if (opcion) {
          puntajeTotal += opcion.puntaje;
        }
      }
    });

    const porcentaje = Math.round((puntajeTotal / puntajeMaximo) * 100);

    // Determinar nivel
    let nivel;
    if (porcentaje >= 70) nivel = 'alto';
    else if (porcentaje >= 40) nivel = 'medio';
    else nivel = 'bajo';

    // Guardar encuesta
    const encuesta = await EncuestaDiagnostica.create({
      usuario_id: usuarioId,
      respuestas,
      puntaje_conocimiento: porcentaje,
      nivel,
    });

    // Marcar encuesta como completada en el perfil del usuario
    await Usuario.update(
      { encuesta_completada: true },
      { where: { id: usuarioId } }
    );

    // Verificar logros
    await verificarLogros(usuarioId);

    res.status(201).json({
      success: true,
      message: 'Encuesta completada exitosamente.',
      data: {
        puntaje: porcentaje,
        nivel,
        interpretacion:
          nivel === 'alto'
            ? 'Excelente. Tienes un buen nivel de conocimiento sobre Ingenieria Social.'
            : nivel === 'medio'
            ? 'Tienes conocimientos basicos. Los modulos te ayudaran a profundizar.'
            : 'Nivel inicial. Los modulos de PhishGuard UTB te ayudaran mucho.',
      },
    });
  } catch (error) {
    console.error('Error al enviar encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la encuesta.',
    });
  }
};

module.exports = {
  obtenerEncuesta,
  enviarEncuesta,
  PREGUNTAS_ENCUESTA,
};
