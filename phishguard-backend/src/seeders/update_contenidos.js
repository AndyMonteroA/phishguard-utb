// ============================================================
// PhishGuard UTB - Script: Actualización de Contenido de Módulos
// Añade secciones educativas adicionales a todos los módulos
// Ejecutar SOLO una vez: node src/seeders/update_contenidos.js
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, Modulo, Contenido } = require('../models');

const actualizar = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Conectado a la BD');

    // Obtener módulos existentes
    const modulos = await Modulo.findAll({ order: [['orden', 'ASC']] });
    if (modulos.length < 4) {
      console.error('[ERROR] No se encontraron los 4 módulos. Ejecuta seed.js primero.');
      process.exit(1);
    }

    const [phishing, pretexting, vishing, baiting] = modulos;
    console.log(`[OK] Módulos: ${modulos.map(m => m.titulo).join(', ')}`);

    // ============================================================
    // MÓDULO 1: PHISHING - Nuevas secciones (orden 6, 7)
    // ============================================================
    const existentesPhishing = await Contenido.count({ where: { modulo_id: phishing.id } });
    console.log(`[INFO] Phishing: ${existentesPhishing} secciones actuales`);

    if (existentesPhishing < 6) {
      await Contenido.bulkCreate([
        {
          modulo_id: phishing.id,
          titulo: 'Caso real: El phishing que costó millones',
          tipo: 'caso_real',
          contenido: `**CASO REAL: Ataque BEC a empresa de tecnología (2020)**

En 2020, una empresa latinoamericana de tecnología sufrió un ataque de Business Email Compromise (BEC), una variante avanzada de phishing.

**¿Cómo ocurrió?**

1. Un atacante comprometió el correo del director financiero mediante un correo de spear phishing con un archivo Excel malicioso.
2. Durante semanas, el atacante monitoreó silenciosamente las comunicaciones internas.
3. En el momento clave, interceptó una conversación sobre el pago a un proveedor legítimo por $2.3 millones.
4. El atacante envió un correo desde la cuenta comprometida con datos bancarios modificados.
5. La empresa transfirió el dinero a la cuenta del atacante.

**Consecuencias:**
• Pérdida de $2.3 millones de dólares (no recuperados)
• Investigación penal y daño reputacional severo
• Implementación urgente de protocolos de verificación

**Lección clave:** Para transferencias importantes, siempre confirma por un segundo canal —una llamada telefónica directa— aunque el correo parezca completamente legítimo.`,
          orden: 6,
        },
        {
          modulo_id: phishing.id,
          titulo: 'Laboratorio: Identifica el phishing',
          tipo: 'ejemplo_interactivo',
          contenido: `📧 **EJEMPLO DE CORREO DE PHISHING — ANÁLISIS COMPARATIVO:**

---
**De:** seguridad@paypa1.com (nota: "paypa1" con el número 1)
**Para:** cliente@gmail.com
**Asunto:** Su cuenta ha sido limitada temporalmente

Estimado cliente, hemos detectado un intento de acceso no autorizado a su cuenta. Haga clic en el siguiente enlace en las próximas 2 horas o su cuenta será suspendida permanentemente.

---

🔍 **SEÑALES DE ALERTA EN ESTE CORREO:**
• El dominio usa el número "1" en lugar de la letra "l": paypa**1**.com vs paypal.com — trampa clásica de homoglifo
• No personaliza con el nombre real del usuario ("Estimado cliente")
• Genera urgencia extrema: "2 horas" + amenaza de "suspensión permanente"
• El enlace apunta a un dominio diferente al del remitente

**COMPARACIÓN CON CORREO LEGÍTIMO:**
Un correo real de PayPal siempre incluiría: tu nombre completo registrado, nunca pediría acción inmediata bajo amenaza de cierre, el dominio sería exactamente @paypal.com y el enlace apuntaría a paypal.com/es.

**REGLA DE ORO:** Antes de hacer clic, pasa el cursor sobre el enlace y verifica la URL completa. Si no coincide con el dominio oficial, es phishing.`,
          orden: 7,
        },
      ]);
      console.log('[OK] Módulo Phishing: 2 secciones añadidas');
    } else {
      console.log('[SKIP] Módulo Phishing: ya tiene suficientes secciones');
    }

    // ============================================================
    // MÓDULO 2: PRETEXTING - Nuevas secciones (orden 5, 6)
    // ============================================================
    const existentesPretexting = await Contenido.count({ where: { modulo_id: pretexting.id } });
    console.log(`[INFO] Pretexting: ${existentesPretexting} secciones actuales`);

    if (existentesPretexting < 5) {
      await Contenido.bulkCreate([
        {
          modulo_id: pretexting.id,
          titulo: 'Caso real: El "técnico" de soporte falso',
          tipo: 'caso_real',
          contenido: `**CASO REAL: Fraude por soporte técnico falso en universidades (2022-2023)**

Durante 2022 y 2023, varias universidades latinoamericanas reportaron una campaña coordinada de pretexting dirigida a estudiantes.

**Modus operandi:**

El atacante contactaba a estudiantes por WhatsApp haciéndose pasar por personal de la "Oficina de Sistemas":

"Hola, soy Rodrigo del departamento de TI. Estamos actualizando el sistema de matrícula y detectamos un error de sincronización en tu cuenta. Necesito que me compartas el código de verificación que vas a recibir en tu teléfono para completar la actualización."

**El código que pedía** era en realidad el código 2FA de la cuenta de Google o WhatsApp del estudiante. Una vez obtenido:
• Tomaba control de la cuenta de Google del estudiante
• Accedía a correos con información bancaria
• Solicitaba préstamos digitales a nombre de la víctima

**Víctimas confirmadas:** Más de 40 estudiantes en 3 países

**Lección:** Ningún técnico de TI jamás necesita el código de verificación que llega a tu teléfono. Esos códigos son de uso PERSONAL e INTRANSFERIBLE bajo cualquier circunstancia.`,
          orden: 5,
        },
        {
          modulo_id: pretexting.id,
          titulo: 'Tipos de identidades falsas más usadas',
          tipo: 'texto',
          contenido: `**Las identidades más efectivas en ataques de Pretexting:**

**Figura de autoridad:**
Policía o agente, directivo de empresa, auditor externo, inspector gubernamental, técnico institucional.
Explotación: El respeto a la autoridad lleva a la víctima a obedecer sin cuestionar.

**Colega o compañero:**
Nuevo empleado que "necesita ayuda", compañero de clase con problemas de acceso, socio de negocio habitual.
Explotación: La solidaridad y el deseo de ayudar facilitan la divulgación de información.

**Soporte técnico:**
Personal de sistemas institucional, técnico de Microsoft/Google/Apple, representante del banco.
Explotación: La dependencia tecnológica hace que la gente confíe ciegamente en quien "sabe de sistemas".

**Investigador o encuestador:**
Investigador universitario realizando un estudio, periodista para un artículo, empresa de mercadeo.
Explotación: La sensación de contribuir a algo importante baja las defensas de la víctima.

**Regla universal de verificación:**
Antes de proporcionar CUALQUIER información sensible, di: "Voy a verificar tu identidad llamando directamente al departamento." Un solicitante legítimo siempre aceptará esto sin problema. Si se molesta o insiste, es una señal de alerta clara.`,
          orden: 6,
        },
      ]);
      console.log('[OK] Módulo Pretexting: 2 secciones añadidas');
    } else {
      console.log('[SKIP] Módulo Pretexting: ya tiene suficientes secciones');
    }

    // ============================================================
    // MÓDULO 3: VISHING - Nuevas secciones (orden 4, 5)
    // ============================================================
    const existentesVishing = await Contenido.count({ where: { modulo_id: vishing.id } });
    console.log(`[INFO] Vishing: ${existentesVishing} secciones actuales`);

    if (existentesVishing < 4) {
      await Contenido.bulkCreate([
        {
          modulo_id: vishing.id,
          titulo: 'Técnicas de manipulación vocal en Vishing',
          tipo: 'texto',
          contenido: `**Las técnicas que usan los vishers para manipularte:**

**Caller ID Spoofing (Falsificación del número):**
Los atacantes usan software para hacer que su llamada aparezca como si viniera del número oficial de tu banco o universidad. La tecnología puede falsificar cualquier número de origen.

**Ingeniería del pánico:**
"Su tarjeta fue clonada y hay 3 transacciones en este momento. Necesitamos actuar YA."
El pánico bloquea el pensamiento crítico. Cuando tienes miedo, tu cerebro busca la solución más rápida sin verificar.

**Deepfake de voz:**
Tecnología emergente que clona voces reales a partir de pocos segundos de audio. Casos documentados incluyen llamadas con la voz clonada de ejecutivos ordenando transferencias urgentes.

**Presión temporal extrema:**
"Tiene exactamente 15 minutos antes de que bloqueemos su cuenta permanentemente."
La urgencia artificial impide que la víctima tome el tiempo de verificar la información.

**Personalización con datos reales:**
"Hablo para el señor Juan Pérez, con cédula terminada en 4521..."
Usar información obtenida de redes sociales o filtraciones de datos para parecer completamente legítimo.

**Consejo práctico fundamental:**
Cuando recibas una llamada sospechosa di: "Voy a colgar y llamaré directamente al número oficial." Un representante legítimo SIEMPRE aceptará esto sin problema ni presión.`,
          orden: 4,
        },
        {
          modulo_id: vishing.id,
          titulo: 'Simulación: ¿Cómo responder al vishing?',
          tipo: 'ejemplo_interactivo',
          contenido: `💬 **EJEMPLO DE SMS SMISHING — Caso bancario:**

---
**Remitente:** BancoPacífico-Alerta
**Mensaje:**
ALERTA DE SEGURIDAD: Detectamos un cargo sospechoso de $380 en su cuenta. Si no reconoce esta operación, ingrese aquí para bloquearla: http://banco-pacifico-seguro.net/bloquear

---

🔍 **SEÑALES DE ALERTA:**
• El enlace NO es el dominio oficial del banco. El banco real usaría www.bancoPacífico.com, no un subdominio sospechoso
• Los bancos reales nunca envían links de "bloqueo" por SMS — te piden llamar al número del reverso de tu tarjeta
• La URL usa "http" sin "s" (inseguro)
• El dominio ".net" es inusual para un banco ecuatoriano (deberían ser .com o .com.ec)

**¿QUÉ HACER?**
1. NO hagas clic en el enlace
2. Si tienes dudas sobre tu cuenta, llama TÚ MISMO al número del reverso de tu tarjeta
3. Reporta el SMS a tu banco como intento de fraude
4. Bloquea el número remitente

**Regla de oro:** Tu banco nunca te pedirá que hagas clic en un enlace de SMS para "bloquear" transacciones. Ellos llaman o tú los llamas.`,
          orden: 5,
        },
      ]);
      console.log('[OK] Módulo Vishing: 2 secciones añadidas');
    } else {
      console.log('[SKIP] Módulo Vishing: ya tiene suficientes secciones');
    }

    // ============================================================
    // MÓDULO 4: BAITING - Nuevas secciones (orden 4, 5)
    // ============================================================
    const existentesBaiting = await Contenido.count({ where: { modulo_id: baiting.id } });
    console.log(`[INFO] Baiting: ${existentesBaiting} secciones actuales`);

    if (existentesBaiting < 4) {
      await Contenido.bulkCreate([
        {
          modulo_id: baiting.id,
          titulo: 'Baiting digital: Trampas comunes en internet',
          tipo: 'texto',
          contenido: `**Las formas más frecuentes de Baiting digital:**

**Software y videojuegos "crackeados":**
Descargar versiones piratas de programas (Adobe, Office, videojuegos premium) es uno de los métodos de baiting más efectivos. El archivo incluye el programa Y malware oculto (ransomware, keylogger, spyware).

**Streaming y descargas de películas:**
Sitios que ofrecen series y películas sin costo suelen requerir descargar un "reproductor especial" o "codec" que en realidad es malware.

**Premios y concursos falsos:**
"¡Felicidades! Eres el visitante número 1,000,000. Descarga nuestra app para reclamar tu premio de $500."
La emoción del premio elimina el pensamiento crítico.

**Aplicaciones falsas en tiendas no oficiales:**
Apps que imitan aplicaciones populares (WhatsApp Gold, Instagram Premium, Banco XYZ Oficial) descargadas fuera de Play Store o App Store oficial, que contienen spyware.

**Cables y accesorios trampa:**
Cables USB aparentemente normales (como el "OMG Cable") que contienen chips capaces de comprometer un dispositivo al conectarse. Son físicamente indistinguibles de cables legítimos.

**Documentos maliciosos por correo:**
PDFs, documentos Word con macros o archivos ZIP enviados por desconocidos. Al abrirlos o habilitar las macros, se instala malware.

**Regla fundamental:** Si algo es gratis sin razón clara, te lo enviaron sin pedirlo o promete algo demasiado bueno — es casi con certeza una trampa.`,
          orden: 4,
        },
        {
          modulo_id: baiting.id,
          titulo: 'Caso real: La campaña USB en estacionamientos',
          tipo: 'caso_real',
          contenido: `**CASO REAL: Experimento de seguridad con USBs (Universidad de Illinois, 2016)**

Investigadores de la Universidad de Illinois (Tischer et al.) realizaron uno de los estudios más citados sobre baiting físico.

**El experimento:**
Dejaron 297 memorias USB en el campus universitario y áreas públicas cercanas, con y sin etiquetas.

**Resultados documentados:**
• 98% de los dispositivos fueron recogidos por alguna persona
• 45% de las personas que recogieron un USB lo conectaron a su computadora
• El tiempo promedio desde que se encontró la USB hasta que se conectó: 6 minutos
• Las USBs con etiquetas como "Exámenes", "Privado" o "Fotos" tenían mayor tasa de conexión

**Extrapolación a entorno corporativo:**
Una empresa de ethical hacking replicó el estudio en una corporación financiera:
• 73% de las USBs fueron conectadas a computadoras de empleados
• El malware simulado habría comprometido la red completa en menos de 2 horas

**Consecuencias del estudio:**
Las empresas que ven estos resultados suelen implementar inmediatamente:
✓ Deshabilitación de puertos USB en computadoras corporativas
✓ Política de cero dispositivos externos no autorizados
✓ Programas de capacitación en conciencia de seguridad

**Reflexión:** Si más del 45% de personas en un campus universitario conecta USBs desconocidas, ¿cuántos de tus compañeros harían lo mismo?`,
          orden: 5,
        },
      ]);
      console.log('[OK] Módulo Baiting: 2 secciones añadidas');
    } else {
      console.log('[SKIP] Módulo Baiting: ya tiene suficientes secciones');
    }

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    const total = await Contenido.count();
    console.log(`\n✅ Script completado exitosamente.`);
    console.log(`📚 Total de secciones en BD: ${total}`);

    const detalle = await Promise.all(modulos.map(async (m) => {
      const count = await Contenido.count({ where: { modulo_id: m.id } });
      return `  • ${m.titulo}: ${count} secciones`;
    }));
    console.log('\nDetalle por módulo:');
    detalle.forEach(d => console.log(d));

  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n[OK] Conexión cerrada');
  }
};

actualizar();
