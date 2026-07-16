// ============================================================
// PhishGuard UTB - Seeder: Datos Iniciales
// Contenido educativo real sobre Ingeniería Social
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, Usuario, Modulo, Contenido, Pregunta, Logro } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Conectado a la BD');

    // Sincronizar modelos (force: true para reiniciar)
    await sequelize.sync({ force: true });
    console.log('[OK] Tablas recreadas');

    // ============================================================
    // 1. USUARIO ADMIN
    // ============================================================
    const adminPassword = await bcrypt.hash('admin123', 10);
    await Usuario.create({
      nombre: 'Admin',
      apellido: 'PhishGuard',
      email: 'admin@phishguard.utb.edu.ec',
      password: adminPassword,
      rol: 'admin',
      semestre: null,
      activo: true,
      encuesta_completada: true,
    }, { hooks: false });
    console.log('[OK] Usuario admin creado');

    // ============================================================
    // 2. MÓDULOS DE APRENDIZAJE
    // ============================================================
    const modulos = await Modulo.bulkCreate([
      {
        titulo: 'Phishing',
        descripcion: 'Aprende a identificar correos electrónicos, mensajes y sitios web fraudulentos diseñados para robar tu información personal y credenciales de acceso. El phishing es el ataque de Ingeniería Social más común a nivel mundial.',
        orden: 1,
        icono: 'FiMail',
        color: '#E74C3C',
        duracion_estimada: '35 minutos',
      },
      {
        titulo: 'Pretexting',
        descripcion: 'Descubre cómo los atacantes crean historias falsas y escenarios ficticios para manipularte psicológicamente y obtener información confidencial. Aprende a detectar cuando alguien está usando un pretexto para engañarte.',
        orden: 2,
        icono: 'FiUsers',
        color: '#9B59B6',
        duracion_estimada: '30 minutos',
      },
      {
        titulo: 'Vishing',
        descripcion: 'Conoce los fraudes realizados mediante llamadas telefónicas y mensajes de voz. Aprende a reconocer las tácticas que utilizan los estafadores cuando se hacen pasar por instituciones legítimas para robar tu información.',
        orden: 3,
        icono: 'FiPhone',
        color: '#3498DB',
        duracion_estimada: '25 minutos',
      },
      {
        titulo: 'Baiting',
        descripcion: 'Entiende cómo los atacantes utilizan dispositivos físicos (como memorias USB) y descargas digitales como cebo para infectar tus dispositivos con malware y robar tu información.',
        orden: 4,
        icono: 'FiHardDrive',
        color: '#F39C12',
        duracion_estimada: '25 minutos',
      },
    ]);
    console.log('[OK] 4 modulos creados');

    // ============================================================
    // 3. CONTENIDOS EDUCATIVOS POR MÓDULO
    // ============================================================

    // --- MÓDULO 1: PHISHING ---
    await Contenido.bulkCreate([
      {
        modulo_id: modulos[0].id,
        titulo: '¿Qué es el Phishing?',
        tipo: 'texto',
        contenido: `El phishing es una técnica de Ingeniería Social en la que un atacante envía comunicaciones fraudulentas —generalmente correos electrónicos, mensajes de texto (SMS) o mensajes en redes sociales— que aparentan provenir de una fuente confiable y legítima.\n\nEl objetivo principal del phishing es engañar al destinatario para que:\n\n• Revele información confidencial (contraseñas, números de tarjeta de crédito, datos bancarios)\n• Haga clic en enlaces maliciosos que conducen a sitios web falsos\n• Descargue archivos adjuntos infectados con malware\n• Transfiera dinero a cuentas controladas por el atacante\n\nSegún el Anti-Phishing Working Group (APWG, 2023), se detectaron más de 1.3 millones de sitios de phishing únicos solo en el primer trimestre de 2023, lo que demuestra la magnitud de esta amenaza.`,
        orden: 1,
      },
      {
        modulo_id: modulos[0].id,
        titulo: '¿Cómo funciona un ataque de Phishing?',
        tipo: 'texto',
        contenido: `Un ataque de phishing típico sigue estos pasos:\n\n1. **Preparación:** El atacante investiga a sus víctimas y selecciona una entidad de confianza para suplantar (banco, universidad, empresa de tecnología).\n\n2. **Creación del señuelo:** Diseña un correo electrónico o mensaje que imita la apariencia visual de la entidad legítima, incluyendo logos, colores y formato.\n\n3. **Envío masivo o dirigido:** El mensaje se envía a miles de personas (phishing masivo) o a una persona específica (spear phishing).\n\n4. **Engaño:** El mensaje genera urgencia, miedo o curiosidad para que la víctima actúe sin pensar.\n\n5. **Captura:** La víctima hace clic en un enlace que la lleva a un sitio web falso donde ingresa sus credenciales, o descarga un archivo malicioso.\n\n6. **Explotación:** El atacante utiliza la información robada para acceder a cuentas, realizar fraudes financieros o vender los datos.`,
        orden: 2,
      },
      {
        modulo_id: modulos[0].id,
        titulo: 'Ejemplo real: Correo de phishing universitario',
        tipo: 'ejemplo_interactivo',
        contenido: `📧 **EJEMPLO DE CORREO DE PHISHING:**\n\n---\n**De:** soporte.tecnico@utb-sistemas.com (⚠️ dominio falso)\n**Para:** estudiante@utb.edu.ec\n**Asunto:** ⚠️ URGENTE: Su cuenta será suspendida en 24 horas\n\nEstimado estudiante,\n\nHemos detectado actividad inusual en su cuenta institucional. Para evitar la suspensión permanente de su acceso al sistema académico, debe verificar su identidad inmediatamente.\n\nHaga clic aquí para verificar su cuenta: [Verificar Ahora](http://utb-verificacion-segura.fake.com)\n\nTiene un plazo de 24 horas. De no completar la verificación, su cuenta será eliminada.\n\nAtentamente,\nSoporte Técnico UTB\n\n---\n\n🔍 **SEÑALES DE ALERTA:**\n• El dominio del remitente NO es @utb.edu.ec oficial\n• Genera urgencia extrema ("24 horas")\n• Amenaza con consecuencias graves ("suspensión permanente")\n• El enlace apunta a un dominio sospechoso\n• La UTB nunca solicita verificación de datos por correo\n• Errores sutiles en la redacción`,
        orden: 3,
      },
      {
        modulo_id: modulos[0].id,
        titulo: 'Tipos de Phishing',
        tipo: 'texto',
        contenido: `Existen varias modalidades de phishing:\n\n**🎯 Spear Phishing:** Ataques dirigidos a una persona o grupo específico. El atacante personaliza el mensaje con información real de la víctima (nombre, cargo, empresa) para hacerlo más convincente.\n\n**🐋 Whaling:** Phishing dirigido a ejecutivos de alto nivel y directivos. Los correos suelen simular comunicaciones legales, fiscales o de gobierno.\n\n**📱 Smishing (SMS Phishing):** Ataques realizados mediante mensajes de texto SMS. Ejemplos: "Su paquete no pudo ser entregado, haga clic aquí para reprogramar."\n\n**🔗 Pharming:** Redirección del tráfico web legítimo hacia sitios fraudulentos mediante la manipulación de DNS.\n\n**📋 Clone Phishing:** El atacante duplica un correo legítimo que la víctima recibió anteriormente, pero reemplaza los enlaces o archivos adjuntos con versiones maliciosas.`,
        orden: 4,
      },
      {
        modulo_id: modulos[0].id,
        titulo: '¿Cómo protegerte del Phishing?',
        tipo: 'texto',
        contenido: `**Medidas de protección esenciales:**\n\n✅ **Verifica el remitente:** Examina cuidadosamente la dirección de correo electrónico completa, no solo el nombre visible.\n\n✅ **No hagas clic en enlaces sospechosos:** Pasa el cursor sobre el enlace para ver la URL real antes de hacer clic.\n\n✅ **Desconfía de la urgencia:** Los mensajes legítimos rara vez exigen acciones inmediatas con amenazas de consecuencias graves.\n\n✅ **Verifica por canales oficiales:** Si recibes un mensaje sospechoso de tu banco o universidad, contacta directamente a la institución por teléfono o visita su sitio web escribiendo la URL manualmente.\n\n✅ **Activa la autenticación de dos factores (2FA):** Esto añade una capa extra de seguridad a tus cuentas.\n\n✅ **Mantén actualizado tu software:** Los navegadores y sistemas operativos incluyen filtros anti-phishing.\n\n✅ **Reporta los intentos:** Informa al departamento de TI de tu institución cuando recibas correos sospechosos.`,
        orden: 5,
      },
    ]);

    // --- MÓDULO 2: PRETEXTING ---
    await Contenido.bulkCreate([
      {
        modulo_id: modulos[1].id,
        titulo: '¿Qué es el Pretexting?',
        tipo: 'texto',
        contenido: `El pretexting es una técnica de Ingeniería Social en la que el atacante crea un escenario fabricado (pretexto) para ganarse la confianza de la víctima y convencerla de revelar información confidencial o realizar acciones que normalmente no haría.\n\nA diferencia del phishing, que suele ser masivo e impersonal, el pretexting requiere una interacción más elaborada y personalizada. El atacante construye una identidad falsa creíble y una historia convincente.\n\n**Características del pretexting:**\n• Requiere investigación previa sobre la víctima\n• El atacante asume una identidad falsa (técnico, auditor, colega)\n• Se construye una narrativa creíble paso a paso\n• Explota la confianza y la buena voluntad de la víctima\n• Puede realizarse por teléfono, correo, en persona o redes sociales`,
        orden: 1,
      },
      {
        modulo_id: modulos[1].id,
        titulo: 'Ejemplo: Pretexting en el entorno universitario',
        tipo: 'ejemplo_interactivo',
        contenido: `📞 **ESCENARIO DE PRETEXTING:**\n\n---\nUn estudiante recibe una llamada:\n\n"Buenos días, soy el Ing. Carlos Mendoza del Departamento de Tecnología de la UTB. Estamos realizando una actualización de emergencia en el sistema académico y necesitamos verificar las credenciales de todos los estudiantes de Sistemas de Información para migrar sus datos. ¿Podría proporcionarme su usuario y contraseña del sistema académico para completar el proceso? Es urgente porque el sistema estará fuera de línea esta noche."\n\n---\n\n🔍 **ANÁLISIS:**\n• El atacante usa un nombre y cargo específicos para parecer legítimo\n• Menciona un departamento real de la universidad\n• Crea urgencia ("actualización de emergencia", "esta noche")\n• Pide directamente credenciales (⚠️ NUNCA se hace en procedimientos reales)\n• Ningún departamento de TI legítimo solicita contraseñas por teléfono\n\n**REGLA DE ORO:** Si alguien te pide tu contraseña, sin importar quién diga ser, es un ataque. Las contraseñas NUNCA se comparten.`,
        orden: 2,
      },
      {
        modulo_id: modulos[1].id,
        titulo: 'Los 6 principios de persuasión de Cialdini',
        tipo: 'texto',
        contenido: `Robert Cialdini (2007) identificó 6 principios psicológicos que los atacantes explotan en el pretexting:\n\n**1. 🤝 Reciprocidad:** "Te hago un favor, ahora necesito que me ayudes." El atacante primero ofrece algo (información, ayuda) para crear obligación.\n\n**2. 📋 Compromiso y Consistencia:** "Ya aceptaste participar en la encuesta, solo necesito un dato más." Una vez que la víctima accede a algo pequeño, es más probable que acceda a peticiones mayores.\n\n**3. 👥 Prueba Social:** "Todos tus compañeros ya verificaron sus datos." Si otros lo hicieron, parece seguro hacerlo.\n\n**4. 👔 Autoridad:** "Soy el director del departamento de TI." Las personas tienden a obedecer a figuras de autoridad sin cuestionar.\n\n**5. 😊 Simpatía:** "Somos del mismo departamento, ayúdame con esto." Los atacantes se presentan como personas agradables y cercanas.\n\n**6. ⏰ Escasez:** "Esta oferta expira en 1 hora" o "Solo quedan 2 lugares." La urgencia impulsa decisiones apresuradas.`,
        orden: 3,
      },
      {
        modulo_id: modulos[1].id,
        titulo: 'Cómo protegerte del Pretexting',
        tipo: 'texto',
        contenido: `**Estrategias de defensa:**\n\n✅ **Verifica la identidad:** Antes de compartir cualquier información, confirma la identidad de quien la solicita por un canal independiente.\n\n✅ **Cuestiona la urgencia:** Los pretexters siempre generan presión temporal. Tómate tu tiempo para verificar.\n\n✅ **Conoce los procedimientos oficiales:** Familiarízate con cómo tu universidad o empresa maneja las solicitudes de información. Los procesos legítimos NO requieren que compartas contraseñas.\n\n✅ **No reveles información sensible por teléfono o email:** Si alguien dice ser del soporte técnico, cuelga y llama directamente al número oficial de la institución.\n\n✅ **Aplica el principio de menor privilegio:** Solo comparte la información estrictamente necesaria.\n\n✅ **Confía en tu instinto:** Si algo se siente sospechoso, probablemente lo sea. Es mejor ser precavido que víctima.`,
        orden: 4,
      },
    ]);

    // --- MÓDULO 3: VISHING ---
    await Contenido.bulkCreate([
      {
        modulo_id: modulos[2].id,
        titulo: '¿Qué es el Vishing?',
        tipo: 'texto',
        contenido: `El vishing (Voice Phishing) es una variante del phishing que se realiza a través de llamadas telefónicas o mensajes de voz. El atacante se hace pasar por representantes de bancos, entidades gubernamentales, empresas de tecnología o instituciones educativas para extraer información confidencial.\n\n**¿Por qué es tan efectivo?**\n• La voz humana genera mayor confianza que un texto\n• La presión en tiempo real dificulta el análisis racional\n• Es más difícil verificar identidades por teléfono\n• Los atacantes pueden usar técnicas de spoofing para falsificar el número de origen\n• La interacción directa permite al atacante adaptar su estrategia en tiempo real\n\nSegún el informe de Verizon (2023), el vishing ha aumentado un 554% en frecuencia entre 2020 y 2023, convirtiéndose en una de las amenazas de más rápido crecimiento.`,
        orden: 1,
      },
      {
        modulo_id: modulos[2].id,
        titulo: 'Escenarios comunes de Vishing',
        tipo: 'ejemplo_interactivo',
        contenido: `📞 **ESCENARIOS TÍPICOS DE VISHING:**\n\n---\n**Escenario 1 — Falso soporte bancario:**\n"Buenas tardes, llamo del Banco Pichincha. Hemos detectado una transacción sospechosa en su cuenta por $450. Para bloquear la transacción, necesito verificar su número de cédula, número de tarjeta y los 3 dígitos de seguridad del reverso."\n\n---\n**Escenario 2 — Falso soporte técnico:**\n"Hola, soy del departamento de Microsoft. Su computadora está enviando alertas de virus a nuestro servidor. Necesito que instale un programa de acceso remoto para solucionarlo."\n\n---\n**Escenario 3 — Falsa autoridad universitaria:**\n"Hablo de Secretaría de la UTB. Hay un problema con su matrícula y necesitamos verificar sus datos personales y número de cédula para no perder su cupo."\n\n---\n\n🔍 **PATRÓN COMÚN:** Urgencia + Autoridad + Solicitud de datos sensibles = VISHING`,
        orden: 2,
      },
      {
        modulo_id: modulos[2].id,
        titulo: 'Cómo protegerte del Vishing',
        tipo: 'texto',
        contenido: `**Medidas de protección:**\n\n✅ **NUNCA proporciones datos sensibles por teléfono:** Ninguna entidad legítima te pedirá contraseñas, PINs o códigos de seguridad por teléfono.\n\n✅ **Cuelga y verifica:** Si recibes una llamada sospechosa, cuelga y llama directamente al número oficial de la institución.\n\n✅ **No confíes en el identificador de llamadas:** Los atacantes pueden falsificar números (spoofing) para que parezca que llaman desde un número legítimo.\n\n✅ **Registra los detalles:** Anota el nombre de quien llama, el departamento y el motivo. Esto te ayudará si necesitas reportar el incidente.\n\n✅ **Reporta las llamadas sospechosas:** Informa a tu banco, universidad o la entidad que supuestamente llamó.\n\n✅ **Usa aplicaciones de identificación de llamadas:** Apps como Truecaller pueden ayudar a identificar números reportados como fraude.`,
        orden: 3,
      },
    ]);

    // --- MÓDULO 4: BAITING ---
    await Contenido.bulkCreate([
      {
        modulo_id: modulos[3].id,
        titulo: '¿Qué es el Baiting?',
        tipo: 'texto',
        contenido: `El baiting (cebo) es una técnica de Ingeniería Social que utiliza un señuelo físico o digital para atraer a la víctima y comprometer su dispositivo o información.\n\n**Tipos de baiting:**\n\n🔌 **Baiting físico:** El atacante deja dispositivos USB, discos duros o CDs infectados con malware en lugares estratégicos (estacionamientos, cafeterías, pasillos universitarios) con la esperanza de que alguien los conecte a su computadora por curiosidad.\n\n💻 **Baiting digital:** El atacante ofrece descargas gratuitas de software, películas, música, videojuegos o e-books que en realidad contienen malware oculto.\n\nSegún un estudio de la Universidad de Illinois (Tischer et al., 2016), el 48% de las personas que encuentran una memoria USB la conectan a su computadora, y el 68% de ellas abre al menos un archivo del dispositivo.`,
        orden: 1,
      },
      {
        modulo_id: modulos[3].id,
        titulo: 'Ejemplo: Baiting en un campus universitario',
        tipo: 'ejemplo_interactivo',
        contenido: `🪤 **ESCENARIO DE BAITING:**\n\n---\nEn el pasillo de la Facultad FAFI, un estudiante encuentra una memoria USB con una etiqueta que dice "Exámenes Finales - Respuestas". Por curiosidad, la conecta a su laptop para ver el contenido.\n\nAl abrir la carpeta, ve archivos con nombres como:\n• "Respuestas_Examen_Final_2026.pdf.exe"\n• "Notas_Finales_Todos_Semestres.xlsx"\n\nAl abrir el archivo .pdf.exe, se instala un keylogger que registra todo lo que el estudiante escribe, incluyendo contraseñas y datos bancarios.\n\n---\n\n🔍 **SEÑALES DE ALERTA:**\n• La etiqueta de la USB está diseñada para generar curiosidad\n• Los nombres de archivos son deliberadamente atractivos\n• La extensión .pdf.exe es un truco clásico de doble extensión\n• Un archivo legítimo nunca tendría extensión .exe disfrazada\n\n**REGLA:** NUNCA conectes dispositivos USB desconocidos a tu computadora.`,
        orden: 2,
      },
      {
        modulo_id: modulos[3].id,
        titulo: 'Cómo protegerte del Baiting',
        tipo: 'texto',
        contenido: `**Medidas de protección:**\n\n✅ **NUNCA conectes dispositivos USB desconocidos:** Si encuentras una memoria USB, entrégala al departamento de TI o seguridad de la institución.\n\n✅ **Desconfía de descargas gratuitas:** Si algo es demasiado bueno para ser verdad, probablemente lo sea. Usa solo fuentes oficiales y repositorios confiables.\n\n✅ **Verifica las extensiones de archivo:** Los archivos maliciosos suelen disfrazarse con doble extensión (documento.pdf.exe). Activa la visualización de extensiones en tu sistema operativo.\n\n✅ **Mantén tu antivirus actualizado:** Un buen antivirus puede detectar malware en dispositivos USB y descargas.\n\n✅ **Usa entornos aislados (sandbox):** Si necesitas analizar un archivo sospechoso, hazlo en una máquina virtual o sandbox.\n\n✅ **Deshabilita la ejecución automática:** Configura tu sistema para que no ejecute automáticamente programas al conectar dispositivos USB.\n\n✅ **Descarga software solo de sitios oficiales:** Evita sitios de descargas piratas o enlaces compartidos en redes sociales.`,
        orden: 3,
      },
    ]);
    console.log('✅ Contenidos educativos creados');

    // ============================================================
    // 4. PREGUNTAS DE QUIZ (10 por módulo)
    // ============================================================

    // --- QUIZ MÓDULO 1: PHISHING ---
    await Pregunta.bulkCreate([
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Qué es el phishing?',
        opciones: [
          { id: 'a', texto: 'Un virus que destruye archivos del sistema operativo' },
          { id: 'b', texto: 'Una técnica para enviar comunicaciones fraudulentas que simulan ser de fuentes confiables' },
          { id: 'c', texto: 'Un programa de protección contra amenazas informáticas' },
          { id: 'd', texto: 'Un método de cifrado para proteger correos electrónicos' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El phishing consiste en enviar comunicaciones fraudulentas (correos, mensajes) que simulan provenir de fuentes legítimas para robar información confidencial.',
        orden: 1,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Cuál de las siguientes es una señal de alerta en un correo de phishing?',
        opciones: [
          { id: 'a', texto: 'El correo proviene de un dominio oficial verificado' },
          { id: 'b', texto: 'El mensaje solicita verificar información urgentemente bajo amenaza de suspensión de cuenta' },
          { id: 'c', texto: 'El correo tiene un saludo personalizado con tu nombre completo' },
          { id: 'd', texto: 'El correo incluye un número de teléfono oficial de contacto' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Los correos de phishing suelen generar urgencia extrema y amenazar con consecuencias graves si no actúas inmediatamente. Este es uno de los indicadores más claros de phishing.',
        orden: 2,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Qué es el spear phishing?',
        opciones: [
          { id: 'a', texto: 'Un ataque de phishing masivo enviado a millones de personas' },
          { id: 'b', texto: 'Un ataque de phishing dirigido a una persona o grupo específico con información personalizada' },
          { id: 'c', texto: 'Un tipo de phishing que solo funciona en dispositivos móviles' },
          { id: 'd', texto: 'Un software antiphishing desarrollado por Google' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El spear phishing es un ataque dirigido a una persona o grupo específico. El atacante investiga y personaliza el mensaje con datos reales de la víctima, haciéndolo mucho más convincente.',
        orden: 3,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Qué debes hacer si recibes un correo sospechoso de tu banco?',
        opciones: [
          { id: 'a', texto: 'Hacer clic en el enlace para verificar si es legítimo' },
          { id: 'b', texto: 'Responder al correo pidiendo más información' },
          { id: 'c', texto: 'Ignorar el correo, no hacer clic en ningún enlace y contactar a tu banco por canales oficiales' },
          { id: 'd', texto: 'Reenviar el correo a todos tus contactos como advertencia' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'Lo correcto es NO interactuar con el correo sospechoso y contactar directamente a tu banco por sus canales oficiales (teléfono del reverso de tu tarjeta o sitio web ingresando la URL manualmente).',
        orden: 4,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Qué es el smishing?',
        opciones: [
          { id: 'a', texto: 'Phishing realizado a través de mensajes de texto SMS' },
          { id: 'b', texto: 'Phishing realizado a través de redes sociales' },
          { id: 'c', texto: 'Un tipo de malware que se propaga por Bluetooth' },
          { id: 'd', texto: 'Una técnica de protección contra phishing' },
        ],
        respuesta_correcta: 'a',
        retroalimentacion: 'El smishing (SMS Phishing) es phishing realizado mediante mensajes de texto. Ejemplo: "Su paquete no pudo ser entregado, haga clic aquí para reprogramar."',
        orden: 5,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Cómo puedes verificar la autenticidad de un enlace en un correo electrónico?',
        opciones: [
          { id: 'a', texto: 'Haciendo clic en el enlace para ver a dónde dirige' },
          { id: 'b', texto: 'Pasando el cursor sobre el enlace sin hacer clic para ver la URL real' },
          { id: 'c', texto: 'Copiando el enlace y pegándolo directamente en el navegador' },
          { id: 'd', texto: 'Preguntándole a un compañero si el enlace parece seguro' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Al pasar el cursor sobre un enlace (sin hacer clic), puedes ver la URL real a la que dirige. Si la URL no coincide con el sitio oficial de la entidad, es probablemente phishing.',
        orden: 6,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: 'Según el APWG (2023), ¿cuántos sitios de phishing únicos se detectaron en el primer trimestre de 2023?',
        opciones: [
          { id: 'a', texto: 'Aproximadamente 100,000' },
          { id: 'b', texto: 'Aproximadamente 500,000' },
          { id: 'c', texto: 'Más de 1.3 millones' },
          { id: 'd', texto: 'Menos de 50,000' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'Según el Anti-Phishing Working Group (APWG, 2023), se detectaron más de 1.3 millones de sitios de phishing únicos en el primer trimestre de 2023.',
        orden: 7,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Qué medida de seguridad añade una capa extra de protección a tus cuentas contra el phishing?',
        opciones: [
          { id: 'a', texto: 'Usar la misma contraseña en todas las cuentas para recordarla mejor' },
          { id: 'b', texto: 'Activar la autenticación de dos factores (2FA)' },
          { id: 'c', texto: 'Guardar las contraseñas en un archivo de texto en el escritorio' },
          { id: 'd', texto: 'Compartir contraseñas con amigos de confianza como respaldo' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'La autenticación de dos factores (2FA) añade una capa adicional de seguridad. Incluso si un atacante obtiene tu contraseña, necesitará el segundo factor (código SMS, app, etc.) para acceder.',
        orden: 8,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Qué es el clone phishing?',
        opciones: [
          { id: 'a', texto: 'Un ataque que crea copias exactas de sitios web populares' },
          { id: 'b', texto: 'Un ataque que duplica un correo legítimo previo y reemplaza los enlaces o adjuntos con versiones maliciosas' },
          { id: 'c', texto: 'Un virus que se replica automáticamente en la red' },
          { id: 'd', texto: 'Una técnica para clonar tarjetas de crédito' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El clone phishing duplica un correo electrónico legítimo que la víctima recibió anteriormente, pero reemplaza los enlaces o archivos adjuntos con versiones maliciosas.',
        orden: 9,
      },
      {
        modulo_id: modulos[0].id,
        pregunta: '¿Cuál de los siguientes dominios de correo es SOSPECHOSO para la UTB?',
        opciones: [
          { id: 'a', texto: 'soporte@utb.edu.ec' },
          { id: 'b', texto: 'secretaria@utb.edu.ec' },
          { id: 'c', texto: 'admin@utb-soporte-tecnico.com' },
          { id: 'd', texto: 'academico@utb.edu.ec' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'El dominio @utb-soporte-tecnico.com NO es un dominio oficial de la UTB. El dominio legítimo es @utb.edu.ec. Siempre verifica que el dominio sea exactamente el oficial.',
        orden: 10,
      },
    ]);

    // --- QUIZ MÓDULO 2: PRETEXTING ---
    await Pregunta.bulkCreate([
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Qué es el pretexting?',
        opciones: [
          { id: 'a', texto: 'Un ataque directo a servidores mediante fuerza bruta' },
          { id: 'b', texto: 'La creación de un escenario ficticio para manipular a la víctima y obtener información' },
          { id: 'c', texto: 'Un tipo de virus informático que se propaga por USB' },
          { id: 'd', texto: 'Un método de cifrado avanzado' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El pretexting implica crear una historia o escenario falso (pretexto) para ganarse la confianza de la víctima y obtener información o acceso no autorizado.',
        orden: 1,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Cuál de los 6 principios de Cialdini se aplica cuando un atacante dice "Todos tus compañeros ya verificaron sus datos"?',
        opciones: [
          { id: 'a', texto: 'Reciprocidad' },
          { id: 'b', texto: 'Autoridad' },
          { id: 'c', texto: 'Prueba Social' },
          { id: 'd', texto: 'Escasez' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'El principio de Prueba Social nos lleva a hacer lo que otros hacen. Si "todos" ya lo hicieron, sentimos presión para seguir al grupo.',
        orden: 2,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Qué diferencia al pretexting del phishing tradicional?',
        opciones: [
          { id: 'a', texto: 'El pretexting solo se realiza por correo electrónico' },
          { id: 'b', texto: 'El pretexting requiere una interacción más elaborada y personalizada con la víctima' },
          { id: 'c', texto: 'El pretexting es menos peligroso que el phishing' },
          { id: 'd', texto: 'No hay diferencia, son lo mismo' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El pretexting requiere investigación previa y una interacción personalizada, construyendo una identidad y narrativa falsas. El phishing tiende a ser más masivo e impersonal.',
        orden: 3,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: 'Un desconocido te llama diciendo ser del soporte técnico de la UTB y pide tu contraseña. ¿Qué debes hacer?',
        opciones: [
          { id: 'a', texto: 'Darle la contraseña porque dice ser de la UTB' },
          { id: 'b', texto: 'Pedirle que te mande un correo con la solicitud' },
          { id: 'c', texto: 'No dar la contraseña, colgar y contactar directamente al departamento de TI de la UTB' },
          { id: 'd', texto: 'Darle solo la mitad de la contraseña para verificar' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'NUNCA compartas tu contraseña con nadie, sin importar quién diga ser. Ningún departamento de TI legítimo solicita contraseñas. Cuelga y contacta directamente al departamento oficial.',
        orden: 4,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Cuál de estos NO es un principio de persuasión de Cialdini?',
        opciones: [
          { id: 'a', texto: 'Reciprocidad' },
          { id: 'b', texto: 'Intimidación' },
          { id: 'c', texto: 'Autoridad' },
          { id: 'd', texto: 'Simpatía' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Los 6 principios de Cialdini son: Reciprocidad, Compromiso/Consistencia, Prueba Social, Autoridad, Simpatía y Escasez. La intimidación no es uno de ellos.',
        orden: 5,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Qué principio explota el atacante cuando dice "Soy el director del departamento"?',
        opciones: [
          { id: 'a', texto: 'Simpatía' },
          { id: 'b', texto: 'Escasez' },
          { id: 'c', texto: 'Autoridad' },
          { id: 'd', texto: 'Reciprocidad' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'El principio de Autoridad nos lleva a obedecer a figuras de poder sin cuestionar. Los atacantes se hacen pasar por directores, gerentes o personal de TI.',
        orden: 6,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Quién popularizó el término Ingeniería Social en el contexto de la ciberseguridad?',
        opciones: [
          { id: 'a', texto: 'Bill Gates' },
          { id: 'b', texto: 'Kevin Mitnick' },
          { id: 'c', texto: 'Steve Jobs' },
          { id: 'd', texto: 'Mark Zuckerberg' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Kevin Mitnick, uno de los hackers más célebres de la historia, popularizó el término Ingeniería Social y la definió como el arte de manipular a las personas para obtener información.',
        orden: 7,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Qué principio de Cialdini se aplica cuando "solo quedan 2 lugares disponibles"?',
        opciones: [
          { id: 'a', texto: 'Prueba Social' },
          { id: 'b', texto: 'Compromiso' },
          { id: 'c', texto: 'Escasez' },
          { id: 'd', texto: 'Simpatía' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'El principio de Escasez nos hace valorar más lo que es limitado o difícil de obtener. Los atacantes generan falsa escasez para apresurar las decisiones de la víctima.',
        orden: 8,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Cuál es la mejor estrategia para defenderse del pretexting?',
        opciones: [
          { id: 'a', texto: 'Confiar en las personas que parecen amables' },
          { id: 'b', texto: 'Verificar la identidad por un canal independiente antes de compartir información' },
          { id: 'c', texto: 'Dar información parcial para no revelar todo' },
          { id: 'd', texto: 'Pedir que envíen la solicitud por WhatsApp' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'La mejor defensa es verificar la identidad de quien solicita información usando un canal independiente: llama al número oficial de la institución o verifica en persona.',
        orden: 9,
      },
      {
        modulo_id: modulos[1].id,
        pregunta: '¿Qué porcentaje de incidentes de seguridad tienen origen en un error humano según IBM (2023)?',
        opciones: [
          { id: 'a', texto: '50%' },
          { id: 'b', texto: '75%' },
          { id: 'c', texto: 'Más del 95%' },
          { id: 'd', texto: '30%' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'Según IBM (2023), más del 95% de los incidentes de seguridad informática tienen como origen un error humano, lo que demuestra la importancia de la concientización.',
        orden: 10,
      },
    ]);

    // --- QUIZ MÓDULO 3: VISHING ---
    await Pregunta.bulkCreate([
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Qué es el vishing?',
        opciones: [
          { id: 'a', texto: 'Un virus que afecta a los teléfonos móviles' },
          { id: 'b', texto: 'Un fraude realizado mediante llamadas telefónicas o mensajes de voz' },
          { id: 'c', texto: 'Un tipo de antivirus para proteger llamadas' },
          { id: 'd', texto: 'Una técnica de cifrado de llamadas telefónicas' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El vishing (Voice Phishing) es un fraude realizado mediante llamadas telefónicas donde el atacante se hace pasar por una entidad legítima para robar información.',
        orden: 1,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Qué debes hacer si recibes una llamada de tu banco pidiendo datos de tu tarjeta?',
        opciones: [
          { id: 'a', texto: 'Proporcionar los datos solicitados para proteger tu cuenta' },
          { id: 'b', texto: 'Colgar y llamar al número oficial del banco impreso en tu tarjeta' },
          { id: 'c', texto: 'Pedir que te envíen un correo con la información' },
          { id: 'd', texto: 'Dar solo el número de tarjeta pero no el CVV' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Lo correcto es colgar y contactar al banco por su número oficial. Nunca proporciones datos sensibles en llamadas que no iniciaste tú.',
        orden: 2,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Qué es el spoofing telefónico?',
        opciones: [
          { id: 'a', texto: 'Un método para grabar llamadas telefónicas' },
          { id: 'b', texto: 'La falsificación del número de origen para que parezca una llamada legítima' },
          { id: 'c', texto: 'Un servicio de telefonía por internet' },
          { id: 'd', texto: 'Una herramienta para bloquear llamadas no deseadas' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El spoofing telefónico permite a los atacantes falsificar el número de origen, haciendo que una llamada fraudulenta aparezca como si proviniera de una entidad legítima.',
        orden: 3,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Por qué el vishing es particularmente efectivo?',
        opciones: [
          { id: 'a', texto: 'Porque los teléfonos son más vulnerables a virus' },
          { id: 'b', texto: 'Porque la voz genera confianza y la presión en tiempo real dificulta el análisis racional' },
          { id: 'c', texto: 'Porque no hay forma de identificar llamadas falsas' },
          { id: 'd', texto: 'Porque las líneas telefónicas no tienen seguridad' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'La voz humana genera mayor confianza que un texto. Además, la interacción en tiempo real presiona a la víctima y dificulta que piense con calma.',
        orden: 4,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Según Verizon (2023), cuánto ha aumentado la frecuencia del vishing entre 2020 y 2023?',
        opciones: [
          { id: 'a', texto: '100%' },
          { id: 'b', texto: '250%' },
          { id: 'c', texto: '554%' },
          { id: 'd', texto: '50%' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'El vishing ha aumentado un 554% en frecuencia entre 2020 y 2023, convirtiéndose en una de las amenazas de ciberseguridad de más rápido crecimiento.',
        orden: 5,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Cuál de los siguientes escenarios es un ejemplo clásico de vishing?',
        opciones: [
          { id: 'a', texto: 'Recibir un correo con un archivo adjunto sospechoso' },
          { id: 'b', texto: 'Encontrar una USB en el estacionamiento' },
          { id: 'c', texto: 'Recibir una llamada de alguien que dice ser de Microsoft y pide instalar un programa remoto' },
          { id: 'd', texto: 'Ver un anuncio engañoso en una red social' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'La llamada de alguien haciéndose pasar por soporte técnico de Microsoft es un escenario clásico de vishing. Microsoft NUNCA llama proactivamente a usuarios individuales.',
        orden: 6,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Qué dato NUNCA debes proporcionar en una llamada telefónica no solicitada?',
        opciones: [
          { id: 'a', texto: 'Tu nombre completo' },
          { id: 'b', texto: 'Tu número de cédula, contraseña o código de seguridad de tu tarjeta' },
          { id: 'c', texto: 'Tu dirección de correo electrónico' },
          { id: 'd', texto: 'Tu número de teléfono' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'NUNCA proporciones datos sensibles como cédula, contraseñas, PINs o códigos de seguridad por teléfono. Ninguna entidad legítima solicita esta información de esta manera.',
        orden: 7,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Qué aplicación puede ayudar a identificar llamadas de números reportados como fraude?',
        opciones: [
          { id: 'a', texto: 'WhatsApp' },
          { id: 'b', texto: 'Truecaller' },
          { id: 'c', texto: 'Instagram' },
          { id: 'd', texto: 'Facebook Messenger' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Truecaller es una aplicación que identifica llamadas de números desconocidos y alerta sobre números reportados como spam o fraude.',
        orden: 8,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Qué elemento tienen en común el phishing y el vishing?',
        opciones: [
          { id: 'a', texto: 'Ambos usan solo correo electrónico' },
          { id: 'b', texto: 'Ambos buscan engañar a la víctima para obtener información sensible' },
          { id: 'c', texto: 'Ambos requieren acceso físico al dispositivo de la víctima' },
          { id: 'd', texto: 'Ambos instalan virus en el computador' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Tanto el phishing como el vishing son técnicas de Ingeniería Social que buscan manipular a la víctima para que revele información confidencial. La diferencia es el canal: correo vs. teléfono.',
        orden: 9,
      },
      {
        modulo_id: modulos[2].id,
        pregunta: '¿Cuál es el primer paso que debes tomar si sospechas de una llamada de vishing?',
        opciones: [
          { id: 'a', texto: 'Seguir hablando para obtener más información del atacante' },
          { id: 'b', texto: 'Colgar la llamada inmediatamente' },
          { id: 'c', texto: 'Pedir el nombre de la persona y anotar el número' },
          { id: 'd', texto: 'Transferir la llamada a un familiar' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Lo primero es colgar la llamada. No intentes obtener información del atacante. Luego, contacta a la entidad real por sus canales oficiales para verificar si la llamada era legítima.',
        orden: 10,
      },
    ]);

    // --- QUIZ MÓDULO 4: BAITING ---
    await Pregunta.bulkCreate([
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Qué es el baiting en el contexto de la ciberseguridad?',
        opciones: [
          { id: 'a', texto: 'Un ataque que utiliza un señuelo físico o digital para comprometer al usuario' },
          { id: 'b', texto: 'Un método de protección mediante cebos de seguridad' },
          { id: 'c', texto: 'Una técnica para rastrear hackers' },
          { id: 'd', texto: 'Un tipo de firewall avanzado' },
        ],
        respuesta_correcta: 'a',
        retroalimentacion: 'El baiting utiliza cebos (físicos como USBs o digitales como descargas gratuitas) para atraer a la víctima y comprometer su dispositivo o información.',
        orden: 1,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Qué debes hacer si encuentras una memoria USB en el campus de la universidad?',
        opciones: [
          { id: 'a', texto: 'Conectarla a tu computadora para ver a quién pertenece' },
          { id: 'b', texto: 'Entregarla al departamento de TI o seguridad de la institución' },
          { id: 'c', texto: 'Conectarla en la computadora de un amigo primero' },
          { id: 'd', texto: 'Guardarla por si alguien la reclama después' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'NUNCA conectes dispositivos USB desconocidos. Entrega cualquier dispositivo encontrado al departamento de TI o seguridad, quienes cuentan con herramientas seguras para analizarlo.',
        orden: 2,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: 'Según un estudio de la Universidad de Illinois, ¿qué porcentaje de personas conecta una USB encontrada a su computadora?',
        opciones: [
          { id: 'a', texto: '15%' },
          { id: 'b', texto: '48%' },
          { id: 'c', texto: '80%' },
          { id: 'd', texto: '5%' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El estudio encontró que el 48% de las personas conectan USBs encontrados y el 68% de ellas abre al menos un archivo, demostrando lo efectivo que es el baiting.',
        orden: 3,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Qué indica la extensión .pdf.exe en un archivo?',
        opciones: [
          { id: 'a', texto: 'Es un PDF protegido con contraseña' },
          { id: 'b', texto: 'Es un archivo ejecutable disfrazado de PDF (potencialmente malicioso)' },
          { id: 'c', texto: 'Es un PDF de alta resolución' },
          { id: 'd', texto: 'Es un formato especial de Adobe' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'La doble extensión .pdf.exe es un truco clásico. El archivo realmente es un ejecutable (.exe) disfrazado como PDF. Al abrirlo, ejecuta código malicioso en tu sistema.',
        orden: 4,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Cuál de los siguientes es un ejemplo de baiting digital?',
        opciones: [
          { id: 'a', texto: 'Recibir una llamada de tu banco' },
          { id: 'b', texto: 'Una oferta de descarga gratuita de un software premium que contiene malware oculto' },
          { id: 'c', texto: 'Recibir un correo electrónico de phishing' },
          { id: 'd', texto: 'Que alguien te pida tu contraseña en persona' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Las descargas "gratuitas" de software, películas o juegos que contienen malware son el ejemplo más común de baiting digital. Si es demasiado bueno para ser verdad, probablemente lo sea.',
        orden: 5,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Qué función del sistema operativo debes deshabilitar para protegerte del baiting por USB?',
        opciones: [
          { id: 'a', texto: 'El Bluetooth' },
          { id: 'b', texto: 'La ejecución automática (AutoRun/AutoPlay)' },
          { id: 'c', texto: 'El Wi-Fi' },
          { id: 'd', texto: 'Las actualizaciones del sistema' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Deshabilitar la ejecución automática (AutoRun/AutoPlay) evita que programas maliciosos se ejecuten automáticamente al conectar un dispositivo USB.',
        orden: 6,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Qué tipo de malware se instala comúnmente a través de baiting por USB?',
        opciones: [
          { id: 'a', texto: 'Cookies' },
          { id: 'b', texto: 'Keyloggers que registran todo lo que escribes' },
          { id: 'c', texto: 'Extensiones del navegador' },
          { id: 'd', texto: 'Fuentes tipográficas' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Los keyloggers son malware que registra todas las pulsaciones de teclas, capturando contraseñas, mensajes y datos bancarios sin que el usuario lo sepa.',
        orden: 7,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Dónde debes descargar software de manera segura?',
        opciones: [
          { id: 'a', texto: 'De cualquier sitio que aparezca primero en Google' },
          { id: 'b', texto: 'De enlaces compartidos por desconocidos en redes sociales' },
          { id: 'c', texto: 'Exclusivamente desde los sitios web oficiales del desarrollador o tiendas autorizadas' },
          { id: 'd', texto: 'De sitios de descargas piratas porque son gratuitos' },
        ],
        respuesta_correcta: 'c',
        retroalimentacion: 'Siempre descarga software desde sitios oficiales del desarrollador o tiendas autorizadas (Microsoft Store, App Store, Google Play). Los sitios piratas frecuentemente incluyen malware.',
        orden: 8,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Qué es un sandbox en el contexto de la ciberseguridad?',
        opciones: [
          { id: 'a', texto: 'Un juego de computadora' },
          { id: 'b', texto: 'Un entorno aislado y seguro para ejecutar programas sospechosos sin riesgo' },
          { id: 'c', texto: 'Un tipo de memoria USB segura' },
          { id: 'd', texto: 'Un firewall de nueva generación' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'Un sandbox es un entorno aislado (como una máquina virtual) donde puedes ejecutar archivos sospechosos sin riesgo de que afecten tu sistema real.',
        orden: 9,
      },
      {
        modulo_id: modulos[3].id,
        pregunta: '¿Cuál es la principal motivación psicológica que explota el baiting?',
        opciones: [
          { id: 'a', texto: 'El miedo' },
          { id: 'b', texto: 'La curiosidad y la tentación por obtener algo gratis' },
          { id: 'c', texto: 'La autoridad' },
          { id: 'd', texto: 'La reciprocidad' },
        ],
        respuesta_correcta: 'b',
        retroalimentacion: 'El baiting explota principalmente la curiosidad humana y la tentación por obtener algo gratis o valioso. La etiqueta "Exámenes - Respuestas" en una USB apela directamente a estos impulsos.',
        orden: 10,
      },
    ]);

    console.log('[OK] 40 preguntas de quiz creadas (10 por modulo)');

    // ============================================================
    // 5. LOGROS
    // ============================================================
    await Logro.bulkCreate([
      {
        titulo: 'Primer Paso',
        descripcion: 'Completaste la encuesta diagnostica inicial.',
        icono: 'FiClipboard',
        color: '#3498DB',
        condicion: 'encuesta_completada',
        valor_requerido: 1,
      },
      {
        titulo: 'Estudiante Curioso',
        descripcion: 'Completaste tu primer modulo de aprendizaje.',
        icono: 'FiBookOpen',
        color: '#27AE60',
        condicion: 'primer_modulo',
        valor_requerido: 1,
      },
      {
        titulo: 'Detective Digital',
        descripcion: 'Aprobaste tu primer quiz satisfactoriamente.',
        icono: 'FiSearch',
        color: '#9B59B6',
        condicion: 'primer_quiz',
        valor_requerido: 1,
      },
      {
        titulo: 'Puntuacion Perfecta',
        descripcion: 'Obtuviste el 100% en un quiz. Excelente dominio del tema.',
        icono: 'FiStar',
        color: '#E74C3C',
        condicion: 'quiz_perfecto',
        valor_requerido: 1,
      },
      {
        titulo: 'Escudo Completo',
        descripcion: 'Completaste los 4 modulos de aprendizaje.',
        icono: 'FiShield',
        color: '#1B3A6B',
        condicion: 'todos_modulos',
        valor_requerido: 4,
      },
      {
        titulo: 'Master en Seguridad',
        descripcion: 'Obtuviste tu certificado oficial de PhishGuard UTB.',
        icono: 'FiAward',
        color: '#F39C12',
        condicion: 'certificado',
        valor_requerido: 1,
      },
      {
        titulo: 'Perfeccionista',
        descripcion: 'Aprobaste todos los quizzes con 90% o mas.',
        icono: 'FiZap',
        color: '#E67E22',
        condicion: 'quizzes_90',
        valor_requerido: 1,
      },
    ]);
    console.log('[OK] 7 logros creados');

    // ============================================================
    // RESUMEN
    // ============================================================
    console.log('\n  PhishGuard UTB - Seed completado exitosamente');
    console.log('================================================');
    console.log('  1 usuario admin (admin@phishguard.utb.edu.ec / admin123)');
    console.log('  4 modulos de aprendizaje');
    console.log('  15 contenidos educativos');
    console.log('  40 preguntas de quiz');
    console.log('  7 logros predefinidos');
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error en seed:', error);
    process.exit(1);
  }
};

seed();
