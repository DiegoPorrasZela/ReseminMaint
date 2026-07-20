const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');

// Resumen general para el dashboard del supervisor
router.get('/resumen', auth, async (req, res) => {
  try {
    // Equipos agrupados por estado
    const [equipos] = await db.promise().query(
      'SELECT estado, COUNT(*) AS total FROM equipos GROUP BY estado'
    );

    // Mantenimientos agrupados por estado
    const [mantenimientos] = await db.promise().query(
      'SELECT estado, COUNT(*) AS total FROM mantenimientos GROUP BY estado'
    );

    // Mantenimientos agrupados por tipo
    const [tipos] = await db.promise().query(
      'SELECT tipo, COUNT(*) AS total FROM mantenimientos GROUP BY tipo'
    );

    // Mantenimientos vencidos: programados antes de hoy y aún sin completar
    const [vencidos] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM mantenimientos WHERE fecha_programada < CURDATE() AND estado != 'completado'"
    );

    // Próximos 5 mantenimientos pendientes
    const [proximos] = await db.promise().query(`
      SELECT m.id, m.tipo, m.fecha_programada, m.estado,
             e.codigo AS equipo_codigo, e.nombre AS equipo_nombre,
             u.nombre AS tecnico_nombre
      FROM mantenimientos m
      JOIN equipos  e ON m.equipo_id  = e.id
      JOIN usuarios u ON m.tecnico_id = u.id
      WHERE m.estado != 'completado'
      ORDER BY m.fecha_programada ASC
      LIMIT 5
    `);

    // Convertir los arreglos [{estado, total}] en objetos {estado: total}
    const contar = (filas, campo) => {
      const objeto = {};
      filas.forEach((f) => { objeto[f[campo]] = f.total; });
      return objeto;
    };

    res.json({
      equipos:         contar(equipos, 'estado'),
      mantenimientos:  contar(mantenimientos, 'estado'),
      tipos:           contar(tipos, 'tipo'),
      vencidos:        vencidos[0].total,
      proximos,
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al generar el resumen' });
  }
});

module.exports = router;