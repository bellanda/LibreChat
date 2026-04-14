/**
 * Audit logging module.
 * Records all sandbox operations to MongoDB for compliance and security auditing.
 */

const AuditLog = require('./models/AuditLog');
const { logger } = require('./logger');

let dbConnected = false;

/**
 * Initialize audit logging (check if DB is available)
 */
function init() {
  // Will be set when DB connection is established
  dbConnected = false;
}

/**
 * Set database connection status
 * @param {boolean} connected
 */
function setDbConnected(connected) {
  dbConnected = connected;
}

/**
 * Record an audit event to database and logs
 * @param {Object} event - Audit event data
 * @param {string} event.action - Action type (upload, exec, download, files_list)
 * @param {string} event.userId - User ID
 * @param {string} [event.sessionId] - Session ID
 * @param {string} event.status - Status (success, error, denied)
 * @param {string} [event.ip] - Client IP
 * @param {string} [event.userAgent] - User-Agent header
 * @param {Object} [event.details] - Additional details
 * @param {string} [event.error] - Error message
 * @param {Object} [event.execution] - Execution metrics
 * @param {Object} [event.file] - File information
 */
async function record(event) {
  const {
    action,
    userId,
    sessionId,
    status,
    ip,
    userAgent,
    details = {},
    error,
    execution,
    file,
  } = event;

  // Always log to structured logs
  logger.info('Audit event', {
    type: 'audit',
    action,
    userId,
    sessionId,
    status,
    ip,
    userAgent,
    details,
    error,
    execution,
    file,
  });

  // Save to database if connected
  if (dbConnected) {
    try {
      await AuditLog.create({
        action,
        userId,
        sessionId,
        status,
        ip,
        userAgent,
        details,
        error,
        execution,
        file,
      });
    } catch (err) {
      // Log error but don't fail the request
      logger.error('Failed to save audit log to database', {
        error: err.message,
        action,
        userId,
        sessionId,
      });
    }
  }
}

/**
 * Record upload event
 */
async function recordUpload(userId, sessionId, file, ip, userAgent, status = 'success', error = null) {
  await record({
    action: 'upload',
    userId,
    sessionId,
    status,
    ip,
    userAgent,
    file: {
      fileId: file.fileId,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimeType,
    },
    error,
  });
}

/**
 * Record execution event
 */
async function recordExecution(
  userId,
  sessionId,
  lang,
  durationMs,
  exitCode,
  ip,
  userAgent,
  resources = {},
  filesGenerated = 0,
  status = 'success',
  error = null,
) {
  await record({
    action: 'exec',
    userId,
    sessionId,
    status,
    ip,
    userAgent,
    execution: {
      lang,
      durationMs,
      exitCode,
      memoryMB: resources.memoryMB,
      filesGenerated,
    },
    details: {
      codePreview: resources.codePreview,
    },
    error,
  });
}

/**
 * Record download event
 */
async function recordDownload(userId, sessionId, fileId, ip, userAgent, status = 'success', error = null) {
  await record({
    action: 'download',
    userId,
    sessionId,
    status,
    ip,
    userAgent,
    file: {
      fileId,
    },
    error,
  });
}

/**
 * Record files list event
 */
async function recordFilesList(userId, sessionId, ip, userAgent, fileCount, status = 'success', error = null) {
  await record({
    action: 'files_list',
    userId,
    sessionId,
    status,
    ip,
    userAgent,
    details: {
      fileCount,
    },
    error,
  });
}

/**
 * Record authentication failure
 */
async function recordAuthFailure(ip, userAgent, reason) {
  await record({
    action: 'auth_failure',
    userId: 'anonymous',
    status: 'denied',
    ip,
    userAgent,
    error: reason,
  });
}

module.exports = {
  init,
  setDbConnected,
  record,
  recordUpload,
  recordExecution,
  recordDownload,
  recordFilesList,
  recordAuthFailure,
};
