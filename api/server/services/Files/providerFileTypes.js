/**
 * Which attachment types a model provider can receive as a native content block.
 *
 * Mirrors the encoders in `packages/api/src/files/encode/`: images have their own encoder,
 * `document.ts` emits document blocks for PDFs only, and video/audio are Google-only. Anything
 * outside this set — spreadsheets above all — has no representation in a provider payload, and
 * `BaseClient#processAttachments` drops it silently, leaving the model to report it received no
 * file. `processAgentFileUpload` uses this to route those types through text extraction instead.
 *
 * @param {string} [mimetype]
 * @returns {boolean}
 */
const canProviderRenderFileNatively = (mimetype = '') =>
  mimetype.startsWith('image/') ||
  mimetype === 'application/pdf' ||
  mimetype.startsWith('video/') ||
  mimetype.startsWith('audio/');

module.exports = { canProviderRenderFileNatively };
