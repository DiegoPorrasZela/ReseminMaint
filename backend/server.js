// server.js — Servidor principal de la API REST
// Este archivo configura Express y conecta todas las rutas

// express: framework para crear servidores HTTP en Node.js
const express = require('express');

// cors: permite que la app móvil (otro origen) haga peticiones a este servidor
const cors = require('cors');

// Importamos los archivos de rutas (cada uno maneja un grupo de endpoints)
const rutasAuth           = require('./routes/auth');
const rutasEquipos        = require('./routes/equipos');
const rutasMantenimientos = require('./routes/mantenimientos');
const rutasUsuarios       = require('./routes/usuarios');

// Creamos la aplicación Express
const app = express();

// Puerto donde escuchará el servidor
const PUERTO = 3000;

// ============================================================
// MIDDLEWARES (funciones que se ejecutan antes de cada ruta)
// ============================================================

// cors() permite peticiones desde cualquier origen (la app móvil)
app.use(cors());

// express.json() permite leer el cuerpo de las peticiones en formato JSON
app.use(express.json());

// ============================================================
// RUTAS DE LA API
// ============================================================
app.use('/api/auth',           rutasAuth);
app.use('/api/equipos',        rutasEquipos);
app.use('/api/mantenimientos', rutasMantenimientos);
app.use('/api/usuarios',       rutasUsuarios);

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor ReseminMaint funcionando correctamente' });
});

// Iniciar el servidor — escucha peticiones en el puerto indicado
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});