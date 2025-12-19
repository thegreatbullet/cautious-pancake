const { createLogger, format, transports } = require('winston')
require('winston-daily-rotate-file') // optional for daily rotating logs

const logger = createLogger({
  level: 'info', // minimum log level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'pokemon-backend' },
  transports: [
    // Console logging for development
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // File logging
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
})

// Optional: log unhandled promise rejections to exceptions
process.on('unhandledRejection', (ex) => {
  throw ex
})

module.exports = logger
