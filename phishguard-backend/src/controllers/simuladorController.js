// ============================================================
// PhishGuard UTB - Controlador: Simulador de Phishing
// ============================================================

const { ResultadoQuiz } = require('../models');
const { verificarLogros } = require('./logroController');

// Base de datos de emails simulados para el ejercicio práctico
const EMAILS_SIMULADOS = [
  {
    id: 1,
    tipo: 'phishing',
    de: 'soporte@banc0-pichincha.com.ec',
    para: 'usuario@utb.edu.ec',
    asunto: 'URGENTE: Su cuenta ha sido bloqueada',
    cuerpo: `Estimado cliente,

Hemos detectado actividad sospechosa en su cuenta bancaria. Su cuenta ha sido temporalmente bloqueada por seguridad.

Para reactivar su cuenta, haga clic en el siguiente enlace y verifique su identidad ingresando su número de cédula, contraseña y código de seguridad de su tarjeta:

👉 https://banc0-pichincha-verificar.com/cuenta

Si no realiza esta verificación en las próximas 24 horas, su cuenta será suspendida permanentemente.

Atentamente,
Departamento de Seguridad
Banco Pichincha`,
    pistas: [
      'El dominio del remitente usa "0" (cero) en lugar de "o": banc0-pichincha',
      'Solicita información sensible (cédula, contraseña, código de tarjeta)',
      'Usa urgencia extrema ("24 horas", "suspendida permanentemente")',
      'El enlace lleva a un dominio diferente al oficial del banco',
    ],
    dificultad: 'facil',
  },
  {
    id: 2,
    tipo: 'legitimo',
    de: 'noreply@utb.edu.ec',
    para: 'estudiante@utb.edu.ec',
    asunto: 'Recordatorio: Inscripción de materias - Período 2026-2S',
    cuerpo: `Estimado/a estudiante,

Le recordamos que el período de inscripción de materias para el semestre 2026-2S se encuentra abierto hasta el 15 de agosto de 2026.

Para realizar su inscripción, ingrese al Sistema Académico de la UTB con sus credenciales institucionales:
https://academico.utb.edu.ec

Horario de atención de secretaría: Lunes a Viernes, 8:00 - 16:00

Cordialmente,
Secretaría Académica
Universidad Técnica de Babahoyo`,
    pistas: [
      'El dominio del remitente es oficial (@utb.edu.ec)',
      'No solicita contraseñas ni datos sensibles',
      'El enlace corresponde al dominio oficial de la universidad',
      'El tono es profesional y no usa urgencia extrema',
    ],
    dificultad: 'facil',
  },
  {
    id: 3,
    tipo: 'phishing',
    de: 'premiossorteo@gmail.com',
    para: 'usuario@utb.edu.ec',
    asunto: '¡¡¡FELICIDADES!!! Has ganado un iPhone 16 Pro 🎉',
    cuerpo: `¡¡¡FELICIDADES!!!

Tu correo electrónico ha sido seleccionado como GANADOR de nuestro sorteo internacional. Has ganado un iPhone 16 Pro Max de 256GB.

Para reclamar tu premio, solo necesitas:
1. Enviar una copia de tu cédula de identidad
2. Pagar el costo de envío ($49.99) mediante Western Union
3. Proporcionar tu dirección de envío

Responde a este correo con tus datos para reclamar tu premio. ¡No dejes pasar esta oportunidad!

Coordinador de Premios
Sorteos Internacionales Inc.`,
    pistas: [
      'Usa un correo genérico de Gmail, no corporativo',
      'Promete premios sin haber participado en ningún sorteo',
      'Solicita documentos personales (cédula)',
      'Requiere un pago previo para "reclamar" el premio',
      'Uso excesivo de signos de exclamación y emojis',
    ],
    dificultad: 'facil',
  },
  {
    id: 4,
    tipo: 'phishing',
    de: 'admin@microsoft-support365.com',
    para: 'usuario@utb.edu.ec',
    asunto: 'Su licencia de Microsoft Office expirará en 2 horas',
    cuerpo: `Estimado usuario,

Su licencia de Microsoft Office 365 expirará en las próximas 2 horas. Para evitar la pérdida de acceso a sus documentos y correo electrónico, debe renovar su suscripción inmediatamente.

Haga clic aquí para renovar: https://microsoft-support365.com/renovar

Necesitará proporcionar:
- Su correo electrónico y contraseña actual
- Datos de su tarjeta de crédito para la renovación

Si no renueva, perderá acceso a todos sus archivos de OneDrive.

Soporte Técnico Microsoft`,
    pistas: [
      'El dominio no es oficial de Microsoft (microsoft-support365.com vs microsoft.com)',
      'Crea urgencia artificial ("2 horas")',
      'Solicita contraseña y datos de tarjeta de crédito por email',
      'Microsoft nunca solicita credenciales por correo electrónico',
    ],
    dificultad: 'medio',
  },
  {
    id: 5,
    tipo: 'legitimo',
    de: 'biblioteca@utb.edu.ec',
    para: 'estudiante@utb.edu.ec',
    asunto: 'Recordatorio de devolución de libro',
    cuerpo: `Estimado/a estudiante,

Le recordamos que el libro "Seguridad Informática: Fundamentos" (ISBN: 978-84-9732-123-4) prestado el 20 de julio de 2026 tiene fecha de devolución el 20 de agosto de 2026.

Por favor, devuelva el material en el horario de atención de la biblioteca:
- Lunes a Viernes: 7:30 - 17:00
- Ubicación: Edificio Central, Planta Baja

En caso de necesitar una extensión, puede solicitarla presentándose en biblioteca con su carnet estudiantil.

Cordialmente,
Biblioteca Central UTB`,
    pistas: [
      'El remitente usa el dominio oficial de la universidad',
      'Contiene información específica y verificable (ISBN, fechas)',
      'No solicita datos personales ni pagos',
      'Proporciona información de contacto física verificable',
    ],
    dificultad: 'medio',
  },
  {
    id: 6,
    tipo: 'phishing',
    de: 'docente.sistemas@outlook.com',
    para: 'estudiante@utb.edu.ec',
    asunto: 'RE: Notas finales - Necesito tu ayuda urgente',
    cuerpo: `Hola,

Soy el Ing. Martínez del departamento de Sistemas. Estoy teniendo problemas con el sistema académico y necesito verificar las notas de mi materia.

¿Podrías enviarme tu usuario y contraseña del sistema académico para verificar si las notas se cargaron correctamente? Es urgente porque hoy es el último día.

También necesito que descargues este archivo con el listado de notas para verificar:
https://drive.google.com/file/d/notas_finales_sistemas.exe

Gracias por tu ayuda,
Ing. Martínez`,
    pistas: [
      'Un docente real usaría el correo institucional, no Outlook personal',
      'Ningún docente legítimo pediría tu contraseña del sistema académico',
      'El archivo tiene extensión .exe (ejecutable), no es un documento de notas',
      'Usa pretexting: se hace pasar por alguien de confianza',
    ],
    dificultad: 'medio',
  },
  {
    id: 7,
    tipo: 'phishing',
    de: 'seguridad@paypa1.com',
    para: 'usuario@utb.edu.ec',
    asunto: 'Actividad inusual detectada en su cuenta PayPal',
    cuerpo: `Se ha detectado un inicio de sesión desde una ubicación desconocida:

Ubicación: Moscú, Rusia
Dispositivo: Windows PC
Hora: 08 de agosto, 2026 - 03:45 AM

Si no fuiste tú, tu cuenta puede estar comprometida. Verifica tu identidad inmediatamente para asegurar tu cuenta:

https://paypa1-security.com/verificar-cuenta

Si no tomas acción en 12 horas, tu cuenta será limitada permanentemente.

Equipo de Seguridad PayPal`,
    pistas: [
      'El dominio usa "1" (uno) en lugar de "l": paypa1.com',
      'El enlace va a paypa1-security.com, no a paypal.com',
      'PayPal nunca envía correos pidiendo verificación por enlace externo',
      'Amenaza con limitación "permanente" para crear pánico',
    ],
    dificultad: 'dificil',
  },
  {
    id: 8,
    tipo: 'legitimo',
    de: 'github@notifications.github.com',
    para: 'developer@utb.edu.ec',
    asunto: '[GitHub] A]new personal access token has been added to your account',
    cuerpo: `Hey @usuario,

A new personal access token was added to your account:

- Token name: phishguard-deploy
- Permissions: repo, workflow
- Expiration: 90 days

If you did not create this token, please review your account security settings immediately at:
https://github.com/settings/tokens

Visit https://docs.github.com/authentication for more information about managing your personal access tokens.

Thanks,
The GitHub Team`,
    pistas: [
      'El remitente es del dominio oficial de GitHub (notifications.github.com)',
      'Los enlaces apuntan al dominio oficial github.com',
      'No solicita contraseña ni datos personales',
      'El tono es informativo, no amenazante',
    ],
    dificultad: 'dificil',
  },
];

