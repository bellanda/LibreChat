const { canProviderRenderFileNatively } = require('./providerFileTypes');

/**
 * Guards the routing decision behind the provider-upload text fallback.
 *
 * A type that returns `false` here is one no provider can receive as a content block; uploaded
 * through the provider path it used to be discarded silently by `BaseClient#processAttachments`,
 * leaving the model to report it received no file. Returning `false` is what routes it through
 * text extraction instead, so widening this set without adding a matching encoder in
 * `packages/api/src/files/encode/` re-introduces the silent drop.
 */
describe('canProviderRenderFileNatively', () => {
  it.each([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'audio/mpeg',
  ])('accepts %s as a native provider type', (mimetype) => {
    expect(canProviderRenderFileNatively(mimetype)).toBe(true);
  });

  it.each([
    ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['xls', 'application/vnd.ms-excel'],
    ['csv', 'text/csv'],
    ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['plain text', 'text/plain'],
    ['json', 'application/json'],
  ])('routes %s to text extraction (no native representation)', (_label, mimetype) => {
    expect(canProviderRenderFileNatively(mimetype)).toBe(false);
  });

  it('does not treat a missing mimetype as native', () => {
    expect(canProviderRenderFileNatively()).toBe(false);
    expect(canProviderRenderFileNatively('')).toBe(false);
  });

  it('does not match a type that merely mentions pdf', () => {
    expect(canProviderRenderFileNatively('application/pdf-something')).toBe(false);
  });
});
