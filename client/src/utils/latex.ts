// Regex to check if the processed content contains any potential LaTeX patterns
const containsLatexRegex =
  /\\\(.*?\\\)|\\\[.*?\\\]|\$.*?\$|\\begin\{equation\}.*?\\end\{equation\}/;

// Regex for inline and block LaTeX expressions
const inlineLatex = new RegExp(/\\\((.+?)\\\)/, 'g');
const blockLatex = new RegExp(/\\\[(.*?[^\\])\\\]/, 'gs');

/**
 * Detects Brazilian currency patterns in content
 * Used to prevent LaTeX processing when currency symbols are present
 */
export const hasBrazilianCurrency = (content: string): boolean => {
  return /R\$\s*[\d.,]+/gi.test(content);
};

// Function to restore code blocks
const restoreCodeBlocks = (content: string, codeBlocks: string[]) => {
  return content.replace(/<<CODE_BLOCK_(\d+)>>/g, (match, index) => codeBlocks[index]);
};

// Regex to identify code blocks and inline code
const codeBlockRegex = /(```[\s\S]*?```|`.*?`)/g;

export const processLaTeX = (_content: string) => {
  let content = _content;

  // Enhanced Brazilian currency detection
  // Check for R$ patterns including price ranges and multiple occurrences
  const hasBrazilianCurrency = /R\$\s*[\d.,]+/gi.test(content);
  if (hasBrazilianCurrency) {
    return content;
  }

  // Temporarily replace code blocks and inline code with placeholders
  const codeBlocks: string[] = [];
  let index = 0;
  content = content.replace(codeBlockRegex, (match) => {
    codeBlocks[index] = match;
    return `<<CODE_BLOCK_${index++}>>`;
  });

  // Escape dollar signs followed by a digit or space and digit
  // Improved regex to avoid escaping common currency symbols like R$, US$, etc.
  // Also handles cases with spaces, formatting, or special characters between $ and numbers
  let processedContent = content.replace(
    /(?<![A-Za-z])(\$)(?=[\s\*\u0000-\u001F\u007F-\u009F]*\d)/g,
    '\\$',
  );

  // If no LaTeX patterns are found, restore code blocks and return the processed content
  if (!containsLatexRegex.test(processedContent)) {
    return restoreCodeBlocks(processedContent, codeBlocks);
  }

  // Convert LaTeX expressions to a markdown compatible format
  processedContent = processedContent
    .replace(inlineLatex, (match: string, equation: string) => `$${equation}$`) // Convert inline LaTeX
    .replace(blockLatex, (match: string, equation: string) => `$$${equation}$$`); // Convert block LaTeX

  // Restore code blocks
  return restoreCodeBlocks(processedContent, codeBlocks);
};
// Pre-compile all regular expressions for better performance
const MHCHEM_CE_REGEX = /\$\\ce\{/g;
const MHCHEM_PU_REGEX = /\$\\pu\{/g;
const MHCHEM_CE_ESCAPED_REGEX = /\$\\\\ce\{[^}]*\}\$/g;
const MHCHEM_PU_ESCAPED_REGEX = /\$\\\\pu\{[^}]*\}\$/g;
const CURRENCY_REGEX =
  /(?<![\\$])\$(?!\$)(?=\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s|$|[^a-zA-Z\d]))/g;
const SINGLE_DOLLAR_REGEX = /(?<!\\)\$(?!\$)((?:[^$\n]|\\[$])+?)(?<!\\)\$(?!\$)/g;

/**
 * Escapes mhchem package notation in LaTeX by converting single dollar delimiters to double dollars
 * and escaping backslashes in mhchem commands.
 *
 * @param text - The input text containing potential mhchem notation
 * @returns The processed text with properly escaped mhchem notation
 */
