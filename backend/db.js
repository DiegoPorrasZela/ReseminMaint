const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: 'diegoporras',
  database: 'resemin_db',
});

conexion.connect((error) => {
  if (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return;
  }
  console.log('✅ Conectado a MySQL - Base de datos: resemin_db');
});

module.exports = conexion;