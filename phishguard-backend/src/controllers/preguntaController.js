// ============================================================
// PhishGuard UTB - Controlador: Preguntas (CRUD Admin)
// ============================================================

const { Pregunta, Modulo } = require('../models');

// GET /api/preguntas/:moduloId
const listarPreguntas = async (req, res) => {
  try {
    const preguntas = await Pregunta.findAll({
      where: { modulo_id: req.params.moduloId },
      order: [['orden', 'ASC']],
    });
    res.json({ success: true, data: { preguntas } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener preguntas.' });
  }
};

// GET /api/preguntas/detalle/:id
const obtenerPregunta = async (req, res) => {
  try {
    const pregunta = await Pregunta.findByPk(req.params.id, {
      include: [{ model: Modulo, as: 'modulo', attributes: ['titulo'] }],
    });
    if (!pregunta) return res.status(404).json({ success: false, message: 'Pregunta no encontrada.' });
    res.json({ success: true, data: { pregunta } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error.' });
  }
};

// POST /api/preguntas/:moduloId
const crearPregunta = async (req, res) => {
  try {
    const { pregunta, opciones, respuesta_correcta, retroalimentacion, orden } = req.body;
    const modulo = await Modulo.findByPk(req.params.moduloId);
    if (!modulo) return res.status(404).json({ success: false, message: 'Modulo no encontrado.' });

    if (!opciones || opciones.length < 2) {
      return res.status(400).json({ success: false, message: 'Se necesitan al menos 2 opciones.' });
    }
    const opcionCorrecta = opciones.find(o => o.id === respuesta_correcta);
    if (!opcionCorrecta) {
      return res.status(400).json({ success: false, message: 'La respuesta correcta debe corresponder a una opcion.' });
    }

    const nuevaPregunta = await Pregunta.create({
      modulo_id: parseInt(req.params.moduloId),
      pregunta, opciones, respuesta_correcta, retroalimentacion,
      orden: orden || (await Pregunta.count({ where: { modulo_id: req.params.moduloId } })) + 1,
    });
    res.status(201).json({ success: true, message: 'Pregunta creada.', data: { pregunta: nuevaPregunta } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al crear pregunta.' });
  }
};

// PUT /api/preguntas/:id
const actualizarPregunta = async (req, res) => {
  try {
    const preg = await Pregunta.findByPk(req.params.id);
    if (!preg) return res.status(404).json({ success: false, message: 'Pregunta no encontrada.' });

    const { opciones, respuesta_correcta } = req.body;
    if (opciones && respuesta_correcta) {
      const opcionCorrecta = opciones.find(o => o.id === respuesta_correcta);
      if (!opcionCorrecta) {
        return res.status(400).json({ success: false, message: 'La respuesta correcta debe corresponder a una opcion.' });
      }
    }

    await preg.update(req.body);
    res.json({ success: true, message: 'Pregunta actualizada.', data: { pregunta: preg } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar.' });
  }
};

// DELETE /api/preguntas/:id
const eliminarPregunta = async (req, res) => {
  try {
    const preg = await Pregunta.findByPk(req.params.id);
    if (!preg) return res.status(404).json({ success: false, message: 'Pregunta no encontrada.' });
    await preg.destroy();
    res.json({ success: true, message: 'Pregunta eliminada.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar.' });
  }
};

// POST /api/preguntas/:moduloId/importar
const importarPreguntas = async (req, res) => {
  try {
    const moduloDestino = await Modulo.findByPk(req.params.moduloId);
    if (!moduloDestino) return res.status(404).json({ success: false, message: 'Modulo no encontrado.' });

    // Obtener preguntas de otros módulos
    const preguntasOtras = await Pregunta.findAll({
      where: { modulo_id: { [require('sequelize').Op.ne]: req.params.moduloId } },
      raw: true,
    });

    if (preguntasOtras.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay preguntas en otros módulos para importar.' });
    }

    // Insertarlas con el nuevo modulo_id
    const nuevasPreguntas = preguntasOtras.map((p, index) => ({
      ...p,
      id: undefined, // Para que autogenere el ID
      modulo_id: parseInt(req.params.moduloId),
      orden: index + 1,
    }));

    await Pregunta.bulkCreate(nuevasPreguntas);

    res.status(201).json({ success: true, message: `${nuevasPreguntas.length} preguntas importadas con éxito.` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error al importar preguntas.' });
  }
};

module.exports = {
  listarPreguntas,
  obtenerPregunta,
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta,
  importarPreguntas,
};
