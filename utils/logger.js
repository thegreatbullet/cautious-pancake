import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Only add transports if not in test
const loggerTransports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
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
      ];

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'pokemon-backend' },
  transports: loggerTransports,
});

// Handle uncaught exceptions (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  logger.exceptions.handle(new transports.File({ filename: path.join(logDir, 'exceptions.log') }));

  // Crash on unhandled promise rejections
  process.on('unhandledRejection', (ex) => {
    throw ex;
  });
}

export default logger;
