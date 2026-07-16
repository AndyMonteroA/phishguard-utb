// ============================================================
// PhishGuard UTB - Modelo: Encuesta Diagnóstica
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EncuestaDiagnostica = sequelize.define('encuestas_diagnosticas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id',
    },
  },
  respuestas: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array: [{pregunta_id, respuesta}]',
  },
  puntaje_conocimiento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Puntaje calculado del nivel de conocimiento (0-100)',
  },
  nivel: {
    type: DataTypes.ENUM('bajo', 'medio', 'alto'),
    allowNull: true,
    comment: 'Nivel de conocimiento categorizado',
  },
});

module.exports = EncuestaDiagnostica;
