// ============================================================
// PhishGuard UTB - Rutas: Administración
// ============================================================

const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
  obtenerEstadisticas,
  listarEstudiantes,
  toggleUsuario,
  exportarExcel,
  obtenerErrores,
  obtenerEvolucion,
  obtenerMejora,
} = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const autorizar = require('../middlewares/roles');

// Configuración de Multer para subida de archivos (Imágenes, PDFs, etc.)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // Asegurar que la carpeta existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.mp4', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo imágenes, PDFs y videos cortos.'));
    }
  }
});

router.use(auth, autorizar('admin'));

router.get('/estadisticas', obtenerEstadisticas);
router.get('/estudiantes', listarEstudiantes);
router.put('/usuarios/:id/toggle', toggleUsuario);
router.get('/exportar', exportarExcel);
router.get('/analitica/errores', obtenerErrores);
router.get('/analitica/evolucion', obtenerEvolucion);
router.get('/analitica/mejora', obtenerMejora);

// Endpoint de subida de archivos
router.post('/subir', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
    }
    // Generar URL pública para retornar al cliente
    // Usaremos una ruta relativa que funcione tanto en local como en producción
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Archivo subido exitosamente.',
      url: fileUrl,
      nombreOriginal: req.file.originalname,
      tipo: req.file.mimetype
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al procesar la subida.' });
  }
});

module.exports = router;
