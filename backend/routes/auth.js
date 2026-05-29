const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const db      = require('../db');

router.post('/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const consulta = 'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)';

    db.query(consulta, [nombre, email, passwordHash, rol || 'tecnico'], (error, resultado) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: resultado.insertId });
    });

  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const consulta = 'SELECT * FROM usuarios WHERE email = ?';

  db.query(consulta, [email], async (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error del servidor' });

    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = resultados[0];

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
      },
    });
  });
});

module.exports = router;