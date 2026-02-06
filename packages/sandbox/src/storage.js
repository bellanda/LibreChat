/**
 * Storage layer for sandbox - implements storage/{userId}/{sessionId}/uploads|workspace
 * Path validation to prevent traversal and symlink escape.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Resolve and validate that targetPath is within basePath.
 * Rejects path traversal and symlinks that escape.
 * @param {string} basePath - Allowed base directory (absolute)
 * @param {string} targetPath - Path to validate
 * @returns {string} Resolved absolute path if valid
 * @throws {Error} If path escapes basePath
 */
function resolveWithin(basePath, targetPath) {
  const baseResolved = path.resolve(basePath);
  const targetResolved = path.resolve(basePath, targetPath);

  if (!targetResolved.startsWith(baseResolved + path.sep) && targetResolved !== baseResolved) {
    throw new Error(`Path traversal denied: ${targetPath}`);
  }
  return targetResolved;
}

/**
 * Ensure path is within base, using realpath to resolve symlinks.
 * @param {string} basePath
 * @param {string} targetPath
 * @returns {Promise<string>}
 */
async function resolveWithinReal(basePath, targetPath) {
  const baseResolved = path.resolve(basePath);
  const targetResolved = path.resolve(basePath, targetPath);

  if (!targetResolved.startsWith(baseResolved + path.sep) && targetResolved !== baseResolved) {
    throw new Error(`Path traversal denied: ${targetPath}`);
  }

  try {
    const real = await fs.promises.realpath(targetResolved);
    if (!real.startsWith(await fs.promises.realpath(baseResolved))) {
      throw new Error(`Symlink escape denied: ${targetPath}`);
    }
    return real;
  } catch (err) {
    if (err.code === 'ENOENT') return targetResolved;
    throw err;
  }
}

/**
 * @param {string} storageRoot - Base path for all sandbox storage
 * @param {string} userId - User ID (ObjectId)
 * @param {string} sessionId - Session ID (UUID)
 */
function getSessionPaths(storageRoot, userId, sessionId) {
  const base = path.join(storageRoot, String(userId), String(sessionId));
  return {
    root: base,
    uploads: path.join(base, 'uploads'),
    workspace: path.join(base, 'workspace'),
  };
}

/**
 * Ensure session directories exist. Creates with restricted permissions.
 * @param {string} storageRoot
 * @param {string} userId
 * @param {string} sessionId
 */
async function ensureSessionDirs(storageRoot, userId, sessionId) {
  const baseResolved = path.resolve(storageRoot);
  const { uploads, workspace } = getSessionPaths(storageRoot, userId, sessionId);

  resolveWithin(baseResolved, path.relative(baseResolved, uploads));
  resolveWithin(baseResolved, path.relative(baseResolved, workspace));

  await fs.promises.mkdir(uploads, { recursive: true, mode: 0o750 });
  await fs.promises.mkdir(workspace, { recursive: true, mode: 0o750 });
}

/**
 * Save uploaded file. Filename is sanitized to UUID.ext to avoid path injection.
 * @param {string} storageRoot
 * @param {string} userId
 * @param {string} sessionId
 * @param {Buffer|import('stream').Readable} content
 * @param {string} originalFilename
 * @returns {Promise<{ fileId: string; filename: string; filepath: string }>}
 */
function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return 'file';
  if (name.includes('..') || path.isAbsolute(name) || name.includes(path.sep)) {
    throw new Error('Invalid filename: path traversal not allowed');
  }
  const basename = path.basename(name);
  return basename || 'file';
}

async function saveUpload(storageRoot, userId, sessionId, content, originalFilename) {
  await ensureSessionDirs(storageRoot, userId, sessionId);

  const safeOriginal = sanitizeFilename(originalFilename);
  const ext = path.extname(safeOriginal) || '';
  const fileId = uuidv4().replace(/-/g, '').slice(0, 21);
  const safeFilename = `${fileId}${ext}`;
  const { uploads } = getSessionPaths(storageRoot, userId, sessionId);
  const filepath = path.join(uploads, safeFilename);

  const baseResolved = path.resolve(storageRoot);
  resolveWithin(baseResolved, path.relative(baseResolved, filepath));

  if (Buffer.isBuffer(content)) {
    await fs.promises.writeFile(filepath, content, { mode: 0o640 });
  } else {
    const w = fs.createWriteStream(filepath, { mode: 0o640 });
    await new Promise((resolve, reject) => {
      content.pipe(w);
      content.on('error', reject);
      w.on('finish', resolve);
      w.on('error', reject);
    });
  }

  // Update manifest for original filename lookup
  const manifestPath = path.join(uploads, '.manifest.json');
  let manifest = {};
  try {
    manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf8'));
  } catch {
    /* ignore */
  }
  manifest[fileId] = safeOriginal || safeFilename;
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest), { mode: 0o640 });

  // Store userId for session (for exec lookup)
  const sessionMetaPath = path.join(path.dirname(uploads), '.session.json');
  try {
    const meta = JSON.parse(await fs.promises.readFile(sessionMetaPath, 'utf8'));
    meta.userId = meta.userId || userId;
    await fs.promises.writeFile(sessionMetaPath, JSON.stringify(meta), { mode: 0o640 });
  } catch {
    await fs.promises.writeFile(
      sessionMetaPath,
      JSON.stringify({ userId }),
      { mode: 0o640 },
    );
  }

  // Root-level session index for O(1) userId lookup
  const indexPath = path.join(path.resolve(storageRoot), '.sessions.json');
  try {
    const index = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
    index[sessionId] = userId;
    await fs.promises.writeFile(indexPath, JSON.stringify(index), { mode: 0o640 });
  } catch {
    await fs.promises.mkdir(path.dirname(indexPath), { recursive: true });
    await fs.promises.writeFile(indexPath, JSON.stringify({ [sessionId]: userId }), {
      mode: 0o640,
    });
  }

  return {
    fileId,
    filename: safeOriginal || safeFilename,
    filepath,
  };
}

