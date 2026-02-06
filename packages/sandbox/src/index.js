/**
 * @librechat/sandbox - Self-hosted Code Interpreter
 * Compatible with code.librechat API.
 */

const storage = require('./storage');
const executor = require('./executor');

module.exports = {
  ...storage,
  execute: executor.execute,
};
