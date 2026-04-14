const { logger } = require('@librechat/data-schemas');

/**
 * Limita o tamanho do output do code interpreter para evitar consumo excessivo de créditos.
 * 
 * @param {string} output - O conteúdo do stdout/stderr do code interpreter
 * @param {number} maxLength - Tamanho máximo em caracteres (padrão: 10000)
 * @returns {string} - Output truncado com mensagem informativa
 */
function limitCodeOutput(output, maxLength = 10000) {
  if (!output || typeof output !== 'string') {
    return output;
  }

  if (output.length <= maxLength) {
    return output;
  }

  const truncated = output.slice(0, maxLength);
  const remaining = output.length - maxLength;
  
  logger.debug(`[limitCodeOutput] Truncated code output: ${output.length} -> ${maxLength} chars (${remaining} removed)`);
  
  return `${truncated}\n\n[... ${remaining.toLocaleString()} caracteres omitidos para economizar créditos. Use consultas mais específicas para reduzir o tamanho da saída.]`;
}

/**
 * Limita o output do code interpreter de forma inteligente, tentando preservar
 * informações importantes no início e no final.
 * 
 * @param {string} output - O conteúdo do stdout/stderr do code interpreter
 * @param {number} maxLength - Tamanho máximo em caracteres (padrão: 10000)
 * @returns {string} - Output truncado preservando início e fim
 */
function smartLimitCodeOutput(output, maxLength = 10000) {
  if (!output || typeof output !== 'string') {
    return output;
  }

  if (output.length <= maxLength) {
    return output;
  }

  // Reserva espaço para mensagem de truncamento
  const messageLength = 150;
  const availableLength = maxLength - messageLength;
  const halfLength = Math.floor(availableLength / 2);

  const start = output.slice(0, halfLength);
  const end = output.slice(-halfLength);
  const removed = output.length - availableLength;

  logger.debug(`[smartLimitCodeOutput] Truncated code output: ${output.length} -> ${maxLength} chars (${removed} removed)`);

  return `${start}\n\n[... ${removed.toLocaleString()} caracteres omitidos para economizar créditos ...]\n\n${end}`;
}

module.exports = {
  limitCodeOutput,
  smartLimitCodeOutput,
};
