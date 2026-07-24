// ============================================================
// PhishGuard UTB - Modelo: Usuario
// ============================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' },
      len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' },
    },
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El apellido es obligatorio' },
      len: { args: [2, 100], msg: 'El apellido debe tener entre 2 y 100 caracteres' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Este correo electrónico ya está registrado' },
    validate: {
      isEmail: { msg: 'Debe proporcionar un correo electrónico válido' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'La contraseña debe tener al menos 6 caracteres' },
    },
  },
  rol: {
    type: DataTypes.ENUM('estudiante', 'admin'),
    defaultValue: 'estudiante',
    allowNull: false,
  },
  semestre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 8,
    },
  },
  genero: {
    type: DataTypes.ENUM('masculino', 'femenino', 'prefiero_no_indicar'),
    allowNull: true,
  },
  usa_correo_institucional: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  encuesta_completada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token hasheado para recuperación de contraseña',
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración del token de recuperación (1 hora)',
  },
}, {
  hooks: {
    // Hashear contraseña antes de crear
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    // Hashear contraseña antes de actualizar (si cambió)
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
  },
});

// Método para verificar contraseña
Usuario.prototype.verificarPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Excluir password al serializar a JSON
Usuario.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = Usuario;