function escapeMhchem(text: string): string {
  // First escape the backslashes in mhchem commands
  let result = text.replace(MHCHEM_CE_REGEX, '$\\\\ce{');
  result = result.replace(MHCHEM_PU_REGEX, '$\\\\pu{');

  // Then convert single dollar mhchem to double dollar
  result = result.replace(MHCHEM_CE_ESCAPED_REGEX, (match) => `$${match}$`);
  result = result.replace(MHCHEM_PU_ESCAPED_REGEX, (match) => `$${match}$`);

  return result;
}

/**
 * Efficiently finds all code block regions in the content
 * @param content The content to analyze
 * @returns Array of code block regions [start, end]
 */
function findCodeBlockRegions(content: string): Array<[number, number]> {
  const regions: Array<[number, number]> = [];
  let inlineStart = -1;
  let multilineStart = -1;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    // Check for multiline code blocks
    if (
      char === '`' &&
      i + 2 < content.length &&
      content[i + 1] === '`' &&
      content[i + 2] === '`'
    ) {
      if (multilineStart === -1) {
        multilineStart = i;
        i += 2; // Skip the next two backticks
      } else {
        regions.push([multilineStart, i + 2]);
        multilineStart = -1;
        i += 2;
      }
    }
    // Check for inline code blocks (only if not in multiline)
    else if (char === '`' && multilineStart === -1) {
      if (inlineStart === -1) {
        inlineStart = i;
      } else {
        regions.push([inlineStart, i]);
        inlineStart = -1;
      }
    }
  }

  return regions;
}

/**
 * Checks if a position is inside any code block region using binary search
 * @param position The position to check
 * @param codeRegions Array of code block regions
 * @returns True if position is inside a code block
 */
function isInCodeBlock(position: number, codeRegions: Array<[number, number]>): boolean {
  let left = 0;
  let right = codeRegions.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const [start, end] = codeRegions[mid];

    if (position >= start && position <= end) {
      return true;
    } else if (position < start) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return false;
}

/**
 * Preprocesses LaTeX content by escaping currency indicators and converting single dollar math delimiters.
 * Optimized for high-frequency execution.
 * @param content The input string containing LaTeX expressions.
 * @returns The processed string with escaped currency indicators and converted math delimiters.
 */
export function preprocessLaTeX(content: string): string {
  // Enhanced Brazilian currency detection
  // Check for R$ patterns including price ranges and multiple occurrences
  const hasBrazilianCurrency = /R\$\s*[\d.,]+/gi.test(content);
  if (hasBrazilianCurrency) {
    return content;
  }

  // Early return for most common case
  if (!content.includes('$')) return content;

  // Process mhchem first (usually rare, so check if needed)
  let processed = content;
  if (content.includes('\\ce{') || content.includes('\\pu{')) {
    processed = escapeMhchem(content);
  }

  // Find all code block regions once
  const codeRegions = findCodeBlockRegions(processed);

  // First pass: escape currency dollar signs
  const parts: string[] = [];
  let lastIndex = 0;

  // Reset regex for reuse
  CURRENCY_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = CURRENCY_REGEX.exec(processed)) !== null) {
    if (!isInCodeBlock(match.index, codeRegions)) {
      parts.push(processed.substring(lastIndex, match.index));
      parts.push('\\$');
      lastIndex = match.index + 1;
    }
  }
  parts.push(processed.substring(lastIndex));
  processed = parts.join('');

  // Second pass: convert single dollar delimiters to double dollars
  const result: string[] = [];
  lastIndex = 0;

  // Reset regex for reuse
  SINGLE_DOLLAR_REGEX.lastIndex = 0;

  while ((match = SINGLE_DOLLAR_REGEX.exec(processed)) !== null) {
    if (!isInCodeBlock(match.index, codeRegions)) {
      result.push(processed.substring(lastIndex, match.index));
      result.push(`$$${match[1]}$$`);
      lastIndex = match.index + match[0].length;
    }
  }
  result.push(processed.substring(lastIndex));

  return result.join('');
}