// GET /api/simulador - Obtener emails para el simulador
const obtenerSimulacion = async (req, res) => {
  try {
    // Mezclar aleatoriamente y seleccionar 6 emails
    const emailsAleatorios = [...EMAILS_SIMULADOS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map(({ pistas, tipo, ...email }) => email); // No enviar pistas ni tipo al frontend

    res.json({
      success: true,
      data: {
        emails: emailsAleatorios,
        total: emailsAleatorios.length,
        tiempo_limite: 600, // 10 minutos
      },
    });
  } catch (error) {
    console.error('Error simulador:', error);
    res.status(500).json({ success: false, message: 'Error al obtener simulación.' });
  }
};

// POST /api/simulador/submit - Enviar respuestas del simulador
const enviarSimulacion = async (req, res) => {
  try {
    const { respuestas, tiempo_empleado } = req.body;
    const usuarioId = req.usuarioId;

    let correctas = 0;
    const detalle = respuestas.map(r => {
      const email = EMAILS_SIMULADOS.find(e => e.id === r.email_id);
      if (!email) return null;

      const esCorrecta = email.tipo === r.respuesta;
      if (esCorrecta) correctas++;

      return {
        email_id: email.id,
        asunto: email.asunto,
        de: email.de,
        tipo_real: email.tipo,
        respuesta_usuario: r.respuesta,
        correcta: esCorrecta,
        pistas: email.pistas,
        dificultad: email.dificultad,
      };
    }).filter(Boolean);

    const total = detalle.length;
    const porcentaje = Math.round((correctas / total) * 100);

    // Verificar logros
    if (usuarioId) {
      await verificarLogros(usuarioId);
    }

    res.json({
      success: true,
      message: porcentaje >= 70
        ? `¡Excelente! Identificaste correctamente ${correctas} de ${total} emails.`
        : `Obtuviste ${correctas} de ${total}. Sigue practicando para mejorar tu detección.`,
      data: {
        resultado: { correctas, total, porcentaje, tiempo_empleado },
        detalle,
      },
    });
  } catch (error) {
    console.error('Error simulador submit:', error);
    res.status(500).json({ success: false, message: 'Error al procesar simulación.' });
  }
};

module.exports = { obtenerSimulacion, enviarSimulacion };
