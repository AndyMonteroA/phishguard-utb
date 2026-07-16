// ============================================================
// PhishGuard UTB - Modelo: Notificacion
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('notificaciones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  tipo: {
    type: DataTypes.ENUM('logro', 'quiz', 'modulo', 'sistema'),
    defaultValue: 'sistema',
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  enlace: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
});

module.exports = Notificacion;
