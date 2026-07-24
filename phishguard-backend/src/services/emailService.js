// ============================================================
// PhishGuard UTB - Servicio: Envío de Correos
// Utiliza nodemailer con Gmail App Password
// ============================================================

const nodemailer = require('nodemailer');
const env = require('../config/env');

// Crear el transporter de nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

// Plantilla HTML premium para el correo de recuperación
const plantillaRecuperacion = (nombre, enlace) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperar contraseña - PhishGuard UTB</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #1B3A6B 0%, #2E6DA4 100%); padding: 40px 32px; text-align: center; }
    .header-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.15); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .header h1 { color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.80); font-size: 14px; margin-top: 6px; }
    .body { padding: 40px 36px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1B3A6B; margin-bottom: 16px; }
    .text { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 16px; }
    .btn-wrap { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1B3A6B 0%, #2E6DA4 100%); color: #fff !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(27,58,107,0.3); }
    .note-box { background: #FFF8E1; border: 1px solid #FFD54F; border-radius: 10px; padding: 16px 20px; margin: 20px 0; font-size: 13px; color: #7c5700; line-height: 1.6; }
    .note-box strong { color: #b45309; }
    .link-fallback { word-break: break-all; font-size: 13px; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
    .footer strong { color: #1B3A6B; }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h1>PhishGuard UTB</h1>
      <p>Plataforma de Ciberseguridad - FAFI</p>
    </div>
    <div class="body">
      <p class="greeting">Hola, ${nombre} 👋</p>
      <p class="text">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>PhishGuard UTB</strong>.
        Si fuiste tú quien la solicitó, haz clic en el botón de abajo:
      </p>
      <div class="btn-wrap">
        <a href="${enlace}" class="btn">🔑 Restablecer mi contraseña</a>
      </div>
      <div class="note-box">
        <strong>⚠️ Importante:</strong> Este enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.
        Después de ese tiempo deberás solicitar un nuevo enlace.
      </div>
      <p class="text">
        Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
      </p>
      <div class="link-fallback">${enlace}</div>
      <div class="divider"></div>
      <p class="text" style="font-size: 13px; color: #94a3b8;">
        Si <strong>no solicitaste</strong> este cambio, puedes ignorar este correo. 
        Tu contraseña actual permanecerá sin cambios y ninguna acción es necesaria.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <strong>PhishGuard UTB</strong> — Universidad Técnica de Babahoyo</p>
      <p style="margin-top: 6px;">Facultad de Administración, Finanzas e Informática (FAFI)</p>
    </div>
  </div>
</body>
</html>
`;

// Función principal: enviar correo de recuperación
const enviarCorreoRecuperacion = async (email, nombre, enlace) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: '🔑 Restablece tu contraseña — PhishGuard UTB',
    html: plantillaRecuperacion(nombre, enlace),
    // Versión texto plano como fallback
    text: `Hola ${nombre},\n\nRecibimos una solicitud para restablecer tu contraseña en PhishGuard UTB.\n\nHaz clic en este enlace (válido por 1 hora):\n${enlace}\n\nSi no solicitaste este cambio, ignora este correo.\n\n— PhishGuard UTB`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EMAIL] Correo de recuperación enviado a ${email} — ID: ${info.messageId}`);
  return info;
};

module.exports = { enviarCorreoRecuperacion };
