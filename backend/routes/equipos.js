// routes/equipos.js — Rutas para el catálogo de equipos mineros

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ============================================================
// GET /api/equipos — Obtener todos los equipos
// ============================================================
router.get('/', (req, res) => {
  // SELECT * trae todas las columnas y filas de la tabla equipos
  db.query('SELECT * FROM equipos ORDER BY codigo ASC', (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener equipos' });
    // Enviamos el arreglo de equipos como respuesta JSON
    res.json(resultados);
  });
});

// ============================================================
// GET /api/equipos/:id — Obtener un equipo por su ID
// ============================================================
router.get('/:id', (req, res) => {
  // req.params.id toma el valor del :id en la URL
  db.query('SELECT * FROM equipos WHERE id = ?', [req.params.id], (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener equipo' });

    // Si no encontramos el equipo, devolvemos 404
    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json(resultados[0]);
  });
});

module.exports = router;