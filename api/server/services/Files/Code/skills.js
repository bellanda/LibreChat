const fs = require('fs');
const path = require('path');
const { logger } = require('@librechat/data-schemas');

/**
 * Tenant-wide "skill packs" primed into every code execution.
 *
 * The Code Interpreter scopes stored files by `kind` (service/src/session-key.ts):
 * `user` is private, `agent` is shared by an agent's users, and `skill` omits the
 * user dimension from the sessionKey entirely — so a single upload is readable by
 * everyone in the tenant. That is what lets a brand module be available in every
 * agent without being attached to any of them, which was the whole problem with
 * shipping `brand-templates/` as per-agent attachments.
 *
 * The manifest is written by `config/upload-code-skill.js`. Its contents are
 * deployment-specific — storage ids differ between local and prod — so it is not
 * versioned, and a missing manifest simply means the feature is off. Nothing here
 * throws: a broken manifest must never take down code execution, it must only
 * cost the skill files.
 */

const MANIFEST_FILENAME = 'code-skills.json';

/* api/server/services/Files/Code -> repo root (or /app in the container). */
const DEFAULT_MANIFEST_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'config',
  MANIFEST_FILENAME,
);

/** @type {{ path: string | null, mtimeMs: number, packs: Array<Object> }} */
let cache = { path: null, mtimeMs: -1, packs: [] };

/* Logged-once guards: this runs on every tool creation, and a malformed manifest
 * would otherwise repeat the same warning on every message. */
const warned = new Set();

function warnOnce(key, message) {
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  logger.warn(message);
}

function manifestPath() {
  const configured = process.env.CODE_SKILLS_MANIFEST;
  return configured != null && configured.length > 0 ? configured : DEFAULT_MANIFEST_PATH;
}

/**
 * A pack is only usable if it can produce a valid `RequestFile` for the service:
 * `kind: 'skill'` requires both a resource id and a numeric version, and the
 * bytes need a storage session. Partial packs are dropped rather than repaired —
 * a half-primed brand module fails in the sandbox in ways that are much harder to
 * read than a missing one.
 *
 * @param {unknown} pack
 * @returns {boolean}
 */
function isUsablePack(pack) {
  if (pack == null || typeof pack !== 'object') {
    return false;
  }
  const { id, version, storage_session_id: storageSessionId, files } = pack;
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    Number.isInteger(version) &&
    version > 0 &&
    typeof storageSessionId === 'string' &&
    storageSessionId.length > 0 &&
    Array.isArray(files) &&
    files.length > 0 &&
    files.every(
      (file) =>
        file != null &&
        typeof file.id === 'string' &&
        file.id.length > 0 &&
        typeof file.name === 'string' &&
        file.name.length > 0,
    )
  );
}

/**
 * Reads the manifest, re-reading only when its mtime changed so a re-upload takes
 * effect without restarting the server.
 *
 * @returns {Array<Object>} usable packs, or `[]`
 */
function loadPacks() {
  if (process.env.CODE_SKILLS_ENABLED === 'false') {
    return [];
  }

  const file = manifestPath();
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    /* No manifest is the normal state before anyone uploads a pack. */
    return [];
  }

  if (cache.path === file && cache.mtimeMs === stat.mtimeMs) {
    return cache.packs;
  }

  let packs = [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const candidates = Array.isArray(parsed?.skills) ? parsed.skills : [];
    packs = candidates.filter((pack) => {
      if (pack?.enabled === false) {
        return false;
      }
      if (!isUsablePack(pack)) {
        warnOnce(
          `pack:${pack?.id ?? 'unknown'}`,
          `[codeSkills] Ignoring malformed skill pack "${pack?.id ?? 'unknown'}" in ${file}`,
        );
        return false;
      }
      return true;
    });
    /* Reset the mtime-keyed guards: a rewritten manifest deserves fresh warnings. */
    warned.clear();
    logger.info(
      `[codeSkills] Loaded ${packs.length} skill pack(s) from ${file}: ${packs
        .map((pack) => `${pack.id}@v${pack.version}`)
        .join(', ')}`,
    );
  } catch (error) {
    warnOnce(`parse:${stat.mtimeMs}`, `[codeSkills] Failed to read ${file}: ${error.message}`);
    packs = [];
  }

  cache = { path: file, mtimeMs: stat.mtimeMs, packs };
  return packs;
}

/**
 * Builds the `RequestFile` entries and prompt notes for every enabled pack.
 *
 * Returns plain data on purpose — the caller owns the toolContext wording so
 * there is one place that formats the file list the model sees.
 *
 * @returns {{ files: Array<Object>, notes: Array<string> }}
 */
function primeSkillFiles() {
  const packs = loadPacks();
  /** @type {Array<Object>} */
  const files = [];
  /** @type {Array<string>} */
  const notes = [];

  for (const pack of packs) {
    for (const file of pack.files) {
      files.push({
        id: file.id,
        /* `resource_id` is the owning entity and drives the service's sessionKey
         * derivation; `id` is the storage uuid. Conflating them fails
         * authorization on every shared-kind /exec. */
        resource_id: pack.id,
        storage_session_id: pack.storage_session_id,
        name: file.name,
        kind: 'skill',
        version: pack.version,
      });
    }
    if (typeof pack.prompt === 'string' && pack.prompt.trim().length > 0) {
      notes.push(pack.prompt.trim());
    }
  }

  return { files, notes };
}

module.exports = {
  primeSkillFiles,
  /* Exported for tests and for callers that want to report configuration state. */
  loadPacks,
  MANIFEST_FILENAME,
  DEFAULT_MANIFEST_PATH,
};
