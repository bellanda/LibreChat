const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Uploads a brand/theme pack to the Code Interpreter as a `kind: 'skill'` bundle
 * and records the result in `config/code-skills.json`, which the server reads on
 * every code execution (api/server/services/Files/Code/skills.js).
 *
 * Why a script and not the UI: skill files are tenant-wide by design — the
 * service's sessionKey for `kind: 'skill'` omits the user dimension — so they are
 * uploaded once by an operator rather than attached to an agent by each person.
 *
 *   npm run upload-code-skill -- hpe
 *   npm run upload-code-skill -- hpe --dry-run
 *
 * The `version` is a monotonic counter the service uses to scope its cache, so
 * bumping it is how an edited pack invalidates the old bytes. This script bumps
 * it automatically from whatever the manifest already holds.
 */

const PACKS_DIR = path.resolve(__dirname, '..', 'brand-templates');
const MANIFEST_PATH = path.resolve(__dirname, 'code-skills.json');
const UPLOAD_USER = process.env.CODE_SKILLS_UPLOAD_USER || 'code-skills-operator';

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

function baseURL() {
  const url = process.env.LIBRECHAT_CODE_BASEURL;
  if (!url) {
    fail(
      'LIBRECHAT_CODE_BASEURL is not set. The old name `CODE_BASEURL` is not read by anything.',
    );
  }
  return url.replace(/\/$/, '');
}

/**
 * Resolves the pack's `include` patterns. Only a trailing `*` is supported, and
 * only within a single directory — deliberately dumb, because a real glob would
 * invite patterns that sweep in `assets/origem/` (heavy source material that must
 * never reach the sandbox) or a stray README.
 *
 * @param {string} packDir
 * @param {string[]} patterns
 * @returns {string[]} absolute paths
 */