/**
 * Get file path for download. Validates path is within session.
 * @param {string} storageRoot
 * @param {string} userId
 * @param {string} sessionId
 * @param {string} fileId
 * @returns {Promise<string>} Absolute path to file
 */
async function findFileInDir(dir, fileId, baseResolved) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isFile() && (e.name.startsWith(fileId) || e.name === fileId || e.name === `${fileId}`)) {
      await resolveWithinReal(baseResolved, full);
      return full;
    }
    if (e.isDirectory() && e.name.startsWith('exec_')) {
      const found = await findFileInDir(full, fileId, baseResolved);
      if (found) return found;
    }
  }
  return null;
}

async function getFilePath(storageRoot, userId, sessionId, fileId) {
  const { uploads, workspace } = getSessionPaths(storageRoot, userId, sessionId);
  const baseResolved = path.resolve(storageRoot);

  const found =
    (await findFileInDir(uploads, fileId, baseResolved)) ||
    (await findFileInDir(workspace, fileId, baseResolved));

  if (found) return found;
  throw new Error(`File not found: ${fileId}`);
}

/**
 * Load manifest (fileId -> original filename) from uploads dir.
 * @param {string} uploadsPath
 * @returns {Promise<Record<string, string>>}
 */
async function loadSessionUserId(storageRoot, sessionId) {
  const indexPath = path.join(path.resolve(storageRoot), '.sessions.json');
  try {
    const index = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
    return index[sessionId] || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

async function loadManifest(uploadsPath) {
  try {
    const data = await fs.promises.readFile(path.join(uploadsPath, '.manifest.json'), 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * List files in session for /files endpoint.
 * @param {string} storageRoot
 * @param {string} userId
 * @param {string} sessionId
 * @returns {Promise<Array<{ name: string; lastModified: string; metadata?: Record<string, string> }>>}
 */
async function listSessionFiles(storageRoot, userId, sessionId) {
  const { uploads, workspace } = getSessionPaths(storageRoot, userId, sessionId);
  const baseResolved = path.resolve(storageRoot);
  const manifest = await loadManifest(uploads);
  const files = [];

  const collectFromDir = async (dir, prefix) => {
    try {
      resolveWithin(baseResolved, path.relative(baseResolved, dir));
    } catch {
      return;
    }
    const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && e.name.startsWith('exec_')) {
        await collectFromDir(full, `${prefix}${e.name}/`);
      } else if (e.isFile() && !e.name.startsWith('.')) {
        const stat = await fs.promises.stat(full);
        const fileId = path.basename(e.name, path.extname(e.name));
        const originalName = manifest[fileId] || e.name;
        files.push({
          name: `${prefix}${e.name}`,
          lastModified: stat.mtime.toISOString(),
          metadata: { 'original-filename': originalName },
        });
      }
    }
  };

  await collectFromDir(uploads, 'uploads/');
  await collectFromDir(workspace, 'workspace/');
  return files;
}

/**
 * Prepare workspace for execution: copy uploads to a combined /mnt/data structure.
 * Returns path to workspace and list of { id, name } for files available.
 * @param {string} storageRoot
 * @param {string} userId
 * @param {string} sessionId
 * @param {Array<{ id: string; name: string }>} files - from exec request
 * @returns {Promise<{ workspacePath: string; uploadsPath: string }>}
 */
async function prepareWorkspaceForExec(storageRoot, userId, sessionId, files) {
  await ensureSessionDirs(storageRoot, userId, sessionId);
  const { uploads, workspace } = getSessionPaths(storageRoot, userId, sessionId);

  const baseResolved = path.resolve(storageRoot);
  resolveWithin(baseResolved, path.relative(baseResolved, uploads));
  resolveWithin(baseResolved, path.relative(baseResolved, workspace));

  return { uploadsPath: uploads, workspacePath: workspace };
}

module.exports = {
  resolveWithin,
  resolveWithinReal,
  getSessionPaths,
  ensureSessionDirs,
  saveUpload,
  getFilePath,
  listSessionFiles,
  prepareWorkspaceForExec,
  loadManifest,
  loadSessionUserId,
};
