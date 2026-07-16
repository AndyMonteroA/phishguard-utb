// ============================================================
// PhishGuard UTB - Modelo: Contenido
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contenido = sequelize.define('contenidos', {
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
  titulo: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('texto', 'video', 'imagen', 'ejemplo_interactivo', 'caso_real'),
    defaultValue: 'texto',
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Contenido;
