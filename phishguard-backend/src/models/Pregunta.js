// ============================================================
// PhishGuard UTB - Modelo: Pregunta (Quiz)
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pregunta = sequelize.define('preguntas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  modulo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modulos',
      key: 'id',
    },
  },
  pregunta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  opciones: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array de opciones: [{id: "a", texto: "..."}]',
  },
  respuesta_correcta: {
    type: DataTypes.STRING(5),
    allowNull: false,
    comment: 'ID de la opción correcta (a, b, c, d)',
  },
  retroalimentacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Explicación que se muestra al responder',
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = Pregunta;
