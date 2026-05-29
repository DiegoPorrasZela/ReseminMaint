const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM equipos ORDER BY codigo ASC', (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener equipos' });
    res.json(resultados);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM equipos WHERE id = ?', [req.params.id], (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener equipo' });

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json(resultados[0]);
  });
});

module.exports = router;