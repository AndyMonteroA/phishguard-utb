// ============================================================
// PhishGuard UTB - Índice de Modelos y Relaciones
// ============================================================

const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Modulo = require('./Modulo');
const Contenido = require('./Contenido');
const Pregunta = require('./Pregunta');
const ProgresoModulo = require('./ProgresoModulo');
const ResultadoQuiz = require('./ResultadoQuiz');
const EncuestaDiagnostica = require('./EncuestaDiagnostica');
const Certificado = require('./Certificado');
const Logro = require('./Logro');
const LogroUsuario = require('./LogroUsuario');
const Notificacion = require('./Notificacion');

// ============================================================
// RELACIONES
// ============================================================

// Módulo -> Contenidos (1:N)
Modulo.hasMany(Contenido, { foreignKey: 'modulo_id', as: 'contenidos' });
Contenido.belongsTo(Modulo, { foreignKey: 'modulo_id', as: 'modulo' });

// Módulo -> Preguntas (1:N)
Modulo.hasMany(Pregunta, { foreignKey: 'modulo_id', as: 'preguntas' });
Pregunta.belongsTo(Modulo, { foreignKey: 'modulo_id', as: 'modulo' });

// Usuario -> ProgresoModulo (1:N)
Usuario.hasMany(ProgresoModulo, { foreignKey: 'usuario_id', as: 'progresos' });
ProgresoModulo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Módulo -> ProgresoModulo (1:N)
Modulo.hasMany(ProgresoModulo, { foreignKey: 'modulo_id', as: 'progresos' });
ProgresoModulo.belongsTo(Modulo, { foreignKey: 'modulo_id', as: 'modulo' });

// Usuario -> ResultadoQuiz (1:N)
Usuario.hasMany(ResultadoQuiz, { foreignKey: 'usuario_id', as: 'resultados' });
ResultadoQuiz.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Módulo -> ResultadoQuiz (1:N)
Modulo.hasMany(ResultadoQuiz, { foreignKey: 'modulo_id', as: 'resultados' });
ResultadoQuiz.belongsTo(Modulo, { foreignKey: 'modulo_id', as: 'modulo' });

// Usuario -> EncuestaDiagnostica (1:1)
Usuario.hasOne(EncuestaDiagnostica, { foreignKey: 'usuario_id', as: 'encuesta' });
EncuestaDiagnostica.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Usuario -> Certificado (1:1)
Usuario.hasOne(Certificado, { foreignKey: 'usuario_id', as: 'certificado' });
Certificado.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Logros (N:M a través de LogroUsuario)
Usuario.belongsToMany(Logro, { through: LogroUsuario, foreignKey: 'usuario_id', as: 'logros' });
Logro.belongsToMany(Usuario, { through: LogroUsuario, foreignKey: 'logro_id', as: 'usuarios' });
Usuario.hasMany(LogroUsuario, { foreignKey: 'usuario_id', as: 'logrosObtenidos' });
LogroUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
LogroUsuario.belongsTo(Logro, { foreignKey: 'logro_id', as: 'logro' });

// Usuario -> Notificaciones (1:N)
Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = {
  sequelize,
  Usuario,
  Modulo,
  Contenido,
  Pregunta,
  ProgresoModulo,
  ResultadoQuiz,
  EncuestaDiagnostica,
  Certificado,
  Logro,
  LogroUsuario,
  Notificacion,
};
