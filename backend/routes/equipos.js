const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');
const { requireSupervisor } = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
  db.query('SELECT * FROM equipos ORDER BY codigo ASC', (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener equipos' });
    res.json(resultados);
  });
});

router.get('/:id', auth, (req, res) => {
  db.query('SELECT * FROM equipos WHERE id = ?', [req.params.id], (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener equipo' });

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json(resultados[0]);
  });
});

// Registrar un equipo nuevo (solo supervisores)
router.post('/', auth, requireSupervisor, (req, res) => {
  const { codigo, nombre, tipo, ubicacion } = req.body;

  if (!codigo || !nombre || !tipo || !ubicacion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  db.query(
    'INSERT INTO equipos (codigo, nombre, tipo, ubicacion) VALUES (?, ?, ?, ?)',
    [codigo.trim().toUpperCase(), nombre, tipo, ubicacion],
    (error, resultado) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Ya existe un equipo con ese código' });
        }
        return res.status(500).json({ error: 'Error al registrar equipo' });
      }
      res.status(201).json({ mensaje: 'Equipo registrado correctamente', id: resultado.insertId });
    }
  );
});

// Editar datos de un equipo (solo supervisores)
router.put('/:id', auth, requireSupervisor, (req, res) => {
  const { codigo, nombre, tipo, ubicacion } = req.body;

  if (!codigo || !nombre || !tipo || !ubicacion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  db.query(
    'UPDATE equipos SET codigo = ?, nombre = ?, tipo = ?, ubicacion = ? WHERE id = ?',
    [codigo.trim().toUpperCase(), nombre, tipo, ubicacion, req.params.id],
    (error, resultado) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Ya existe un equipo con ese código' });
        }
        return res.status(500).json({ error: 'Error al actualizar equipo' });
      }
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }
      res.json({ mensaje: 'Equipo actualizado correctamente' });
    }
  );
});

router.put('/:id/estado', auth, requireSupervisor, (req, res) => {
  const { estado } = req.body;

  const estadosValidos = ['operativo', 'en_mantenimiento', 'fuera_de_servicio'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  db.query(
    'UPDATE equipos SET estado = ? WHERE id = ?',
    [estado, req.params.id],
    (error) => {
      if (error) return res.status(500).json({ error: 'Error al actualizar estado del equipo' });
      res.json({ mensaje: 'Estado del equipo actualizado correctamente' });
    }
  );
});

module.exports = router;
