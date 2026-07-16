// ============================================================
// PhishGuard UTB - Modelo: Logro
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Logro = sequelize.define('logros', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icono: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'FiAward',
    comment: 'Nombre del icono de react-icons',
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#F39C12',
  },
  condicion: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'encuesta_completada, primer_modulo, primer_quiz, quiz_perfecto, todos_modulos, certificado, quizzes_90',
  },
  valor_requerido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Logro;
