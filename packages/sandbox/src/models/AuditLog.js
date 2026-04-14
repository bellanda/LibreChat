/**
 * Mongoose model for audit logging.
 * Stores all sandbox operations for compliance and security auditing.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // Action type: upload, exec, download, files_list, auth_failure
    action: {
      type: String,
      required: true,
      enum: ['upload', 'exec', 'download', 'files_list', 'auth_failure', 'health_check'],
      index: true,
    },
    // User identification
    userId: {
      type: String,
      required: true,
      index: true,
    },
    // Session/conversation ID
    sessionId: {
      type: String,
      index: true,
    },
    // Status: success, error, denied
    status: {
      type: String,
      required: true,
      enum: ['success', 'error', 'denied'],
      index: true,
    },
    // Client IP address
    ip: {
      type: String,
      index: true,
    },
    // User-Agent header
    userAgent: {
      type: String,
    },
    // Request details (varies by action)
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Error message if status is 'error'
    error: {
      type: String,
    },
    // Execution metrics (for exec actions)
    execution: {
      lang: String,
      durationMs: Number,
      exitCode: Number,
      memoryMB: Number,
      filesGenerated: Number,
    },
    // File information (for upload/download actions)
    file: {
      fileId: String,
      filename: String,
      size: Number,
      mimeType: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'sandbox_audit_logs',
  },
);

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ sessionId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
// TTL index for automatic cleanup (optional, configurable via env)
if (process.env.SANDBOX_AUDIT_TTL_DAYS) {
  const ttlDays = parseInt(process.env.SANDBOX_AUDIT_TTL_DAYS);
  if (ttlDays > 0) {
    auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });
  }
}

// Prevent model re-compilation
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
