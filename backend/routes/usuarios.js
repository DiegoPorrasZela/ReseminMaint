// routes/usuarios.js — Rutas para gestión del perfil de usuario

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const db      = require('../db');

// ============================================================
// GET /api/usuarios/:id — Obtener datos de un usuario
// ============================================================
router.get('/:id', (req, res) => {
  // No seleccionamos password_hash por seguridad
  const consulta = 'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?';

  db.query(consulta, [req.params.id], (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener usuario' });
    if (resultados.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(resultados[0]);
  });
});

// ============================================================
// PUT /api/usuarios/:id — Actualizar nombre y email del perfil
// ============================================================
router.put('/:id', (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  db.query(
    'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
    [nombre, email, req.params.id],
    (error) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo ya está en uso' });
        }
        return res.status(500).json({ error: 'Error al actualizar perfil' });
      }
      res.json({ mensaje: 'Perfil actualizado correctamente' });
    }
  );
});

// ============================================================
// PUT /api/usuarios/:id/password — Cambiar contraseña
// ============================================================
router.put('/:id/password', async (req, res) => {
  const { password_actual, password_nueva } = req.body;

  if (!password_actual || !password_nueva) {
    return res.status(400).json({ error: 'Ambas contraseñas son obligatorias' });
  }

  // Primero obtenemos el hash actual del usuario
  db.query('SELECT password_hash FROM usuarios WHERE id = ?', [req.params.id], async (error, resultados) => {
    if (error || resultados.length === 0) {
      return res.status(500).json({ error: 'Error del servidor' });
    }

    // Verificamos que la contraseña actual sea correcta
    const esValida = await bcrypt.compare(password_actual, resultados[0].password_hash);
    if (!esValida) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Encriptamos la nueva contraseña antes de guardarla
    const nuevoHash = await bcrypt.hash(password_nueva, 10);

    db.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [nuevoHash, req.params.id], (error2) => {
      if (error2) return res.status(500).json({ error: 'Error al cambiar contraseña' });
      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    });
  });
});

module.exports = router;
