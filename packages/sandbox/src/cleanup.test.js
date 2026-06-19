/**
 * Tests for storage retention / cleanup.
 * Run: node --test src/cleanup.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveUpload } = require('./storage');
const {
  findExpiredSessions,
  cleanupExpiredFiles,
  pruneSessionsIndex,
  startCleanupScheduler,
} = require('./cleanup');

const DAY_MS = 24 * 60 * 60 * 1000;

/** Backdate every file/dir under a path so it looks old. */
async function backdate(target, ms) {
  const time = new Date(Date.now() - ms);
  const walk = async (p) => {
    const entries = await fs.promises.readdir(p, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) await walk(full);
      await fs.promises.utimes(full, time, time).catch(() => {});
    }
    await fs.promises.utimes(p, time, time).catch(() => {});
  };
  await walk(target);
}

describe('cleanup retention', () => {
  const base = path.join(os.tmpdir(), 'sandbox-cleanup-' + Date.now());

  before(() => fs.promises.mkdir(base, { recursive: true }));
  after(() => fs.promises.rm(base, { recursive: true, force: true }).catch(() => {}));

  it('removes sessions older than the TTL and keeps fresh ones', async () => {
    // Old session (40 days) and fresh session (today)
    await saveUpload(base, 'userOld', 'sessOld', Buffer.from('old'), 'old.txt');
    await saveUpload(base, 'userNew', 'sessNew', Buffer.from('new'), 'new.txt');

    await backdate(path.join(base, 'userOld', 'sessOld'), 40 * DAY_MS);

    const result = await cleanupExpiredFiles(base, { ttlDays: 30 });

    assert.strictEqual(result.removed, 1);
    assert.deepStrictEqual(result.sessions, ['sessOld']);

    const oldExists = await fs.promises
      .access(path.join(base, 'userOld', 'sessOld'))
      .then(() => true)
      .catch(() => false);
    const newExists = await fs.promises
      .access(path.join(base, 'userNew', 'sessNew'))
      .then(() => true)
      .catch(() => false);

    assert.strictEqual(oldExists, false, 'expired session should be deleted');
    assert.strictEqual(newExists, true, 'fresh session should be kept');
  });

  it('prunes the .sessions.json index for removed sessions', async () => {
    const indexPath = path.join(base, '.sessions.json');
    const index = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
    assert.ok(!('sessOld' in index), 'removed session should be pruned from index');
    assert.ok('sessNew' in index, 'fresh session should remain in index');
  });

  it('findExpiredSessions respects the cutoff', async () => {
    await saveUpload(base, 'u3', 's3', Buffer.from('x'), 'a.txt');
    await backdate(path.join(base, 'u3', 's3'), 10 * DAY_MS);

    const expired30 = await findExpiredSessions(base, 30 * DAY_MS);
    assert.ok(!expired30.some((e) => e.sessionId === 's3'), '10-day session not expired at 30d TTL');

    const expired5 = await findExpiredSessions(base, 5 * DAY_MS);
    assert.ok(expired5.some((e) => e.sessionId === 's3'), '10-day session expired at 5d TTL');
  });

  it('does not treat .sessions.json as a user directory', async () => {
    // Should not throw even with the index file present at root
    const expired = await findExpiredSessions(base, 1 * DAY_MS);
    assert.ok(Array.isArray(expired));
  });

  it('ttlDays <= 0 disables cleanup (no-op)', async () => {
    const result = await cleanupExpiredFiles(base, { ttlDays: 0 });
    assert.deepStrictEqual(result, { removed: 0, bytesFreed: 0, sessions: [] });
  });

  it('pruneSessionsIndex is a no-op for empty set', async () => {
    await assert.doesNotReject(() => pruneSessionsIndex(base, new Set()));
  });

  describe('env configuration', () => {
    const saved = {
      ttl: process.env.SANDBOX_FILE_TTL_DAYS,
      interval: process.env.SANDBOX_CLEANUP_INTERVAL_HOURS,
    };
    after(() => {
      if (saved.ttl === undefined) delete process.env.SANDBOX_FILE_TTL_DAYS;
      else process.env.SANDBOX_FILE_TTL_DAYS = saved.ttl;
      if (saved.interval === undefined) delete process.env.SANDBOX_CLEANUP_INTERVAL_HOURS;
      else process.env.SANDBOX_CLEANUP_INTERVAL_HOURS = saved.interval;
    });

    it('defaults to enabled (30d) when env is unset, not disabled', () => {
      delete process.env.SANDBOX_FILE_TTL_DAYS;
      delete process.env.SANDBOX_CLEANUP_INTERVAL_HOURS;
      const handle = startCleanupScheduler(base);
      assert.notStrictEqual(handle, null, 'scheduler must run with default TTL when env unset');
      handle.stop();
    });

    it('is disabled when SANDBOX_FILE_TTL_DAYS=0', () => {
      process.env.SANDBOX_FILE_TTL_DAYS = '0';
      const handle = startCleanupScheduler(base);
      assert.strictEqual(handle, null, 'scheduler must be disabled when TTL is 0');
    });

    it('reads TTL and interval from env', () => {
      process.env.SANDBOX_FILE_TTL_DAYS = '7';
      process.env.SANDBOX_CLEANUP_INTERVAL_HOURS = '6';
      const handle = startCleanupScheduler(base);
      assert.notStrictEqual(handle, null);
      handle.stop();
    });
  });
});
