// ============================================================
// PhishGuard UTB - Modelo: Progreso del Módulo
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgresoModulo = sequelize.define('progreso_modulos', {
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
  completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  porcentaje_avance: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  contenidos_vistos: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array de IDs de contenidos vistos',
  },
  ultimo_contenido_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'contenidos',
      key: 'id',
    },
    comment: 'ID del ultimo contenido/diapositiva visitado',
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fecha_completado: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['usuario_id', 'modulo_id'],
    },
  ],
});

module.exports = ProgresoModulo;
