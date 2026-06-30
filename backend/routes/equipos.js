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
