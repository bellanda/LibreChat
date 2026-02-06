/**
 * Security tests for storage module - path traversal and validation
 * Run: node --test src/storage.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveWithin, getSessionPaths, saveUpload, getFilePath } = require('./storage');

describe('storage security', () => {
  const base = path.join(os.tmpdir(), 'sandbox-test-' + Date.now());

  before(() => fs.promises.mkdir(base, { recursive: true }));
  after(() => fs.promises.rm(base, { recursive: true, force: true }).catch(() => {}));

  describe('resolveWithin', () => {
    it('allows path within base', () => {
      const result = resolveWithin(base, 'user1/session1/file.txt');
      assert.ok(result.includes(base));
      assert.ok(result.endsWith('file.txt'));
    });

    it('rejects path traversal with ..', () => {
      assert.throws(
        () => resolveWithin(base, '../../../etc/passwd'),
        /Path traversal denied/
      );
    });

    it('rejects path escaping base', () => {
      assert.throws(
        () => resolveWithin(base, '../../etc/passwd'),
        /Path traversal denied/
      );
    });
  });

  describe('getSessionPaths', () => {
    it('returns correct structure', () => {
      const p = getSessionPaths(base, 'user1', 'sess1');
      assert.ok(p.uploads.includes('user1'));
      assert.ok(p.uploads.endsWith('uploads'));
      assert.ok(p.workspace.endsWith('workspace'));
    });
  });

  describe('saveUpload', () => {
    it('saves file and returns valid metadata', async () => {
      const result = await saveUpload(base, 'user1', 'sess1', Buffer.from('hello'), 'test.txt');
      assert.ok(result.fileId);
      assert.strictEqual(result.filename, 'test.txt');
      assert.ok(result.filepath);
      const exists = await fs.promises.access(result.filepath).then(() => true).catch(() => false);
      assert.strictEqual(exists, true);
    });

    it('rejects malicious filename for path injection', async () => {
      await assert.rejects(
        () => saveUpload(base, 'user1', 'sess1', Buffer.from('x'), '../../../evil.txt'),
        /Invalid filename|path traversal/
      );
    });
  });

  describe('getFilePath', () => {
    it('returns path for existing file', async () => {
      const { fileId } = await saveUpload(base, 'user2', 'sess2', Buffer.from('data'), 'f.csv');
      const fp = await getFilePath(base, 'user2', 'sess2', fileId);
      assert.ok(fp);
      const content = await fs.promises.readFile(fp, 'utf8');
      assert.strictEqual(content, 'data');
    });

    it('throws for non-existent file', async () => {
      await assert.rejects(
        () => getFilePath(base, 'user2', 'sess2', 'nonexistent'),
        /File not found/
      );
    });
  });
});
