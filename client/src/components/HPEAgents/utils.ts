import { HPEMarkup, HPEMarkupType, ProcessedText } from './types';

// Regex patterns para detectar marcações
const MARKUP_PATTERNS = {
  [HPEMarkupType.PROGRESS]: /\[PROGRESS:(\d+(?:\.\d+)?):([^\]]+)\]/g,
  [HPEMarkupType.TOOL_START]: /\[TOOL_START:([^:]+):([^\]]+)\]/g,
  [HPEMarkupType.TOOL_END]: /\[TOOL_END:([^:]+):([^\]]+)\]/g,
  [HPEMarkupType.STATUS]: /\[STATUS:([^:]+):([^\]]+)\]/g,
  [HPEMarkupType.THINKING]: /\[THINKING:([^\]]+)\]/g,
  [HPEMarkupType.RESULT]: /\[RESULT:([^:]+):([^\]]+)\]/g,
  [HPEMarkupType.HIGHLIGHT]: /\[HIGHLIGHT:([^\]]+)\]/g,
  [HPEMarkupType.WARNING]: /\[WARNING:([^\]]+)\]/g,
  [HPEMarkupType.ERROR]: /\[ERROR:([^\]]+)\]/g,
  [HPEMarkupType.CODE]: /\[CODE:([^:]+):([^\]]+)\]/g,
  [HPEMarkupType.STEP]: /\[STEP:(\d+):([^\]]+)\]/g,
};

export function detectMarkups(text: string): HPEMarkup[] {
  const markups: HPEMarkup[] = [];

  Object.entries(MARKUP_PATTERNS).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const markup = parseMarkup(type as HPEMarkupType, match);
      if (markup) {
        markups.push(markup);
      }
    }
  });

  return markups.sort((a, b) => text.indexOf(a.originalText) - text.indexOf(b.originalText));
}

function parseMarkup(type: HPEMarkupType, match: RegExpExecArray): HPEMarkup | null {
  const originalText = match[0];

  switch (type) {
    case HPEMarkupType.PROGRESS:
      return {
        type,
        content: match[2],
        metadata: { percentage: parseFloat(match[1]) },
        originalText,
      };

    case HPEMarkupType.TOOL_START:
    case HPEMarkupType.TOOL_END:
      return {
        type,
        content: match[2],
        metadata: { toolName: match[1] },
        originalText,
      };

    case HPEMarkupType.STATUS:
    case HPEMarkupType.RESULT:
      return {
        type,
        content: match[2],
        metadata: { status: match[1] },
        originalText,
      };

    case HPEMarkupType.CODE:
      return {
        type,
        content: match[2],
        metadata: { language: match[1] },
        originalText,
      };

    case HPEMarkupType.STEP:
      return {
        type,
        content: match[2],
        metadata: { stepNumber: parseInt(match[1], 10) },
        originalText,
      };

    case HPEMarkupType.THINKING:
    case HPEMarkupType.HIGHLIGHT:
    case HPEMarkupType.WARNING:
    case HPEMarkupType.ERROR:
      return {
        type,
        content: match[1],
        originalText,
      };

    default:
      return null;
  }
}

export function processText(text: string): ProcessedText {
  const markups = detectMarkups(text);
  const segments: ProcessedText['segments'] = [];

  let lastIndex = 0;

  markups.forEach((markup) => {
    const markupIndex = text.indexOf(markup.originalText, lastIndex);

    // Adiciona texto antes da marcação
    if (markupIndex > lastIndex) {
      const textContent = text.slice(lastIndex, markupIndex);
      if (textContent.trim()) {
        segments.push({
          type: 'text',
          content: textContent,
        });
      }
    }

    // Adiciona a marcação
    segments.push({
      type: 'markup',
      content: markup.originalText,
      markup,
    });

    lastIndex = markupIndex + markup.originalText.length;
  });

  // Adiciona texto restante
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim()) {
      segments.push({
        type: 'text',
        content: remainingText,
      });
    }
  }

  return { segments };
}

export function getIconForMarkupType(type: HPEMarkupType): string {
  switch (type) {
    case HPEMarkupType.PROGRESS:
      return '⏳';
    case HPEMarkupType.TOOL_START:
      return '🔧';
    case HPEMarkupType.TOOL_END:
      return '✅';
    case HPEMarkupType.STATUS:
      return '📊';
    case HPEMarkupType.THINKING:
      return '🤔';
    case HPEMarkupType.RESULT:
      return '📋';
    case HPEMarkupType.HIGHLIGHT:
      return '⭐';
    case HPEMarkupType.WARNING:
      return '⚠️';
    case HPEMarkupType.ERROR:
      return '❌';
    case HPEMarkupType.CODE:
      return '💻';
    case HPEMarkupType.STEP:
      return '📝';
    default:
      return '📝';
  }
}

export function getColorSchemeForMarkupType(type: HPEMarkupType): string {
  switch (type) {
    case HPEMarkupType.PROGRESS:
      return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
    case HPEMarkupType.TOOL_START:
      return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
    case HPEMarkupType.TOOL_END:
      return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
    case HPEMarkupType.STATUS:
      return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    case HPEMarkupType.THINKING:
      return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
    case HPEMarkupType.RESULT:
      return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
    case HPEMarkupType.HIGHLIGHT:
      return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
    case HPEMarkupType.WARNING:
      return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
    case HPEMarkupType.ERROR:
      return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
    case HPEMarkupType.CODE:
      return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    case HPEMarkupType.STEP:
      return 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
  }
}
