// db.js — Conexión a la base de datos MySQL
// Este archivo crea y exporta la conexión para que las rutas puedan usarla

// Importamos el módulo mysql2 que instalamos con npm
const mysql = require('mysql2');

// Creamos la conexión con los datos del servidor MySQL local
const conexion = mysql.createConnection({
  host: 'localhost',      // El servidor MySQL corre en esta misma computadora
  user: 'root',           // Usuario de MySQL (por defecto es 'root')
  password: 'diegoporras',           // ⚠️ Cambia esto si tu MySQL tiene contraseña
  database: 'resemin_db', // El nombre de la base de datos que creamos en Workbench
});

// Intentamos conectarnos y mostramos el resultado en consola
conexion.connect((error) => {
  if (error) {
    // Si hay error, lo mostramos y detenemos (ej: contraseña incorrecta)
    console.error('❌ Error al conectar con MySQL:', error.message);
    return;
  }
  // Si todo sale bien, confirmamos la conexión
  console.log('✅ Conectado a MySQL - Base de datos: resemin_db');
});

// Exportamos la conexión para que otros archivos puedan usarla
module.exports = conexion;