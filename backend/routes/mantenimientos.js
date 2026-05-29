const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  const consulta = `
    SELECT
      m.*,
      e.nombre AS equipo_nombre,
      e.codigo AS equipo_codigo,
      u.nombre AS tecnico_nombre
    FROM mantenimientos m
    JOIN equipos  e ON m.equipo_id  = e.id
    JOIN usuarios u ON m.tecnico_id = u.id
    ORDER BY m.created_at DESC
  `;

  db.query(consulta, (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener mantenimientos' });
    res.json(resultados);
  });
});

router.post('/', (req, res) => {
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

router.put('/:id/estado', (req, res) => {
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'en_proceso', 'completado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  db.query(
    'UPDATE mantenimientos SET estado = ? WHERE id = ?',
    [estado, req.params.id],
    (error) => {
      if (error) return res.status(500).json({ error: 'Error al actualizar estado' });
      res.json({ mensaje: 'Estado actualizado correctamente' });
    }
  );
});

module.exports = router;