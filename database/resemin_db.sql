-- ============================================
-- BASE DE DATOS: ReseminMaint
-- Sistema de Control de Mantenimiento Minero
-- Empresa: Resemin S.A.
-- ============================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS resemin_db;

-- Seleccionar la base de datos para usarla
USE resemin_db;

-- ============================================
-- TABLA: usuarios
-- Guarda los datos de cada usuario del sistema
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,  -- ID único, se incrementa solo
  nombre        VARCHAR(100) NOT NULL,            -- Nombre completo del usuario
  email         VARCHAR(100) UNIQUE NOT NULL,     -- Email único (no puede repetirse)
  password_hash VARCHAR(255) NOT NULL,            -- Contraseña encriptada con bcrypt
  rol           ENUM('tecnico', 'supervisor') DEFAULT 'tecnico',  -- Rol del usuario
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Fecha de registro automática
);

-- ============================================
-- TABLA: equipos
-- Catálogo de equipos de minería subterránea
-- ============================================
CREATE TABLE IF NOT EXISTS equipos (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  codigo    VARCHAR(50) UNIQUE NOT NULL,   -- Código identificador del equipo (ej: EQ-001)
  nombre    VARCHAR(100) NOT NULL,          -- Nombre del equipo
  tipo      VARCHAR(100) NOT NULL,          -- Tipo: Perforadora, Cargador, etc.
  ubicacion VARCHAR(100) NOT NULL,          -- Ubicación en la mina
  estado    ENUM('operativo', 'en_mantenimiento', 'fuera_de_servicio') DEFAULT 'operativo'
);

-- ============================================
-- TABLA: mantenimientos
-- Registros de mantenimiento por equipo
-- ============================================
CREATE TABLE IF NOT EXISTS mantenimientos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id        INT NOT NULL,             -- ID del equipo (referencia a tabla equipos)
  tecnico_id       INT NOT NULL,             -- ID del técnico (referencia a tabla usuarios)
  tipo             ENUM('preventivo', 'correctivo') NOT NULL,
  descripcion      TEXT,                     -- Descripción del trabajo realizado
  fecha_programada DATE NOT NULL,            -- Fecha programada del mantenimiento
  estado           ENUM('pendiente', 'en_proceso', 'completado') DEFAULT 'pendiente',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id)  REFERENCES equipos(id),   -- Relación con tabla equipos
  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)   -- Relación con tabla usuarios
);

-- ============================================
-- DATOS DE PRUEBA: Equipos
-- Se insertan 5 equipos de ejemplo
-- ============================================
INSERT INTO equipos (codigo, nombre, tipo, ubicacion, estado) VALUES
('EQ-001', 'Jumbo Drill Atlas Copco', 'Perforadora',         'Nivel 3 - Galería A',        'operativo'),
('EQ-002', 'Cargador Sandvik LH514', 'Cargador LHD',        'Nivel 2 - Galería B',        'en_mantenimiento'),
('EQ-003', 'Dumper MT2010',          'Volquete Subterráneo', 'Nivel 1 - Acceso Principal', 'operativo'),
('EQ-004', 'Robot Perforador R2',    'Perforadora Robótica', 'Nivel 4 - Galería C',        'operativo'),
('EQ-005', 'Mezclador Normet MB400', 'Mezcladora',           'Nivel 2 - Galería A',        'fuera_de_servicio');