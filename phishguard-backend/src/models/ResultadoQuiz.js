// ============================================================
// PhishGuard UTB - Modelo: Resultado del Quiz
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResultadoQuiz = sequelize.define('resultados_quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id',
    },
  },
  modulo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modulos',
      key: 'id',
    },
  },
  puntaje: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_preguntas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  respuestas: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array: [{pregunta_id, respuesta_usuario, correcta}]',
  },
  aprobado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'true si puntaje >= 70%',
  },
  tiempo_empleado: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo en segundos',
  },
});

module.exports = ResultadoQuiz;
