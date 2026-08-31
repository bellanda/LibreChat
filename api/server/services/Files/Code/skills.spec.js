const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('@librechat/data-schemas', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const validPack = (overrides = {}) => ({
  id: 'hpe-brand',
  version: 1,
  storage_session_id: 'sess-abc',
  files: [
    { id: 'file-1', name: 'hpe_brand.py' },
    { id: 'file-2', name: 'template-base.pptx' },
  ],
  prompt: 'import hpe_brand for branded decks',
  ...overrides,
});

describe('Code skill packs', () => {
  let dir;
  let manifest;
  let skills;

  const write = (contents) =>
    fs.writeFileSync(manifest, typeof contents === 'string' ? contents : JSON.stringify(contents));

  /* The module caches by (path, mtime), so each case needs a fresh require and a
   * fresh file — otherwise a same-millisecond rewrite would be served from cache. */
  const load = () => {
    jest.resetModules();
    skills = require('./skills');
    return skills;
  };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-skills-'));
    manifest = path.join(dir, 'code-skills.json');
    process.env.CODE_SKILLS_MANIFEST = manifest;
    delete process.env.CODE_SKILLS_ENABLED;
  });

  afterEach(() => {
    delete process.env.CODE_SKILLS_MANIFEST;
    delete process.env.CODE_SKILLS_ENABLED;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns nothing when the manifest does not exist', () => {
    const { primeSkillFiles } = load();
    expect(primeSkillFiles()).toEqual({ files: [], notes: [] });
  });

  it('builds a RequestFile per file, with resource_id and version from the pack', () => {
    write({ skills: [validPack()] });
    const { primeSkillFiles } = load();
    const { files, notes } = primeSkillFiles();

    expect(files).toHaveLength(2);
    expect(files[0]).toEqual({
      id: 'file-1',
      resource_id: 'hpe-brand',
      storage_session_id: 'sess-abc',
      name: 'hpe_brand.py',
      kind: 'skill',
      version: 1,
    });
    expect(notes).toEqual(['import hpe_brand for branded decks']);
  });

  it('keeps the storage id and the resource id distinct', () => {
    /* Sending the storage id as the resource id fails authorization on every
     * shared-kind /exec, which is silent until nothing can be read. */
    write({ skills: [validPack()] });
    const { primeSkillFiles } = load();
    const [file] = primeSkillFiles().files;
    expect(file.id).not.toEqual(file.resource_id);
    expect(file.resource_id).toBe('hpe-brand');
  });

  it('is disabled by CODE_SKILLS_ENABLED=false', () => {
    write({ skills: [validPack()] });
    process.env.CODE_SKILLS_ENABLED = 'false';
    const { primeSkillFiles } = load();
    expect(primeSkillFiles().files).toHaveLength(0);
  });

  it('skips packs marked enabled: false', () => {
    write({ skills: [validPack({ enabled: false })] });
    const { primeSkillFiles } = load();
    expect(primeSkillFiles().files).toHaveLength(0);
  });

  it('omits a pack with no prompt from the notes but still primes its files', () => {
    const pack = validPack();
    delete pack.prompt;
    write({ skills: [pack] });
    const { primeSkillFiles } = load();
    const { files, notes } = primeSkillFiles();
    expect(files).toHaveLength(2);
    expect(notes).toEqual([]);
  });

  describe('malformed input never throws and never half-primes', () => {
    const cases = [
      ['version missing', validPack({ version: undefined })],
      ['version not an integer', validPack({ version: 1.5 })],
      ['version zero', validPack({ version: 0 })],
      ['storage_session_id missing', validPack({ storage_session_id: '' })],
      ['id missing', validPack({ id: '' })],
      ['files empty', validPack({ files: [] })],
      ['a file without an id', validPack({ files: [{ name: 'x.py' }] })],
      ['a file without a name', validPack({ files: [{ id: 'file-1' }] })],
    ];

    it.each(cases)('drops the pack when %s', (_label, pack) => {
      write({ skills: [pack] });
      const { primeSkillFiles } = load();
      expect(primeSkillFiles()).toEqual({ files: [], notes: [] });
    });

    it('survives invalid JSON', () => {
      write('{ not json');
      const { primeSkillFiles } = load();
      expect(primeSkillFiles()).toEqual({ files: [], notes: [] });
    });

    it('survives a manifest with no skills array', () => {
      write({ unexpected: true });
      const { primeSkillFiles } = load();
      expect(primeSkillFiles()).toEqual({ files: [], notes: [] });
    });

    it('keeps the good packs when one is broken', () => {
      write({
        skills: [validPack({ id: 'broken', version: undefined }), validPack({ id: 'fine' })],
      });
      const { primeSkillFiles } = load();
      const { files } = primeSkillFiles();
      expect(files).toHaveLength(2);
      expect(files.every((file) => file.resource_id === 'fine')).toBe(true);
    });
  });

  it('primes every pack in the manifest', () => {
    write({
      skills: [
        validPack({ id: 'hpe-brand' }),
        validPack({ id: 'outra-marca', version: 3, storage_session_id: 'sess-xyz' }),
      ],
    });
    const { primeSkillFiles } = load();
    const { files, notes } = primeSkillFiles();
    expect(files).toHaveLength(4);
    expect(new Set(files.map((f) => f.resource_id))).toEqual(new Set(['hpe-brand', 'outra-marca']));
    expect(files.filter((f) => f.resource_id === 'outra-marca').every((f) => f.version === 3)).toBe(
      true,
    );
    expect(notes).toHaveLength(2);
  });

  it('re-reads the manifest when it changes on disk', () => {
    write({ skills: [validPack()] });
    const { primeSkillFiles } = load();
    expect(primeSkillFiles().files).toHaveLength(2);

    /* A re-upload bumps the version; the server must pick it up without a
     * restart, which is why the cache is keyed on mtime. */
    write({ skills: [validPack({ version: 2 })] });
    const future = new Date(Date.now() + 10000);
    fs.utimesSync(manifest, future, future);

    expect(primeSkillFiles().files.every((file) => file.version === 2)).toBe(true);
  });
});
