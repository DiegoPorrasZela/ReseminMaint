// routes/auth.js — Rutas de autenticación
// Maneja el registro y login de usuarios

const express = require('express');
const router  = express.Router(); // Router es un mini-servidor para agrupar rutas
const bcrypt  = require('bcrypt'); // bcrypt sirve para encriptar y comparar contraseñas
const db      = require('../db'); // Importamos la conexión a MySQL

// ============================================================
// POST /api/auth/register — Registrar nuevo usuario
// ============================================================
router.post('/register', async (req, res) => {
  // Extraemos los datos que envió la app desde el body de la petición
  const { nombre, email, password, rol } = req.body;

  // Validamos que no vengan campos vacíos
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // bcrypt.hash() encripta la contraseña — el 10 es el "costo" (más alto = más seguro)
    // Nunca guardamos la contraseña original, solo el hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Consulta SQL para insertar el nuevo usuario
    // Los ? son parámetros seguros que evitan inyección SQL
    const consulta = 'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)';

    db.query(consulta, [nombre, email, passwordHash, rol || 'tecnico'], (error, resultado) => {
      if (error) {
        // ER_DUP_ENTRY significa que el email ya existe en la base de datos
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      // status(201) significa "creado exitosamente"
      res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: resultado.insertId });
    });

  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ============================================================
// POST /api/auth/login — Iniciar sesión
// ============================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  // Buscamos al usuario por su email en la base de datos
  const consulta = 'SELECT * FROM usuarios WHERE email = ?';

  db.query(consulta, [email], async (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error del servidor' });

    // Si no encontramos ningún usuario con ese email
    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = resultados[0]; // El primer (y único) resultado

    // bcrypt.compare() compara la contraseña ingresada con el hash guardado
    // Devuelve true si coinciden, false si no
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Login exitoso — enviamos los datos del usuario (sin el hash de contraseña)
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
