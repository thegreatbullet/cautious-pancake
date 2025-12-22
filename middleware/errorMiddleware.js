import { logMessage } from '../controllers/logController.js';

const errorMiddleware = (err, req, res, next) => {
  // Log full error details
  logMessage('error', 'Unhandled error', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    error: err.message || err,
  });

  // Respond to client
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

export default errorMiddleware;
