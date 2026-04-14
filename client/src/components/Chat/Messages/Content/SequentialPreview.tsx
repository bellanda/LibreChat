import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, Code } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

type PreviewItem = {
  type: 'thinking' | 'execute_code';
  content: string;
  lang?: string;
  output?: string;
};

type SequentialPreviewProps = {
  items: PreviewItem[];
  previewDuration?: number; // em milissegundos
};

/**
 * SequentialPreview - Mostra previews sequenciais de pensamentos e execuções de código
 * 
 * Quando há múltiplos pensamentos ou execuções, mostra cada um por alguns segundos
 * em sequência, mantendo tudo fechado mas dando uma prévia do conteúdo.
 */
const SequentialPreview = memo(({ items, previewDuration = 4000 }: SequentialPreviewProps) => {
  const localize = useLocalize();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Reset quando os itens mudam
  useEffect(() => {
    // Se os itens ficaram vazios (mensagem terminou), ocultar imediatamente
    if (items.length === 0) {
      setIsVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Se já estava visível e os itens mudaram, resetar para o início
    setIsVisible(true);
    setCurrentIndex(0);
    startTimeRef.current = Date.now();

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Mostrar cada item sequencialmente
    let itemIndex = 0;
    const showNext = () => {
      // Verificar se ainda há itens (pode ter mudado durante o timeout)
      if (items.length === 0 || itemIndex >= items.length) {
        setIsVisible(false);
        return;
      }

      setCurrentIndex(itemIndex);
      itemIndex++;

      if (itemIndex < items.length) {
        // Agendar próximo item
        timeoutRef.current = setTimeout(showNext, previewDuration);
      } else {
        // Último item, continuar mostrando enquanto houver itens
        // (o preview desaparece quando items.length vira 0)
        timeoutRef.current = setTimeout(() => {
          // Só ocultar se ainda estiver no último item e não houver mais itens novos
          if (itemIndex >= items.length) {
            setIsVisible(false);
          }
        }, previewDuration);
      }
    };

    // Começar mostrando o primeiro item
    showNext();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [items, previewDuration]);

  // Sempre calcular o preview content (hooks devem ser chamados na mesma ordem)
  // Garantir que currentIndex está dentro dos limites
  const safeIndex = items.length > 0 ? Math.min(currentIndex, items.length - 1) : 0;
  const currentItem = items[safeIndex];
  
  const previewContent = useMemo(() => {
    if (!currentItem?.content) {
      return '';
    }
    const lines = currentItem.content.split('\n');
    const previewLines = lines.slice(0, 3).join('\n');
    if (lines.length > 3) {
      return previewLines + '\n...';
    }
    return previewLines;
  }, [currentItem?.content]);

  const isThinking = currentItem?.type === 'thinking';
  const icon = isThinking ? Lightbulb : Code;
  const Icon = icon;
  const label = isThinking ? localize('com_ui_thoughts') : localize('com_ui_analyzing');

  // Retornar null apenas após todos os hooks serem chamados
  if (items.length === 0 || !isVisible || !currentItem) {
    return null;
  }

  return (
    <div
      className={cn(
        'mb-3 rounded-xl border border-border-medium bg-surface-tertiary p-3 transition-all duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {items.length > 1 && (
          <span className="text-xs text-text-secondary-alt ml-auto">
            {currentIndex + 1} / {items.length}
          </span>
        )}
      </div>
      <div className="text-xs text-text-secondary whitespace-pre-wrap font-mono max-h-24 overflow-hidden">
        {previewContent}
      </div>
      {currentItem.output && (
        <div className="mt-2 pt-2 border-t border-border-medium text-xs text-text-secondary-alt">
          <div className="truncate">{currentItem.output.substring(0, 100)}</div>
        </div>
      )}
    </div>
  );
});

SequentialPreview.displayName = 'SequentialPreview';

export default SequentialPreview;
