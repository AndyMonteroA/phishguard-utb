-- ============================================================
-- PhishGuard UTB - Script Completo de Base de Datos
-- Universidad Tecnica de Babahoyo - FAFI
-- Carrera de Sistemas de Informacion - 6to Semestre 2026
-- ============================================================
-- INSTRUCCIONES:
--   1. Conectarse como superusuario (postgres)
--   2. Ejecutar: psql -U postgres -f init.sql
-- ============================================================

-- Crear la base de datos (si no existe)
SELECT 'CREATE DATABASE phishguard_utb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'phishguard_utb')\gexec

-- Conectar a la base de datos
\c phishguard_utb;

-- ============================================================
-- TIPOS ENUM
-- ============================================================
DO $$ BEGIN
  CREATE TYPE enum_usuarios_rol AS ENUM ('estudiante', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enum_usuarios_genero AS ENUM ('masculino', 'femenino', 'prefiero_no_indicar');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enum_contenidos_tipo AS ENUM ('texto', 'video', 'imagen', 'ejemplo_interactivo', 'caso_real');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enum_encuestas_nivel AS ENUM ('bajo', 'medio', 'alto');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enum_notificaciones_tipo AS ENUM ('logro', 'quiz', 'modulo', 'sistema');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 1. TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol enum_usuarios_rol NOT NULL DEFAULT 'estudiante',
  semestre INTEGER CHECK (semestre >= 1 AND semestre <= 8),
  genero enum_usuarios_genero,
  usa_correo_institucional BOOLEAN DEFAULT FALSE,
  encuesta_completada BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABLA: modulos
-- ============================================================
CREATE TABLE IF NOT EXISTS modulos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 1,
  icono VARCHAR(50) DEFAULT 'FiShield',
  color VARCHAR(7) DEFAULT '#1B3A6B',
  duracion_estimada VARCHAR(50) DEFAULT '30 minutos',
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA: contenidos
-- ============================================================
CREATE TABLE IF NOT EXISTS contenidos (
  id SERIAL PRIMARY KEY,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  titulo VARCHAR(300) NOT NULL,
  tipo enum_contenidos_tipo NOT NULL DEFAULT 'texto',
  contenido TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contenidos_modulo ON contenidos(modulo_id);

-- ============================================================
-- 4. TABLA: preguntas
-- ============================================================
CREATE TABLE IF NOT EXISTS preguntas (
  id SERIAL PRIMARY KEY,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  opciones JSONB NOT NULL,
  respuesta_correcta VARCHAR(5) NOT NULL,
  retroalimentacion TEXT,
  orden INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preguntas_modulo ON preguntas(modulo_id);

-- ============================================================
-- 5. TABLA: progreso_modulos
-- ============================================================
CREATE TABLE IF NOT EXISTS progreso_modulos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
  contenidos_vistos JSONB DEFAULT '[]'::jsonb,
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, modulo_id)
);

CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_modulos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_modulo ON progreso_modulos(modulo_id);

-- ============================================================
-- 6. TABLA: resultados_quiz
-- ============================================================
CREATE TABLE IF NOT EXISTS resultados_quiz (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  puntaje INTEGER NOT NULL DEFAULT 0,
  total_preguntas INTEGER NOT NULL DEFAULT 10,
  respuestas JSONB NOT NULL,
  aprobado BOOLEAN DEFAULT FALSE,
  tiempo_empleado INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resultados_usuario ON resultados_quiz(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resultados_modulo ON resultados_quiz(modulo_id);

-- ============================================================
-- 7. TABLA: encuestas_diagnosticas
-- ============================================================
CREATE TABLE IF NOT EXISTS encuestas_diagnosticas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  respuestas JSONB NOT NULL,
  puntaje_conocimiento INTEGER,
  nivel enum_encuestas_nivel,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. TABLA: certificados
-- ============================================================
CREATE TABLE IF NOT EXISTS certificados (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  codigo_unico VARCHAR(50) NOT NULL UNIQUE,
  fecha_emision TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  nombre_completo VARCHAR(255) NOT NULL,
  puntaje_promedio FLOAT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. TABLA: logros
-- ============================================================
CREATE TABLE IF NOT EXISTS logros (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  icono VARCHAR(50) NOT NULL DEFAULT 'FiAward',
  color VARCHAR(7) NOT NULL DEFAULT '#F39C12',
  condicion VARCHAR(50) NOT NULL,
  valor_requerido INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. TABLA: logros_usuarios (pivote N:M)
-- ============================================================
CREATE TABLE IF NOT EXISTS logros_usuarios (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  logro_id INTEGER NOT NULL REFERENCES logros(id) ON DELETE CASCADE,
  fecha_obtenido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, logro_id)
);

CREATE INDEX IF NOT EXISTS idx_logros_usuarios_usuario ON logros_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logros_usuarios_logro ON logros_usuarios(logro_id);

-- ============================================================
-- 11. TABLA: notificaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo enum_notificaciones_tipo NOT NULL DEFAULT 'sistema',
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  enlace VARCHAR(300),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(usuario_id, leida);

-- ============================================================
-- RESUMEN
-- ============================================================
-- 11 tablas creadas:
--   1. usuarios          - Estudiantes y administradores
--   2. modulos           - 4 modulos de aprendizaje
--   3. contenidos        - Contenido educativo por modulo
--   4. preguntas         - Preguntas de quiz por modulo
--   5. progreso_modulos  - Seguimiento del avance por usuario
--   6. resultados_quiz   - Resultados de quizzes realizados
--   7. encuestas_diagnosticas - Encuesta diagnostica inicial
--   8. certificados      - Certificados emitidos
--   9. logros            - Logros/achievements disponibles
--  10. logros_usuarios   - Relacion N:M usuarios-logros
--  11. notificaciones    - Notificaciones in-app
--
-- Despues de crear las tablas, ejecutar el seeder:
--   cd phishguard-backend && npm run seed
-- ============================================================
