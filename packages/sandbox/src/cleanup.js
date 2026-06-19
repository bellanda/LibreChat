/**
 * Storage retention / cleanup for the sandbox.
 *
 * The sandbox owns the `storage/` volume, so retention is enforced here (in the
 * sandbox process) rather than from an external cron in a different container.
 * A periodic sweeper removes whole session directories that have been inactive
 * for longer than the configured TTL and prunes the root `.sessions.json` index.
 *
 * Config (env):
 *   SANDBOX_FILE_TTL_DAYS          - retention in days (default 30; <= 0 disables)
 *   SANDBOX_CLEANUP_INTERVAL_HOURS - sweep interval in hours (default 24)
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
const { resolveWithin } = require('./storage');

const DEFAULT_TTL_DAYS = 30;
const DEFAULT_INTERVAL_HOURS = 24;
const SESSIONS_INDEX = '.sessions.json';

/**
 * Parse an env var into a finite number, or return undefined when unset/invalid.
 * Avoids the `Number(undefined) === NaN` pitfall with `??` fallbacks.
 * @param {string} name
 * @returns {number | undefined}
 */
function envNum(name) {
  const raw = process.env[name];
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Files at the storage root that must never be treated as a userId directory. */
const ROOT_RESERVED = new Set([SESSIONS_INDEX]);

/**
 * Newest modification time (ms) in a directory subtree, scanning at most a few
 * levels deep. Cheap and accurate enough: outputs land as files in `workspace/`
 * and uploads in `uploads/`, so their mtimes reflect real session activity.
 * @param {string} dir
 * @param {number} [depth]
 * @returns {Promise<number>}
 */
async function newestMtime(dir, depth = 2) {
  let newest = 0;
  let stat;
  try {
    stat = await fs.promises.stat(dir);
  } catch {
    return 0;
  }
  newest = stat.mtimeMs;
  if (depth <= 0 || !stat.isDirectory()) {
    return newest;
  }
  const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      newest = Math.max(newest, await newestMtime(full, depth - 1));
    } else {
      const s = await fs.promises.stat(full).catch(() => null);
      if (s) newest = Math.max(newest, s.mtimeMs);
    }
  }
  return newest;
}

/**
 * Find session directories whose newest activity is older than the TTL.
 * @param {string} storageRoot
 * @param {number} ttlMs
 * @param {number} [now]
 * @returns {Promise<Array<{ userId: string; sessionId: string; dir: string; ageMs: number }>>}
 */
async function findExpiredSessions(storageRoot, ttlMs, now = Date.now()) {
  const baseResolved = path.resolve(storageRoot);
  const expired = [];

  const userDirs = await fs.promises.readdir(baseResolved, { withFileTypes: true }).catch(() => []);
  for (const userEntry of userDirs) {
    if (!userEntry.isDirectory() || ROOT_RESERVED.has(userEntry.name)) {
      continue;
    }
    const userPath = path.join(baseResolved, userEntry.name);
    const sessionDirs = await fs.promises.readdir(userPath, { withFileTypes: true }).catch(() => []);
    for (const sessEntry of sessionDirs) {
      if (!sessEntry.isDirectory()) {
        continue;
      }
      const dir = path.join(userPath, sessEntry.name);
      const newest = await newestMtime(dir);
      const ageMs = now - newest;
      if (newest > 0 && ageMs > ttlMs) {
        expired.push({ userId: userEntry.name, sessionId: sessEntry.name, dir, ageMs });
      }
    }
  }
  return expired;
}

/**
 * Remove the session ids from the root `.sessions.json` index.
 * @param {string} storageRoot
 * @param {Set<string>} sessionIds
 */
async function pruneSessionsIndex(storageRoot, sessionIds) {
  if (sessionIds.size === 0) {
    return;
  }
  const indexPath = path.join(path.resolve(storageRoot), SESSIONS_INDEX);
  let index;
  try {
    index = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
  } catch {
    return;
  }
  let changed = false;
  for (const id of sessionIds) {
    if (id in index) {
      delete index[id];
      changed = true;
    }
  }
  if (changed) {
    await fs.promises.writeFile(indexPath, JSON.stringify(index), { mode: 0o640 });
  }
}

