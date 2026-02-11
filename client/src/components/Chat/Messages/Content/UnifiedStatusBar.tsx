import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { ChevronDown, Code, Lightbulb } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { fontSizeAtom } from '~/store/fontSize';
import { cn } from '~/utils';

export type UnifiedPhase = 'thinking' | 'analyzing' | 'completed';

export type ToolCallEntry = {
  type: 'execute_code' | 'code_interpreter' | 'tool_call';
  name: string;
  lang?: string;
  code: string;
  output: string;
};

type UnifiedStatusBarProps = {
  phase: UnifiedPhase;
  allReasoning: string[];
  toolCalls: ToolCallEntry[];
  className?: string;
};

const SNIPPET_MAX_LENGTH = 120;

/**
 * Barra unificada no estilo ChatGPT.
 *
 * Colapsada: "Pensamentos · Análise concluída (2x)"
 * Expandida: pensamento completo + código executado + output de cada execução
 */
const UnifiedStatusBar = memo(function UnifiedStatusBar({
  phase,
  allReasoning,
  toolCalls,
  className,
}: UnifiedStatusBarProps) {
  const localize = useLocalize();
  const fontSize = useAtomValue(fontSizeAtom);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = phase === 'thinking' || phase === 'analyzing';

  const combinedReasoning = useMemo(() => allReasoning.join('\n\n'), [allReasoning]);
  const hasReasoning = combinedReasoning.length > 0;
  const hasToolCalls = toolCalls.length > 0;

  // Snippet do pensamento durante geração
  const snippet = useMemo(() => {
    if (phase !== 'thinking' || !hasReasoning) {
      return '';
    }
    const lines = combinedReasoning.split('\n').filter((l) => l.trim());
    const last = lines[lines.length - 1] ?? '';
    return last.length > SNIPPET_MAX_LENGTH
      ? last.slice(0, SNIPPET_MAX_LENGTH).trim() + '…'
      : last.trim();
  }, [phase, hasReasoning, combinedReasoning]);

  // Label principal
  const label = useMemo(() => {
    if (phase === 'thinking') {
      return localize('com_ui_thinking');
    }
    if (phase === 'analyzing') {
      return localize('com_ui_analyzing');
    }
    // completed
    const parts: string[] = [];
    if (hasReasoning) {
      parts.push(localize('com_ui_thoughts'));
    }
    if (hasToolCalls) {
      const analysisLabel = localize('com_ui_analyzing_finished');
      parts.push(toolCalls.length > 1 ? `${analysisLabel} (${toolCalls.length}x)` : analysisLabel);
    }
    return parts.join(' · ') || localize('com_ui_thoughts');
  }, [phase, hasReasoning, hasToolCalls, toolCalls.length, localize]);

  const handleToggle = useCallback(() => {
    if (!isActive && (hasReasoning || hasToolCalls)) {
      setIsExpanded((prev) => !prev);
    }
  }, [isActive, hasReasoning, hasToolCalls]);

  const canExpand = !isActive && (hasReasoning || hasToolCalls);

  // Enquanto tiver bolinha, não mostra texto; quando aparece texto (snippet), some a bolinha
  const showDots = isActive && !snippet;
  const showSnippetBlock = isActive && !!snippet;

  return (
    <div ref={containerRef} className={cn('group/unified my-1', className)}>
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!canExpand}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-lg py-2 text-left',
          fontSize,
          canExpand && 'cursor-pointer hover:opacity-80',
          !canExpand && 'cursor-default',
        )}
      >
        <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-text-secondary">
          {isActive ? (
            showDots ? (
              <span
                className="unified-status-dots inline-flex items-center gap-[3px]"
                aria-hidden="true"
              >
                <span className="h-[5px] w-[5px] rounded-full bg-current" />
                <span className="h-[5px] w-[5px] rounded-full bg-current" />
                <span className="h-[5px] w-[5px] rounded-full bg-current" />
              </span>
            ) : (
              <span className="inline-flex h-[5px] w-[5px] shrink-0 rounded-full bg-current opacity-60" aria-hidden="true" />
            )
          ) : (
            <>
              <Lightbulb
                className="icon-sm absolute text-text-secondary opacity-100 transition-opacity group-hover/unified:opacity-0"
                aria-hidden="true"
              />
              <ChevronDown
                className={cn(
                  'icon-sm absolute transform-gpu text-text-primary opacity-0 transition-all duration-300 group-hover/unified:opacity-100',
                  isExpanded && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </>
          )}
        </span>

        {/* Label: escondido quando está mostrando só a bolinha (evita texto + bolinha ao mesmo tempo) */}
        {!showDots && <span className="text-text-secondary">{label}</span>}

        {!isActive && hasToolCalls && (
          <Code className="ml-0.5 h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
        )}
      </button>

      {/* Snippet durante geração — só quando tem texto; nesse caso a bolinha já sumiu */}
      {showSnippetBlock && (
        <p className="ml-6 border-l-2 border-border-medium pl-3 text-xs leading-relaxed text-text-tertiary">
          {snippet}
        </p>
      )}

      {/* Conteúdo expandido */}
      <div
        className={cn('grid transition-all duration-300 ease-out', isExpanded && 'mb-4')}
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3">
            {/* Pensamentos */}
            {hasReasoning && (
              <div className="rounded-2xl border border-border-medium bg-surface-tertiary p-4 text-text-secondary">
                <p className={cn('whitespace-pre-wrap leading-[26px]', fontSize)}>
                  {combinedReasoning}
                </p>
              </div>
            )}

            {/* Tool calls: código + output (recolhidos por padrão) */}
            {toolCalls.map((tc, idx) => (
              <ToolCallBlock key={idx} entry={tc} index={idx} total={toolCalls.length} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Bloco individual de tool call dentro da view expandida.
 * Mostra título, código executado (com syntax highlight simples) e output.
 * Por padrão, inicia recolhido - apenas o título é visível.
 */
const ToolCallBlock = memo(function ToolCallBlock({
  entry,
  index,
  total,
}: {
  entry: ToolCallEntry;
  index: number;
  total: number;
}) {
  const localize = useLocalize();
  const fontSize = useAtomValue(fontSizeAtom);
  const [isExpanded, setIsExpanded] = useState(false);

  const title = useMemo(() => {
    if (entry.type === 'execute_code' || entry.type === 'code_interpreter') {
      const suffix = total > 1 ? ` #${index + 1}` : '';
      return `${localize('com_ui_analyzing_finished')}${suffix}`;
    }
    // Para web_search e outros, mostra o nome com número se houver múltiplos
    const baseName = entry.name || 'Tool Call';
    const suffix = total > 1 ? ` ${index + 1}` : '';
    return `${baseName}${suffix}`;
  }, [entry, index, total, localize]);

  const hasContent = !!(entry.code || entry.output);

  const handleToggle = useCallback(() => {
    if (hasContent) {
      setIsExpanded((prev) => !prev);
    }
  }, [hasContent]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-medium bg-surface-primary">
      {/* Título clicável */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!hasContent}
        className={cn(
          'flex w-full items-center gap-2 border-b border-border-medium bg-surface-tertiary/60 px-4 py-2 text-left text-xs font-medium text-text-secondary transition-colors',
          hasContent && 'cursor-pointer hover:bg-surface-tertiary/80',
          !hasContent && 'cursor-default',
        )}
      >
        <Code className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{title}</span>
        {hasContent && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 transform-gpu transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Conteúdo expandível */}
      <div
        className={cn('grid transition-all duration-300 ease-out')}
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {/* O que foi executado (código ou args da ação) */}
          {entry.code && (
            <div className="border-b border-border-medium bg-gray-950 dark:bg-gray-900 px-4 py-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                {entry.type === 'tool_call'
                  ? localize('com_ui_input')
                  : localize('com_ui_code')}
              </div>
              <pre
                className={cn(
                  'overflow-x-auto text-xs leading-relaxed text-gray-200',
                  fontSize,
                )}
              >
                <code>{entry.code}</code>
              </pre>
            </div>
          )}

          {/* Output / Resultado */}
          {entry.output && (
            <div className="border-t border-border-medium bg-surface-tertiary px-4 py-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                {localize('com_ui_result')}
              </div>
              <pre
                className={cn(
                  'whitespace-pre-wrap text-xs leading-relaxed text-text-secondary',
                  fontSize,
                )}
              >
                {entry.output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default UnifiedStatusBar;