function resolveIncludes(packDir, patterns) {
  const resolved = [];
  for (const pattern of patterns) {
    if (pattern.includes('..')) {
      fail(`Pattern "${pattern}" escapes the pack directory.`);
    }
    if (!pattern.endsWith('*')) {
      const file = path.join(packDir, pattern);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        fail(`"${pattern}" not found in ${packDir}`);
      }
      resolved.push(file);
      continue;
    }
    const dir = path.join(packDir, path.dirname(pattern));
    if (!fs.existsSync(dir)) {
      fail(`Directory for pattern "${pattern}" not found: ${dir}`);
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      /* Files only: a nested directory needs its own explicit pattern, so
       * `assets/*` never drags `assets/origem/` along. */
      if (entry.isFile()) {
        resolved.push(path.join(dir, entry.name));
      }
    }
  }
  return resolved;
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { skills: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    return { skills: Array.isArray(parsed?.skills) ? parsed.skills : [] };
  } catch (error) {
    fail(`${MANIFEST_PATH} exists but is not valid JSON: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const packName = args.find((arg) => !arg.startsWith('-'));

  if (!packName) {
    const available = fs.existsSync(PACKS_DIR)
      ? fs
          .readdirSync(PACKS_DIR, { withFileTypes: true })
          .filter((e) => e.isDirectory() && fs.existsSync(path.join(PACKS_DIR, e.name, 'skill.json')))
          .map((e) => e.name)
      : [];
    fail(
      `Usage: npm run upload-code-skill -- <pack> [--dry-run]\n    Packs with a skill.json: ${
        available.length > 0 ? available.join(', ') : '(none)'
      }`,
    );
  }

  const packDir = path.join(PACKS_DIR, packName);
  const skillFile = path.join(packDir, 'skill.json');
  if (!fs.existsSync(skillFile)) {
    fail(`${skillFile} not found. Every pack needs a skill.json — see brand-templates/README.md`);
  }

  /** @type {{id: string, description?: string, include: string[], prompt?: string}} */
  let pack;
  try {
    pack = JSON.parse(fs.readFileSync(skillFile, 'utf8'));
  } catch (error) {
    fail(`${skillFile} is not valid JSON: ${error.message}`);
  }

  if (!pack.id || !/^[A-Za-z0-9_.:-]+$/.test(pack.id)) {
    fail(
      `skill.json "id" must match /^[A-Za-z0-9_.:-]+$/ — the service validates it and 400s the whole request otherwise. Got: ${pack.id}`,
    );
  }
  if (!Array.isArray(pack.include) || pack.include.length === 0) {
    fail('skill.json needs a non-empty "include" array.');
  }

  const paths = resolveIncludes(packDir, pack.include);

  /* Files are uploaded flat (basename only), which is what the sandbox sees in
   * its working directory. Two patterns resolving to the same basename would
   * silently overwrite one another there. */
  const byName = new Map();
  for (const file of paths) {
    const name = path.basename(file);
    if (byName.has(name)) {
      fail(`Two included files share the basename "${name}":\n    ${byName.get(name)}\n    ${file}`);
    }
    byName.set(name, file);
  }

  const manifest = readManifest();
  const previous = manifest.skills.find((entry) => entry.id === pack.id);
  const version = (Number.isInteger(previous?.version) ? previous.version : 0) + 1;
  const totalBytes = [...byName.values()].reduce((sum, f) => sum + fs.statSync(f).size, 0);

  console.log(`\n  pack:    ${packName}  (id: ${pack.id})`);
  console.log(`  version: ${version}${previous ? ` (was ${previous.version})` : ' (first upload)'}`);
  console.log(`  target:  ${baseURL()}/upload`);
  console.log(`  files:   ${byName.size}, ${(totalBytes / 1024).toFixed(0)} KB`);
  for (const name of byName.keys()) {
    console.log(`    - ${name}`);
  }

  if (dryRun) {
    console.log('\n  --dry-run: nothing uploaded, manifest untouched.\n');
    return;
  }

  const form = new FormData();
  form.append('kind', 'skill');
  form.append('id', pack.id);
  form.append('version', String(version));
  for (const [name, file] of byName) {
    form.append('file', fs.createReadStream(file), name);
  }

  let result;
  try {
    const response = await axios.post(`${baseURL()}/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'LibreChat/1.0',
        /* `kind: 'skill'` derives its sessionKey without the user dimension, so
         * this identity does not scope the files — but the service's auth
         * middleware still requires the header to be present. */
        'User-Id': UPLOAD_USER,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    result = response.data;
  } catch (error) {
    const detail = error.response?.data
      ? JSON.stringify(error.response.data)
      : (error.message ?? 'unknown error');
    fail(`Upload failed: ${detail}`);
  }

  if (result?.message !== 'success') {
    fail(`Upload rejected: ${JSON.stringify(result)}`);
  }

  /* The service renamed this field to `storage_session_id`; older builds spell it
   * `session_id`. Reading only one silently produces `undefined` identifiers. */
  const storageSessionId = result.storage_session_id ?? result.session_id;
  if (!storageSessionId) {
    fail(`Upload response has no storage_session_id: ${JSON.stringify(result)}`);
  }
  if (!Array.isArray(result.files) || result.files.length !== byName.size) {
    fail(
      `Expected ${byName.size} files in the response, got ${result.files?.length ?? 0}: ${JSON.stringify(result.files)}`,
    );
  }

  const entry = {
    id: pack.id,
    version,
    description: pack.description,
    storage_session_id: storageSessionId,
    uploadedAt: new Date().toISOString(),
    files: result.files.map((file) => ({ id: file.fileId, name: file.filename })),
  };
  if (pack.prompt) {
    entry.prompt = pack.prompt;
  }

  manifest.skills = [...manifest.skills.filter((s) => s.id !== pack.id), entry];
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\n  ✓ uploaded, storage_session_id ${storageSessionId}`);
  console.log(`  ✓ manifest written: ${MANIFEST_PATH}`);
  console.log('\n  The server re-reads the manifest on mtime change — no restart needed.\n');
}

main().catch((error) => fail(error.stack ?? error.message));
