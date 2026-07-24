-- ============================================================
-- PhishGuard UTB - Migración: Añadir campos de recuperación de contraseña
-- Ejecutar en producción: psql -U phishguard_user -d phishguard_utb -f add_reset_password.sql
-- ============================================================

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ DEFAULT NULL;

-- Verificar que se crearon correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND column_name IN ('reset_password_token', 'reset_password_expires');
