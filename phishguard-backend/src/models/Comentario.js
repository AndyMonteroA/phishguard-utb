// ============================================================
// PhishGuard UTB - Modelo: Comentario
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  modulo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'comentarios',
  timestamps: true,
});

module.exports = Comentario;
