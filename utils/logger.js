// utils/logger.js
const { createLogger, format, transports } = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info', // minimum log level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'pokemon-backend' },
  transports: [
    // Log info and above to console
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // Log errors to a file
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Log all levels to a combined file
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

// Handle uncaught exceptions
logger.exceptions.handle(new transports.File({ filename: path.join(logDir, 'exceptions.log') }));

// Crash on unhandled promise rejections
process.on('unhandledRejection', (ex) => {
  throw ex;
});

module.exports = logger;
