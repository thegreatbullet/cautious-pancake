import logger from '../utils/logger.js';

/**
 * Log a custom message
 * @param {string} level - log level ('info', 'warn', 'error', 'debug')
 * @param {string} message - message to log
 * @param {object} [meta] - optional additional metadata
 */
export const logMessage = (level, message, meta = {}) => {
  if (!['info', 'warn', 'error', 'debug'].includes(level)) {
    level = 'info';
  }
  logger[level](message, meta);
};

/**
 * Express middleware to log incoming requests
 */
export const logRequest = (req, res, next) => {
  logger.info('Incoming request: %s %s from IP %s', req.method, req.originalUrl, req.ip);
  next();
};

/**
 * Express middleware to log errors
 */
export const logError = (err, req, res, next) => {
  logger.error('Error on %s %s: %o', req.method, req.originalUrl, err);
  next(err);
};
