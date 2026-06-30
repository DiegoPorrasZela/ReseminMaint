const jwt = require('jsonwebtoken');

const JWT_SECRET = 'resemin_jwt_secret_2024';

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const requireSupervisor = (req, res, next) => {
  if (req.usuario?.rol !== 'supervisor') {
    return res.status(403).json({ error: 'Acceso denegado: solo supervisores' });
  }
  next();
};

module.exports = verificarToken;
module.exports.requireSupervisor = requireSupervisor;
