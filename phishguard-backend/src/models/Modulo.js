// ============================================================
// PhishGuard UTB - Modelo: Módulo
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Modulo = sequelize.define('modulos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  icono: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '🛡️',
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#1B3A6B',
  },
  duracion_estimada: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '30 minutos',
  },
  imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Modulo;
