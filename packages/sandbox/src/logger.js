/**
 * Structured logging for sandbox using Winston.
 * Outputs JSON logs for better parsing and integration with log aggregation tools.
 */

const winston = require('winston');
const path = require('path');

const { NODE_ENV = 'development', SANDBOX_LOG_LEVEL = 'info' } = process.env;

// Custom format for structured JSON logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message}${metaStr ? '\n' + metaStr : ''}`;
  }),
);

// Determine transports based on environment
const transports = [];

if (NODE_ENV === 'production') {
  // Production: JSON to console (for Docker logs, log aggregation)
  transports.push(
    new winston.transports.Console({
      format: jsonFormat,
      level: SANDBOX_LOG_LEVEL,
    }),
  );
} else {
  // Development: Human-readable console output
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: SANDBOX_LOG_LEVEL,
    }),
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: SANDBOX_LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: {
    service: 'sandbox',
    environment: NODE_ENV,
  },
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Helper to create structured log entries with context
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function log(level, message, meta = {}) {
  logger[level](message, meta);
}

/**
 * Log audit events (structured for easy querying)
 * @param {string} action - Action performed (upload, exec, download, files_list)
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @param {Object} details - Additional details (fileId, lang, codePreview, etc.)
 * @param {string} status - Status (success, error, denied)
 * @param {string} ip - Client IP address
 */
function logAudit(action, userId, sessionId, details = {}, status = 'success', ip = null) {
  logger.info('Audit event', {
    type: 'audit',
    action,
    userId,
    sessionId,
    status,
    ip,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log execution events with performance metrics
 * @param {string} sessionId - Session ID
 * @param {string} lang - Language (py, js)
 * @param {number} durationMs - Execution duration in milliseconds
 * @param {number} exitCode - Exit code
 * @param {Object} resources - Resource usage (memory, cpu)
 */
function logExecution(sessionId, lang, durationMs, exitCode, resources = {}) {
  logger.info('Code execution completed', {
    type: 'execution',
    sessionId,
    lang,
    durationMs,
    exitCode,
    ...resources,
  });
}

module.exports = {
  logger,
  log,
  logAudit,
  logExecution,
  // Expose winston levels for convenience
  levels: winston.config.npm.levels,
};
