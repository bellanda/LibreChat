import { useMemo } from 'react';
import { HPEMarkup, ProcessedText } from '~/components/HPEAgents/types';
import { detectMarkups, processText } from '~/components/HPEAgents/utils';

interface UseHPEAgentsProcessorReturn {
  hasMarkups: boolean;
  markups: HPEMarkup[];
  processedText: ProcessedText;
  shouldUseProcessor: boolean;
}

export function useHPEAgentsProcessor(text: string): UseHPEAgentsProcessorReturn {
  const result = useMemo(() => {
    if (!text || typeof text !== 'string') {
      return {
        hasMarkups: false,
        markups: [],
        processedText: { segments: [] },
        shouldUseProcessor: false,
      };
    }

    const markups = detectMarkups(text);
    const processedText = processText(text);

    return {
      hasMarkups: markups.length > 0,
      markups,
      processedText,
      shouldUseProcessor: markups.length > 0,
    };
  }, [text]);

  return result;
}

// Hook específico para verificar se uma string contém marcações HPE
export function useHasHPEMarkups(text: string): boolean {
  return useMemo(() => {
    if (!text || typeof text !== 'string') return false;

    const markups = detectMarkups(text);
    return markups.length > 0;
  }, [text]);
}

// Hook para contar diferentes tipos de marcações
export function useHPEMarkupStats(text: string) {
  return useMemo(() => {
    if (!text || typeof text !== 'string') {
      return {
        total: 0,
        byType: {},
      };
    }

    const markups = detectMarkups(text);
    const byType: Record<string, number> = {};

    markups.forEach((markup) => {
      byType[markup.type] = (byType[markup.type] || 0) + 1;
    });

    return {
      total: markups.length,
      byType,
    };
  }, [text]);
}
