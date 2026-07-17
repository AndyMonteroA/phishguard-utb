// ============================================================
// PhishGuard UTB - Middleware: Validación de Entradas
// ============================================================

const { body, validationResult } = require('express-validator');

// Manejar errores de validación
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
      })),
    });
  }
  next();
};

// Validaciones para registro
const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('semestre')
    .optional()
    .isInt({ min: 1, max: 8 }).withMessage('El semestre debe estar entre 1 y 8'),
  body('genero')
    .optional()
    .isIn(['masculino', 'femenino', 'prefiero_no_indicar']).withMessage('Género no válido'),
  handleValidation,
];

// Validaciones para login
const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
  handleValidation,
];

// Validaciones para encuesta
const validarEncuesta = [
  body('respuestas')
    .isArray({ min: 1 }).withMessage('Debe proporcionar al menos una respuesta'),
  body('respuestas.*.pregunta_id')
    .notEmpty().withMessage('Cada respuesta debe tener un ID de pregunta'),
  body('respuestas.*.respuesta')
    .notEmpty().withMessage('Cada pregunta debe tener una respuesta'),
  handleValidation,
];

// Validaciones para quiz
const validarQuiz = [
  body('respuestas')
    .isArray({ min: 1 }).withMessage('Debe proporcionar al menos una respuesta'),
  body('respuestas.*.pregunta_id')
    .isInt().withMessage('ID de pregunta inválido'),
  body('respuestas.*.respuesta')
    .notEmpty().withMessage('Cada pregunta debe tener una respuesta'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validarRegistro,
  validarLogin,
  validarEncuesta,
  validarQuiz,
};
