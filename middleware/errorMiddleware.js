import { logMessage } from '../controllers/logController.js';

const errorMiddleware = (err, req, res, next) => {
  // ----------------- Normalize error -----------------
  let statusCode = err.status || 500;
  let message = err.message || 'Internal server error';

  // Mongo duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Pokémon number';
  }

  // Joi validation error
  if (err.isJoi) {
    statusCode = 400;
    message = err.details?.[0]?.message || 'Invalid request body';
  }

  // ----------------- Log full error -----------------
  logMessage('error', 'Unhandled error', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    statusCode,
    error: message,
  });

  // ----------------- Respond to client -----------------
  res.status(statusCode).json({
    error: message,
  });
};

export default errorMiddleware;
