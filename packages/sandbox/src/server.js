#!/usr/bin/env node
/**
 * HTTP server compatible with code.librechat API.
 * Endpoints: 
 *   POST /upload - Upload files
 *   POST /exec - Execute code
 *   POST /extract-pdf - Extract text from PDF (free alternative to RAG API)
 *   GET /download/:session_id/:fileId - Download files
 *   GET /files/:session_id - List files
 *   GET /health - Health check
 */

const path = require('path');
const fs = require('fs');
// Load .env from project root (monorepo) so main .env config is used
// __dirname is packages/sandbox/src, so we need to go up 3 levels to reach root
const rootEnv = path.resolve(__dirname, '../../../.env');
const envLoaded = require('dotenv').config({ path: rootEnv });
require('dotenv').config(); // fallback: packages/sandbox/.env

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const storage = require('./storage');
const executor = require('./executor');
const executionQueue = require('./queue');
const { logger } = require('./logger');
const audit = require('./audit');
const { connectDb } = require('./db/connect');
const { extractPdfText } = require('./pdfExtractor');

const app = express();
const PORT = Number(process.env.SANDBOX_PORT) || 3081;

// Debug: log port configuration (only in dev mode)
if (!process.env.SANDBOX_PORT && process.env.NODE_ENV !== 'production') {
  logger.info('SANDBOX_PORT not found in .env, using default', {
    defaultPort: 3081,
    envPath: rootEnv,
    envExists: fs.existsSync(rootEnv),
  });
}
const STORAGE_ROOT = path.resolve(process.env.SANDBOX_STORAGE_PATH || path.join(process.cwd(), 'storage'));
const API_KEY = process.env.SANDBOX_API_KEY || process.env.LIBRECHAT_CODE_API_KEY || '';

