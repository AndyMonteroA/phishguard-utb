// ============================================================
// PhishGuard UTB - Modelo: Certificado
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Certificado = sequelize.define('certificados', {
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
  codigo_unico: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    defaultValue: () => `PG-UTB-${uuidv4().substring(0, 8).toUpperCase()}`,
  },
  fecha_emision: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  nombre_completo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  puntaje_promedio: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

module.exports = Certificado;
