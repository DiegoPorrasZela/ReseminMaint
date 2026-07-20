-- ============================================
-- MIGRACIÓN v2: ReseminMaint
-- Ejecutar SOLO si la base de datos ya existe
-- (si es instalación nueva, usar resemin_db.sql)
-- ============================================

USE resemin_db;

-- Fecha real en que se completó el mantenimiento
ALTER TABLE mantenimientos
  ADD COLUMN fecha_completado DATE DEFAULT NULL AFTER fecha_programada;

-- Observaciones del técnico al cerrar el trabajo
ALTER TABLE mantenimientos
  ADD COLUMN observaciones TEXT AFTER fecha_completado;