// Middleware to capture client IP and User-Agent
app.use((req, res, next) => {
  req.clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  req.userAgent = req.headers['user-agent'] || 'unknown';
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.headers['X-API-Key'];
  if (!API_KEY || key === API_KEY) return next();
  
  // Log authentication failure
  await audit.recordAuthFailure(req.clientIp, req.userAgent, 'Invalid or missing API key');
  res.status(401).json({ message: 'Invalid or missing API key' });
}

async function getUserId(req, sessionId = null) {
  const fromHeader = req.headers['user-id'] || req.headers['User-Id'];
  if (fromHeader) return fromHeader;
  if (sessionId) return await storage.loadSessionUserId(STORAGE_ROOT, sessionId);
  return 'anonymous';
}

/**
 * Derive session_id: use entity_id (conversationId) when provided, else generate new.
 */
function getOrCreateSessionId(entityId) {
  if (entityId && typeof entityId === 'string') return entityId;
  return uuidv4().replace(/-/g, '').slice(0, 21);
}

// POST /upload - compatible with code.librechat
app.post('/upload', requireApiKey, upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  let userId, sessionId, fileId, filename;

  try {
    logger.info('Upload request', {
      filename: req.file?.originalname || '(no file)',
      size: req.file?.size,
      ip: req.clientIp,
    });

    if (!req.file) {
      await audit.recordUpload(
        'anonymous',
        '',
        { fileId: '', filename: '', size: 0 },
        req.clientIp,
        req.userAgent,
        'error',
        'No file provided',
      );
      return res.status(400).json({ message: 'No file provided' });
    }

    userId = await getUserId(req);
    const entityId = req.body?.entity_id || '';
    sessionId = getOrCreateSessionId(entityId);

    const result = await storage.saveUpload(
      STORAGE_ROOT,
      userId,
      sessionId,
      req.file.buffer,
      req.file.originalname || 'file',
    );
    fileId = result.fileId;
    filename = result.filename;

    // Audit successful upload
    await audit.recordUpload(
      userId,
      sessionId,
      {
        fileId,
        filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
      req.clientIp,
      req.userAgent,
      'success',
    );

    logger.info('Upload successful', {
      userId,
      sessionId,
      fileId,
      filename,
      size: req.file.size,
      durationMs: Date.now() - startTime,
    });

    res.json({
      message: 'success',
      session_id: sessionId,
      files: [{ fileId, filename }],
    });
  } catch (err) {
    logger.error('Upload error', {
      error: err.message,
      stack: err.stack,
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      ip: req.clientIp,
    });

    // Audit failed upload
    await audit.recordUpload(
      userId || 'anonymous',
      sessionId || '',
      { fileId: fileId || '', filename: filename || '', size: 0 },
      req.clientIp,
      req.userAgent,
      'error',
      err.message,
    );

    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// POST /exec - compatible with code.librechat
app.post('/exec', requireApiKey, express.json({ limit: '1mb' }), async (req, res) => {
  const startTime = Date.now();
  let userId, sessionId, lang, codePreview;

  try {
    const { lang: reqLang, code, args, files } = req.body || {};
    lang = reqLang;
    codePreview = typeof code === 'string' ? code.slice(0, 80).replace(/\n/g, ' ') : '';
    const queueStats = executionQueue.getStats();

    logger.info('Exec request', {
      lang,
      filesCount: files?.length ?? 0,
      codePreview,
      queueRunning: queueStats.running,
      queueMax: queueStats.maxConcurrent,
      queueQueued: queueStats.queued,
      ip: req.clientIp,
    });

    if (!lang || !code) {
      await audit.recordExecution(
        'anonymous',
        '',
        lang || 'unknown',
        0,
        -1,
        req.clientIp,
        req.userAgent,
        { codePreview },
        0,
        'error',
        'lang and code are required',
      );
      return res.status(400).json({ message: 'lang and code are required' });
    }

    // Determine userId and sessionId from first file or generate
    sessionId = uuidv4().replace(/-/g, '').slice(0, 21);
    if (files && Array.isArray(files) && files.length > 0) {
      sessionId = files[0].session_id || sessionId;
    }
    userId = await getUserId(req, sessionId);

    const execStartTime = Date.now();

    // Enqueue execution to control concurrency
    const result = await executionQueue.enqueue(() =>
      executor.execute({
        storageRoot: STORAGE_ROOT,
        userId,
        sessionId,
        lang,
        code,
        args: args || [],
        files: files || [],
      }),
    );

    const durationMs = Date.now() - execStartTime;
    const filesGenerated = result.files?.length || 0;

    // Audit successful execution
    await audit.recordExecution(
      userId,
      sessionId,
      lang,
      durationMs,
      result.exitCode,
      req.clientIp,
      req.userAgent,
      {
        codePreview,
        memoryMB: Number(process.env.SANDBOX_MEMORY_MB) || 512,
      },
      filesGenerated,
      result.exitCode === 0 ? 'success' : 'error',
      result.exitCode !== 0 ? result.stderr : null,
    );

    logger.info('Execution completed', {
      userId,
      sessionId,
      lang,
      durationMs,
      exitCode: result.exitCode,
      filesGenerated,
      stdoutLength: result.stdout?.length || 0,
      stderrLength: result.stderr?.length || 0,
    });

    res.json({
      session_id: sessionId,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      files: result.files || [],
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    logger.error('Exec error', {
      error: err.message,
      stack: err.stack,
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      lang: lang || 'unknown',
      durationMs,
      ip: req.clientIp,
    });

    // Audit failed execution
    await audit.recordExecution(
      userId || 'anonymous',
      sessionId || req.body?.files?.[0]?.session_id || '',
      lang || 'unknown',
      durationMs,
      -1,
      req.clientIp,
      req.userAgent,
      { codePreview },
      0,
      'error',
      err.message,
    );

    res.status(500).json({
      session_id: sessionId || req.body?.files?.[0]?.session_id || '',
      stdout: '',
      stderr: `Execution error: ${err.message}`,
      exitCode: -1,
      files: [],
    });
  }
});

// GET /download/:session_id/:fileId
app.get('/download/:session_id/:fileId', requireApiKey, async (req, res) => {
  try {
    const { session_id, fileId } = req.params;
    const userId = await getUserId(req, session_id);

    logger.info('Download request', {
      userId,
      sessionId: session_id,
      fileId,
      ip: req.clientIp,
    });

    const filePath = await storage.getFilePath(STORAGE_ROOT, userId, session_id, fileId);
    const stat = await fs.promises.stat(filePath);

    // Audit successful download
    await audit.recordDownload(userId, session_id, fileId, req.clientIp, req.userAgent, 'success');

    logger.info('Download successful', {
      userId,
      sessionId: session_id,
      fileId,
      size: stat.size,
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    const { session_id, fileId } = req.params;
    const userId = await getUserId(req, session_id).catch(() => 'anonymous');

    logger.error('Download error', {
      error: err.message,
      userId,
      sessionId: session_id,
      fileId,
      ip: req.clientIp,
    });

    const status = err.message?.includes('not found') ? 'error' : 'error';
    await audit.recordDownload(userId, session_id, fileId, req.clientIp, req.userAgent, status, err.message);

    if (err.message?.includes('not found')) return res.status(404).json({ message: err.message });
    res.status(500).json({ message: err.message || 'Download failed' });
  }
});

// GET /files/:session_id?detail=summary|full
app.get('/files/:session_id', requireApiKey, async (req, res) => {
  try {
    const { session_id } = req.params;
    const userId = await getUserId(req, session_id);
    const detail = req.query.detail || 'summary';

    logger.info('Files list request', {
      userId,
      sessionId: session_id,
      detail,
      ip: req.clientIp,
    });

    const files = await storage.listSessionFiles(STORAGE_ROOT, userId, session_id);

    // Audit successful files list
    await audit.recordFilesList(userId, session_id, req.clientIp, req.userAgent, files.length, 'success');

    logger.info('Files list successful', {
      userId,
      sessionId: session_id,
      fileCount: files.length,
    });

    if (detail === 'full') {
      return res.json(files);
    }
    res.json(files.map((f) => ({ name: f.name, lastModified: f.lastModified })));
  } catch (err) {
    const { session_id } = req.params;
    const userId = await getUserId(req, session_id).catch(() => 'anonymous');

    logger.error('Files list error', {
      error: err.message,
      userId,
      sessionId: session_id,
      ip: req.clientIp,
    });

    await audit.recordFilesList(userId, session_id, req.clientIp, req.userAgent, 0, 'error', err.message);

    res.status(500).json({ message: err.message || 'List failed' });
  }
});

// POST /extract-pdf - Extract text from PDF without using RAG API (free alternative)
// Requires: file_id and session_id (file must be uploaded via /upload first)
app.post('/extract-pdf', requireApiKey, express.json({ limit: '10mb' }), async (req, res) => {
  const startTime = Date.now();
  let userId, sessionId, fileId, filename;

  try {
    const { file_id, session_id } = req.body || {};

    if (!file_id) {
      return res.status(400).json({ message: 'file_id is required' });
    }

    if (!session_id) {
      return res.status(400).json({ message: 'session_id is required' });
    }

    userId = await getUserId(req, session_id);
    sessionId = session_id;

    // Get file info from storage
    const filePath = await storage.getFilePath(STORAGE_ROOT, userId, sessionId, file_id);
    const stat = await fs.promises.stat(filePath);
    
    // Get original filename from manifest
    const { getSessionPaths } = require('./storage');
    const { uploads } = getSessionPaths(STORAGE_ROOT, userId, sessionId);
    const manifestPath = path.join(uploads, '.manifest.json');
    let manifest = {};
    try {
      const manifestData = await fs.promises.readFile(manifestPath, 'utf8');
      manifest = JSON.parse(manifestData);
    } catch {
      // Manifest doesn't exist, use filename from path
    }
    filename = manifest[file_id] || path.basename(filePath);

    // Verify it's a PDF
    if (!filename.toLowerCase().endsWith('.pdf') && !filePath.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'File must be a PDF' });
    }

    logger.info('PDF extraction request', {
      userId,
      sessionId,
      fileId: file_id,
      filename,
      size: stat.size,
      ip: req.clientIp,
    });

    // Check queue status before processing
    const queueStats = executionQueue.getStats();
    const queuePosition = queueStats.queued;
    const isQueued = queueStats.running >= queueStats.maxConcurrent;

    if (isQueued) {
      logger.info('PDF extraction queued', {
        userId,
        sessionId,
        fileId: file_id,
        queuePosition: queuePosition + 1,
        running: queueStats.running,
        maxConcurrent: queueStats.maxConcurrent,
      });
    }

    // Extract text using Python executor (will be queued automatically)
    const result = await extractPdfText({
      storageRoot: STORAGE_ROOT,
      userId,
      sessionId,
      fileId: file_id,
      filename,
    });

    logger.info('PDF extraction successful', {
      userId,
      sessionId,
      fileId: file_id,
      pageCount: result.pageCount,
      charCount: result.charCount,
      durationMs: Date.now() - startTime,
    });

    res.json({
      success: true,
      text: result.text,
      pageCount: result.pageCount,
      metadata: result.metadata,
      charCount: result.charCount,
      queueInfo: {
        wasQueued: isQueued,
        queuePosition: isQueued ? queuePosition + 1 : 0,
      },
    });
  } catch (err) {
    logger.error('PDF extraction error', {
      error: err.message,
      stack: err.stack,
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      fileId: fileId || 'unknown',
      ip: req.clientIp,
    });

    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'PDF extraction failed',
    });
  }
});

// GET /queue-status - Get current queue status
app.get('/queue-status', requireApiKey, (req, res) => {
  const queueStats = executionQueue.getStats();
  res.status(200).json({
    status: 'ok',
    queue: {
      maxConcurrent: queueStats.maxConcurrent,
      running: queueStats.running,
      queued: queueStats.queued,
      total: queueStats.stats.total,
      completed: queueStats.stats.completed,
      failed: queueStats.stats.failed,
    },
  });
});

app.get('/health', (req, res) => {
  const queueStats = executionQueue.getStats();
  res.status(200).json({
    status: 'ok',
    executor: 'self-hosted',
    storageRoot: STORAGE_ROOT,
    queue: queueStats,
  });
});

// Initialize server
(async () => {
  try {
    // Initialize audit logging
    audit.init();

    // Connect to MongoDB for audit logging (optional - logs will still work without DB)
    const dbConnection = await connectDb();
    if (dbConnection) {
      audit.setDbConnected(true);
      logger.info('Audit logging to database enabled');
    } else {
      logger.info('Audit logging to database disabled (using file logs only)');
    }

    const server = app.listen(PORT, () => {
      logger.info('Code Interpreter server started', {
        port: PORT,
        storageRoot: STORAGE_ROOT,
        auditDbEnabled: !!dbConnection,
      });
    });

    server.on('error', (err) => {
      logger.error('Server error', {
        error: err.message,
        stack: err.stack,
      });
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down sandbox server...');
      server.close(async () => {
        const { disconnectDb } = require('./db/connect');
        await disconnectDb();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to initialize server', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
})();
