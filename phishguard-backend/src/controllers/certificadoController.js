// ============================================================
// PhishGuard UTB - Controlador: Certificados
// ============================================================

const PDFDocument = require('pdfkit');
const { Certificado, Usuario, ProgresoModulo, ResultadoQuiz, Modulo } = require('../models');
const { v4: uuidv4 } = require('uuid');

// POST /api/certificado/generar - Generar certificado
const generarCertificado = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    // Verificar si ya tiene certificado
    const certificadoExistente = await Certificado.findOne({
      where: { usuario_id: usuarioId },
    });

    if (certificadoExistente) {
      return res.json({
        success: true,
        message: 'Ya tienes un certificado generado.',
        data: { certificado: certificadoExistente },
      });
    }

    // Verificar que completó todos los módulos
    const totalModulos = await Modulo.count({ where: { activo: true } });
    const modulosCompletados = await ProgresoModulo.count({
      where: { usuario_id: usuarioId, completado: true },
    });

    if (modulosCompletados < totalModulos) {
      return res.status(400).json({
        success: false,
        message: `Debes completar todos los módulos. Progreso: ${modulosCompletados}/${totalModulos}`,
      });
    }

    // Obtener datos del usuario
    const usuario = await Usuario.findByPk(usuarioId);

    // Calcular puntaje promedio
    const resultados = await ResultadoQuiz.findAll({
      where: { usuario_id: usuarioId, aprobado: true },
    });

    const puntajePromedio = resultados.length > 0
      ? Math.round(
          resultados.reduce((acc, r) => acc + (r.puntaje / r.total_preguntas) * 100, 0) /
          resultados.length
        )
      : 0;

    // Crear certificado
    const codigoUnico = `PG-UTB-${uuidv4().substring(0, 8).toUpperCase()}`;
    const certificado = await Certificado.create({
      usuario_id: usuarioId,
      codigo_unico: codigoUnico,
      nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
      puntaje_promedio: puntajePromedio,
    });

    res.status(201).json({
      success: true,
      message: '¡Certificado generado exitosamente!',
      data: { certificado },
    });
  } catch (error) {
    console.error('Error al generar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el certificado.',
    });
  }
};

// GET /api/certificado/descargar - Descargar certificado en PDF
const descargarCertificado = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const certificado = await Certificado.findOne({
      where: { usuario_id: usuarioId },
    });

    if (!certificado) {
      return res.status(404).json({
        success: false,
        message: 'No tienes un certificado generado.',
      });
    }

    // Generar PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificado_phishguard_${certificado.codigo_unico}.pdf`
    );

    doc.pipe(res);

    // --- Diseño del Certificado ---

    // Fondo con borde decorativo
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(3)
       .strokeColor('#1B3A6B')
       .stroke();

    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70)
       .lineWidth(1)
       .strokeColor('#2E6DA4')
       .stroke();

    // Encabezado institucional
    doc.fontSize(14)
       .fillColor('#1B3A6B')
       .font('Helvetica-Bold')
       .text('UNIVERSIDAD TÉCNICA DE BABAHOYO', { align: 'center' });

    doc.fontSize(11)
       .font('Helvetica')
       .text('Facultad de Administración, Finanzas e Informática', { align: 'center' });

    doc.fontSize(10)
       .text('Carrera de Sistemas de Información', { align: 'center' });

    doc.moveDown(1.5);

    // Línea decorativa
    doc.moveTo(150, doc.y).lineTo(doc.page.width - 150, doc.y)
       .strokeColor('#1B3A6B').lineWidth(2).stroke();

    doc.moveDown(1);

    // Título principal
    doc.fontSize(32)
       .fillColor('#1B3A6B')
       .font('Helvetica-Bold')
       .text('CERTIFICADO', { align: 'center' });

    doc.fontSize(14)
       .fillColor('#2E6DA4')
       .font('Helvetica')
       .text('DE CONCIENTIZACIÓN EN INGENIERÍA SOCIAL', { align: 'center' });

    doc.moveDown(1.5);

    // Cuerpo
    doc.fontSize(13)
       .fillColor('#333333')
       .font('Helvetica')
       .text('Se certifica que:', { align: 'center' });

    doc.moveDown(0.5);

    doc.fontSize(26)
       .fillColor('#1B3A6B')
       .font('Helvetica-Bold')
       .text(certificado.nombre_completo.toUpperCase(), { align: 'center' });

    doc.moveDown(0.8);

    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica')
       .text(
         'Ha completado satisfactoriamente todos los módulos del programa de concientización sobre Ingeniería Social de la plataforma PhishGuard UTB, demostrando conocimientos en la identificación y prevención de ataques de Phishing, Pretexting, Vishing y Baiting.',
         { align: 'center', width: 550, lineGap: 4 }
       );

    doc.moveDown(1);

    // Puntaje y código
    doc.fontSize(12)
       .fillColor('#1B3A6B')
       .font('Helvetica-Bold')
       .text(`Puntaje Promedio: ${certificado.puntaje_promedio}%`, { align: 'center' });

    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Código de Verificación: ${certificado.codigo_unico}`, { align: 'center' });

    doc.text(
      `Fecha de Emisión: ${new Date(certificado.fecha_emision).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      { align: 'center' }
    );

    doc.moveDown(2);

    // Línea decorativa final
    doc.moveTo(150, doc.y).lineTo(doc.page.width - 150, doc.y)
       .strokeColor('#1B3A6B').lineWidth(1).stroke();

    doc.moveDown(0.5);

    // Pie de página
    doc.fontSize(9)
       .fillColor('#999999')
       .font('Helvetica')
       .text('PhishGuard UTB - Plataforma de Concientización sobre Ingeniería Social', { align: 'center' })
       .text('Universidad Técnica de Babahoyo - Babahoyo, Ecuador - 2026', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el PDF del certificado.',
    });
  }
};

// GET /api/certificado/verificar/:codigo - Verificar certificado público
const verificarCertificado = async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await Certificado.findOne({
      where: { codigo_unico: codigo },
    });

    if (!certificado) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado.',
      });
    }

    res.json({
      success: true,
      data: {
        valido: true,
        nombre: certificado.nombre_completo,
        fecha_emision: certificado.fecha_emision,
        codigo: certificado.codigo_unico,
        puntaje_promedio: certificado.puntaje_promedio,
      },
    });
  } catch (error) {
    console.error('Error al verificar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el certificado.',
    });
  }
};

// GET /api/certificado/mi-certificado
const obtenerMiCertificado = async (req, res) => {
  try {
    const certificado = await Certificado.findOne({
      where: { usuario_id: req.usuarioId },
    });

    res.json({
      success: true,
      data: { certificado },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
};

module.exports = {
  generarCertificado,
  descargarCertificado,
  verificarCertificado,
  obtenerMiCertificado,
};
