// ============================================================
// PhishGuard UTB - Punto de Entrada Principal
// Universidad Tecnica de Babahoyo - FAFI
// Carrera de Sistemas de Informacion - 6to Semestre
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { sequelize } = require('./models');

const app = express();

// ============================================================
// MIDDLEWARES DE SEGURIDAD
// ============================================================

app.use(helmet());

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de acceso. Intente en 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================================
// RUTAS API
// ============================================================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/modulos', require('./routes/moduloRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/progreso', require('./routes/progresoRoutes'));
app.use('/api/encuesta', require('./routes/encuestaRoutes'));
app.use('/api/certificado', require('./routes/certificadoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contenidos', require('./routes/contenidoRoutes'));
app.use('/api/preguntas', require('./routes/preguntaRoutes'));
app.use('/api/logros', require('./routes/logroRoutes'));
app.use('/api/notificaciones', require('./routes/notificacionRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PhishGuard UTB API en funcionamiento.',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// MANEJO DE ERRORES
// ============================================================

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada.' });
});

app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor.' });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Conexion a PostgreSQL exitosa');

    await sequelize.sync();
    console.log('[OK] Modelos sincronizados con la base de datos');

    app.listen(env.PORT, () => {
      console.log(`
========================================
  PhishGuard UTB - API Server v2.0
  Puerto: ${env.PORT}
  Entorno: ${env.NODE_ENV}
  BD: ${env.DB_NAME}
  Universidad Tecnica de Babahoyo
  Carrera de Sistemas de Informacion
========================================
      `);
    });
  } catch (error) {
    console.error('[ERROR] Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
