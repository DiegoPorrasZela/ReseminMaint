const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
  const { tecnico_id } = req.query;

  let consulta = `
    SELECT
      m.*,
      e.nombre AS equipo_nombre,
      e.codigo AS equipo_codigo,
      u.nombre AS tecnico_nombre
    FROM mantenimientos m
    JOIN equipos  e ON m.equipo_id  = e.id
    JOIN usuarios u ON m.tecnico_id = u.id
  `;

  const params = [];
  if (tecnico_id) {
    consulta += ' WHERE m.tecnico_id = ?';
    params.push(parseInt(tecnico_id));
  }

  consulta += ' ORDER BY m.fecha_programada ASC, m.created_at DESC';

  db.query(consulta, params, (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener mantenimientos' });
    res.json(resultados);
  });
});

router.get('/mis-tareas', auth, (req, res) => {
  const consulta = `
    SELECT
      m.*,
      e.nombre AS equipo_nombre,
      e.codigo AS equipo_codigo,
      u.nombre AS tecnico_nombre
    FROM mantenimientos m
    JOIN equipos  e ON m.equipo_id  = e.id
    JOIN usuarios u ON m.tecnico_id = u.id
    WHERE m.tecnico_id = ?
    ORDER BY m.fecha_programada ASC, m.created_at DESC
  `;

  db.query(consulta, [req.usuario.id], (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener tareas' });
    res.json(resultados);
  });
});

router.post('/', auth, (req, res) => {
  const { equipo_id, tecnico_id, tipo, descripcion, fecha_programada } = req.body;

  if (!equipo_id || !tecnico_id || !tipo || !fecha_programada) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const consulta = `
    INSERT INTO mantenimientos (equipo_id, tecnico_id, tipo, descripcion, fecha_programada)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(consulta, [equipo_id, tecnico_id, tipo, descripcion, fecha_programada], (error, resultado) => {
    if (error) return res.status(500).json({ error: 'Error al crear mantenimiento' });
    res.status(201).json({ mensaje: 'Mantenimiento registrado', id: resultado.insertId });
  });
});

router.put('/:id/estado', auth, (req, res) => {
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'en_proceso', 'completado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  if (req.usuario.rol === 'supervisor') {
    db.query(
      'UPDATE mantenimientos SET estado = ? WHERE id = ?',
      [estado, req.params.id],
      (error) => {
        if (error) return res.status(500).json({ error: 'Error al actualizar estado' });
        res.json({ mensaje: 'Estado actualizado correctamente' });
      }
    );
  } else {
    db.query(
      'SELECT tecnico_id FROM mantenimientos WHERE id = ?',
      [req.params.id],
      (error, resultados) => {
        if (error || resultados.length === 0) {
          return res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
        if (resultados[0].tecnico_id !== req.usuario.id) {
          return res.status(403).json({ error: 'Solo puedes cambiar el estado de tus propios registros' });
        }
        db.query(
          'UPDATE mantenimientos SET estado = ? WHERE id = ?',
          [estado, req.params.id],
          (error2) => {
            if (error2) return res.status(500).json({ error: 'Error al actualizar estado' });
            res.json({ mensaje: 'Estado actualizado correctamente' });
          }
        );
      }
    );
  }
});

module.exports = router;