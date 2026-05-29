const express = require('express');
const cors    = require('cors');

const rutasAuth           = require('./routes/auth');
const rutasEquipos        = require('./routes/equipos');
const rutasMantenimientos = require('./routes/mantenimientos');
const rutasUsuarios       = require('./routes/usuarios');

const app    = express();
const PUERTO = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',           rutasAuth);
app.use('/api/equipos',        rutasEquipos);
app.use('/api/mantenimientos', rutasMantenimientos);
app.use('/api/usuarios',       rutasUsuarios);

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor ReseminMaint funcionando correctamente' });
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});