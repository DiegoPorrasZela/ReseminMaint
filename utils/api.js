// utils/api.js — URL base del servidor backend
//
// El emulador de Android NO puede usar "localhost" para llegar a tu PC,
// porque localhost dentro del emulador se refiere al propio emulador.
// La IP especial 10.0.2.2 apunta al localhost de la computadora host.
//
// Si usas un celular físico conectado por WiFi, cambia esta IP
// por la IP local de tu computadora (ej: 192.168.1.5)

export const API_URL = 'http://10.0.2.2:3000/api';
