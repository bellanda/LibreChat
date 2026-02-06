/**
 * Docker-based code executor. Runs Python (uv) and JavaScript (bun) in isolated containers.
 * Compatible with code.librechat /exec API.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { getSessionPaths, resolveWithin } = require('./storage');

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MEMORY_MB = 512;

/**
 * Map file refs (id, name) to actual paths in uploads dir.
 * Files in uploads are stored as {fileId}.ext - we need to find by prefix.
 * @param {string} uploadsPath
 * @param {Array<{ id: string; name: string }>} files
 * @returns {Promise<Array<{ src: string; destName: string }>>}
 */
async function resolveFileRefs(uploadsPath, files) {
  const entries = await fs.promises.readdir(uploadsPath, { withFileTypes: true }).catch(() => []);
  const result = [];

  for (const f of files) {
    const id = f.id;
    const name = f.name || id;
    for (const e of entries) {
      if (e.isFile() && (e.name.startsWith(id) || e.name === id)) {
        result.push({ src: path.join(uploadsPath, e.name), destName: path.basename(name) });
        break;
      }
    }
  }
  return result;
}

/**
 * Prepare exec directory: copy uploads (with original names) to execDir for /mnt/data.
 * @param {string} uploadsPath
 * @param {string} execDir - will create execDir as /mnt/data
 * @param {Array<{ id: string; name: string }>} files
 */
async function prepareExecDir(uploadsPath, execDir, files) {
  await fs.promises.mkdir(execDir, { recursive: true, mode: 0o750 });
  const refs = await resolveFileRefs(uploadsPath, files);

  for (const { src, destName } of refs) {
    const dest = path.join(execDir, destName);
    // Avoid path traversal in destName
    if (path.basename(dest) !== destName) continue;
    await fs.promises.copyFile(src, dest);
  }
}

/**
 * Run code in Docker container.
 * @param {Object} options
 * @param {string} options.storageRoot
 * @param {string} options.userId
 * @param {string} options.sessionId
 * @param {string} options.lang - py, js, etc.
 * @param {string} options.code
 * @param {string[]} [options.args]
 * @param {Array<{ id: string; name: string }>} [options.files]
 * @param {string} [options.dockerImage]
 * @param {number} [options.timeoutMs]
 * @param {number} [options.memoryMB]
 * @returns {Promise<{ stdout: string; stderr: string; exitCode: number; files: Array<{ name: string }> }>}
 */
async function execute(options) {
  const {
    storageRoot,
    userId,
    sessionId,
    lang,
    code,
    args = [],
    files = [],
    dockerImage = process.env.SANDBOX_DOCKER_IMAGE || 'librechat/sandbox-executor:latest',
    timeoutMs = Number(process.env.SANDBOX_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    memoryMB = Number(process.env.SANDBOX_MEMORY_MB) || DEFAULT_MEMORY_MB,
  } = options;

  const { uploads, workspace } = getSessionPaths(storageRoot, userId, sessionId);
  const baseResolved = path.resolve(storageRoot);
  resolveWithin(baseResolved, path.relative(baseResolved, workspace));

  const execId = uuidv4().slice(0, 8);
  const execDir = path.join(workspace, `exec_${execId}`);
  await prepareExecDir(uploads, execDir, files);

  const ext =
    lang === 'py' || lang === 'python' ? '.py' : lang === 'js' || lang === 'ts' ? '.js' : '.txt';
  const scriptPath = path.join(execDir, `script${ext}`);
  await fs.promises.writeFile(scriptPath, code, { mode: 0o640 });

  return new Promise((resolve, reject) => {
    const dockerArgs = [
      'run',
      '--rm',
      '--network',
      'none',
      '--memory',
      `${memoryMB}m`,
      '--cpus',
      '1',
      '-v',
      `${execDir}:/mnt/data:rw`,
      '-w',
      '/mnt/data',
      dockerImage,
      ...(lang === 'py' || lang === 'python'
        ? ['uv', 'run', '--project', '/opt/sandbox', 'python', `/mnt/data/script${ext}`]
        : ['bun', `/mnt/data/script${ext}`]),
      ...args,
    ];

    const proc = spawn('docker', dockerArgs, {
      timeout: timeoutMs,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (d) => (stdout += d.toString()));
    proc.stderr?.on('data', (d) => (stderr += d.toString()));

    proc.on('error', (err) => {
      reject(new Error(`Docker execution failed: ${err.message}`));
    });

    proc.on('close', async (exitCode, signal) => {
      try {
        const inputNames = new Set(files.map((f) => path.basename(f.name || f.id)));
        const entries = await fs.promises.readdir(execDir, { withFileTypes: true }).catch(() => []);
        const generatedFiles = [];

        for (const e of entries) {
          if (e.isFile() && e.name !== `script${ext}` && !inputNames.has(e.name)) {
            const srcPath = path.join(execDir, e.name);
            // Use 21-char fileId (matches isValidID) for download URL compatibility
            const fileId = uuidv4().replace(/-/g, '').slice(0, 21);
            const fileExt = path.extname(e.name) || '';
            const destFilename = `${fileId}${fileExt}`;
            const destPath = path.join(workspace, destFilename);
            try {
              await fs.promises.copyFile(srcPath, destPath);
            } catch (copyErr) {
              console.error(`[sandbox] Failed to copy output file ${e.name}:`, copyErr.message);
            }
            generatedFiles.push({
              id: fileId,
              name: e.name,
              fileId,
              filename: e.name,
            });
          }
        }

        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? (signal ? -1 : 0),
          files: generatedFiles,
        });
      } catch (err) {
        resolve({
          stdout,
          stderr: stderr + (err.message || ''),
          exitCode: exitCode ?? -1,
          files: [],
        });
      } finally {
        setTimeout(() => {
          fs.promises.rm(execDir, { recursive: true, force: true }).catch(() => {});
        }, 1000);
      }
    });
  });
}

module.exports = {
  execute,
  prepareExecDir,
  resolveFileRefs,
};
