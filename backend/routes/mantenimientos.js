const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/authMiddleware');
const { requireSupervisor } = require('../middleware/authMiddleware');

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

// Cambiar estado de un mantenimiento, aplicando las reglas de negocio:
//  - Al pasar a "en_proceso"  → el equipo pasa automáticamente a "en_mantenimiento".
//  - Al pasar a "completado"  → se guarda la fecha real y las observaciones del técnico;
//    si el equipo ya no tiene trabajos en proceso, vuelve a "operativo".
//  - Al volver a "pendiente"  → se limpian fecha y observaciones de cierre.
//  - "fuera_de_servicio" solo lo maneja el supervisor manualmente (no se toca aquí).
router.put('/:id/estado', auth, async (req, res) => {
  const { estado, observaciones } = req.body;

  const estadosValidos = ['pendiente', 'en_proceso', 'completado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const [filas] = await db.promise().query(
      'SELECT id, tecnico_id, equipo_id FROM mantenimientos WHERE id = ?',
      [req.params.id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    const mantenimiento = filas[0];

    if (req.usuario.rol !== 'supervisor' && mantenimiento.tecnico_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo puedes cambiar el estado de tus propios registros' });
    }

    if (estado === 'completado') {
      await db.promise().query(
        'UPDATE mantenimientos SET estado = ?, fecha_completado = CURDATE(), observaciones = ? WHERE id = ?',
        [estado, observaciones || null, req.params.id]
      );
    } else {
      await db.promise().query(
        'UPDATE mantenimientos SET estado = ?, fecha_completado = NULL, observaciones = NULL WHERE id = ?',
        [estado, req.params.id]
      );
    }

    // Sincronizar el estado del equipo con sus mantenimientos
    if (estado === 'en_proceso') {
      await db.promise().query(
        "UPDATE equipos SET estado = 'en_mantenimiento' WHERE id = ?",
        [mantenimiento.equipo_id]
      );
    } else {
      const [abiertos] = await db.promise().query(
        "SELECT COUNT(*) AS total FROM mantenimientos WHERE equipo_id = ? AND estado = 'en_proceso'",
        [mantenimiento.equipo_id]
      );
      if (abiertos[0].total === 0) {
        await db.promise().query(
          "UPDATE equipos SET estado = 'operativo' WHERE id = ? AND estado = 'en_mantenimiento'",
          [mantenimiento.equipo_id]
        );
      }
    }

    res.json({ mensaje: 'Estado actualizado correctamente' });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// Eliminar un mantenimiento mal registrado (solo supervisores)
router.delete('/:id', auth, requireSupervisor, async (req, res) => {
  try {
    const [resultado] = await db.promise().query(
      'DELETE FROM mantenimientos WHERE id = ?',
      [req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    res.json({ mensaje: 'Mantenimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mantenimiento' });
  }
});

module.exports = router;