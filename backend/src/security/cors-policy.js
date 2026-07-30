'use strict';

class CorsOriginRejectedError extends Error {
  constructor(origin) {
    super(`Origin not allowed by CORS policy: ${origin}`);
    this.name = 'CorsOriginRejectedError';
    this.statusCode = 403;
    this.code = 'CORS_ORIGIN_NOT_ALLOWED';
  }
}

// Isolé de server.js pour rester testable sans démarrer un vrai serveur HTTP
// (issue #155) : une origine refusée doit produire un 403 JSON propre, pas le
// 500 générique que renvoyait le handler d'erreur par défaut d'Express face à
// une Error non typée.
const createCorsOriginValidator = (allowedOrigins) => (origin, callback) => {
  if (!origin || allowedOrigins.has(origin)) return callback(null, true);
  return callback(new CorsOriginRejectedError(origin));
};

module.exports = { CorsOriginRejectedError, createCorsOriginValidator };