/**
 * Delete session directories that are older than the TTL.
 * @param {string} storageRoot
 * @param {Object} [opts]
 * @param {number} [opts.ttlDays]
 * @param {number} [opts.now]
 * @returns {Promise<{ removed: number; bytesFreed: number; sessions: string[] }>}
 */
async function cleanupExpiredFiles(storageRoot, opts = {}) {
  const ttlDays = opts.ttlDays ?? envNum('SANDBOX_FILE_TTL_DAYS') ?? DEFAULT_TTL_DAYS;
  if (!(ttlDays > 0)) {
    return { removed: 0, bytesFreed: 0, sessions: [] };
  }
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  const baseResolved = path.resolve(storageRoot);
  const expired = await findExpiredSessions(baseResolved, ttlMs, opts.now);

  const removedSessionIds = new Set();
  let bytesFreed = 0;
  for (const { sessionId, dir, ageMs } of expired) {
    // Defensive: never delete anything outside the storage root.
    try {
      resolveWithin(baseResolved, path.relative(baseResolved, dir));
    } catch {
      logger.warn('[cleanup] Skipping out-of-root path', { dir });
      continue;
    }
    bytesFreed += await dirSize(dir);
    await fs.promises.rm(dir, { recursive: true, force: true }).catch((err) => {
      logger.warn('[cleanup] Failed to remove session dir', { dir, error: err.message });
    });
    removedSessionIds.add(sessionId);
    logger.info('[cleanup] Removed expired session', {
      sessionId,
      ageDays: Math.round(ageMs / 86_400_000),
    });
  }

  await pruneSessionsIndex(baseResolved, removedSessionIds);

  return {
    removed: removedSessionIds.size,
    bytesFreed,
    sessions: [...removedSessionIds],
  };
}

/**
 * Best-effort recursive byte size of a directory (for reporting only).
 * @param {string} dir
 * @returns {Promise<number>}
 */
async function dirSize(dir) {
  let total = 0;
  const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      total += await dirSize(full);
    } else {
      const s = await fs.promises.stat(full).catch(() => null);
      if (s) total += s.size;
    }
  }
  return total;
}

/**
 * Start the periodic cleanup scheduler. Runs once on start, then on an interval.
 * @param {string} storageRoot
 * @param {Object} [opts]
 * @param {number} [opts.ttlDays]
 * @param {number} [opts.intervalHours]
 * @returns {{ stop: () => void } | null} Handle to stop the scheduler, or null if disabled.
 */
function startCleanupScheduler(storageRoot, opts = {}) {
  const ttlDays = opts.ttlDays ?? envNum('SANDBOX_FILE_TTL_DAYS') ?? DEFAULT_TTL_DAYS;
  if (!(ttlDays > 0)) {
    logger.info('[cleanup] File retention disabled (SANDBOX_FILE_TTL_DAYS <= 0)');
    return null;
  }
  const intervalHours =
    opts.intervalHours ?? envNum('SANDBOX_CLEANUP_INTERVAL_HOURS') ?? DEFAULT_INTERVAL_HOURS;
  const intervalMs = Math.max(1, intervalHours) * 60 * 60 * 1000;

  const run = async () => {
    try {
      const result = await cleanupExpiredFiles(storageRoot, { ttlDays });
      if (result.removed > 0) {
        logger.info('[cleanup] Sweep complete', {
          removed: result.removed,
          mbFreed: Math.round(result.bytesFreed / 1_048_576),
        });
      }
    } catch (err) {
      logger.error('[cleanup] Sweep failed', { error: err.message });
    }
  };

  logger.info('[cleanup] File retention enabled', { ttlDays, intervalHours });
  // Run shortly after startup so boot is not blocked, then on the interval.
  const kickoff = setTimeout(run, 30_000);
  const timer = setInterval(run, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  if (typeof kickoff.unref === 'function') kickoff.unref();

  return {
    stop: () => {
      clearTimeout(kickoff);
      clearInterval(timer);
    },
  };
}

module.exports = {
  newestMtime,
  findExpiredSessions,
  pruneSessionsIndex,
  cleanupExpiredFiles,
  startCleanupScheduler,
};
