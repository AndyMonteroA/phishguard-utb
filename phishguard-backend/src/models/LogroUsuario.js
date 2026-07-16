// ============================================================
// PhishGuard UTB - Modelo: LogroUsuario (tabla pivote)
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogroUsuario = sequelize.define('logros_usuarios', {
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
  logro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'logros', key: 'id' },
  },
  fecha_obtenido: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [
    { unique: true, fields: ['usuario_id', 'logro_id'] },
  ],
});

module.exports = LogroUsuario;
