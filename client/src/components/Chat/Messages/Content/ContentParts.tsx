import { memo, useMemo, useCallback } from 'react';
import { ContentTypes, Tools, ToolCallTypes } from 'librechat-data-provider';
import type {
  TMessageContentParts,
  SearchResultData,
  TAttachment,
  Agents,
} from 'librechat-data-provider';
import { MessageContext, SearchContext } from '~/Providers';
import MemoryArtifacts from './MemoryArtifacts';
import Sources from '~/components/Web/Sources';
import { mapAttachments } from '~/utils/map';
import { EditTextPart, EmptyText } from './Parts';
import Container from './Container';
import Part from './Part';
import type { UnifiedPhase, ToolCallEntry } from './UnifiedStatusBar';
import UnifiedStatusBar from './UnifiedStatusBar';

type ContentPartsProps = {
  content: Array<TMessageContentParts | undefined> | undefined;
  messageId: string;
  conversationId?: string | null;
  attachments?: TAttachment[];
  searchResults?: { [key: string]: SearchResultData };
  isCreatedByUser: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  isLatestMessage?: boolean;
  edit?: boolean;
  enterEdit?: (cancel?: boolean) => void | null | undefined;
  siblingIdx?: number;
  setSiblingIdx?:
  | ((value: number) => void | React.Dispatch<React.SetStateAction<number>>)
  | null
  | undefined;
};

/**
 * ContentParts renders message content parts, handling both sequential and parallel layouts.
 *
 * For 90% of messages (single-agent, no parallel execution), this renders sequentially.
 * For multi-agent parallel execution, it uses ParallelContentRenderer to show columns.
 */
const ContentParts = memo(function ContentParts({
  edit,
  isLast,
  content,
  messageId,
  enterEdit,
  siblingIdx,
  attachments,
  isSubmitting,
  setSiblingIdx,
  searchResults,
  conversationId,
  isCreatedByUser,
  isLatestMessage,
}: ContentPartsProps) {
  const attachmentMap = useMemo(() => mapAttachments(attachments ?? []), [attachments]);
  const effectiveIsSubmitting = isLatestMessage ? isSubmitting : false;

  /**
   * Coleta dados para a barra unificada:
   * - Todos os textos de raciocínio (THINK parts)
   * - Contagem de tool calls (execute_code, web_search, etc.)
   * - Fase corrente (pensando / analisando / concluído)
   *
   * Tudo aparece em UMA única barra no estilo ChatGPT.
   */
  const unifiedData = useMemo(() => {
    if (!content?.length) {
      return null;
    }

    const allReasoning: string[] = [];
    const toolCalls: ToolCallEntry[] = [];

    for (const part of content) {
      if (!part) {
        continue;
      }
      if (part.type === ContentTypes.THINK) {
        const raw =
          typeof (part as { think?: string }).think === 'string'
            ? (part as { think: string }).think
            : (part as { think?: { value?: string } }).think?.value;
        if (typeof raw === 'string') {
          const cleaned = raw.replace(/^<think>\s*/, '').replace(/\s*<\/think>$/, '').trim();
          if (cleaned) {
            allReasoning.push(cleaned);
          }
        }
      } else if (part.type === ContentTypes.TOOL_CALL) {
        const tc = part[ContentTypes.TOOL_CALL] as Agents.ToolCall | undefined;
        if (tc) {
          // CODE_INTERPRETER (Assistants API style)
          const tcType = tc.type as string | undefined;
          if (tcType === ToolCallTypes.CODE_INTERPRETER) {
            const ci = (tc as Record<string, unknown>)[ToolCallTypes.CODE_INTERPRETER] as
              | { input?: string; outputs?: Record<string, unknown>[] }
              | undefined;
            const logs = (ci?.outputs ?? []).reduce((acc: string, o: Record<string, unknown>) => {
              return o['logs'] ? acc + String(o['logs']) + '\n' : acc;
            }, '');
            toolCalls.push({
              type: 'code_interpreter',
              name: 'code_interpreter',
              lang: 'python',
              code: ci?.input ?? '',
              output: logs,
            });
          } else {
            // Agent-style tool call (execute_code, web_search, generic, etc.)
            const isAgentToolCall =
              'args' in tc && (!tc.type || tc.type === ToolCallTypes.TOOL_CALL);

            if (isAgentToolCall && tc.name === Tools.execute_code) {
              let lang = '';
              let code = '';
              try {
                const parsed = JSON.parse((tc.args as string) || '{}');
                lang = parsed.lang ?? '';
                code = parsed.code ?? '';
              } catch {
                const langMatch = (tc.args as string)?.match(/"lang"\s*:\s*"(\w+)"/);
                const codeMatch = (tc.args as string)?.match(/"code"\s*:\s*"(.+?)"/s);
                lang = langMatch?.[1] ?? '';
                code = codeMatch?.[1]?.replace(/\\n/g, '\n').replace(/\\"/g, '"') ?? '';
              }
              toolCalls.push({
                type: 'execute_code',
                name: tc.name ?? 'execute_code',
                lang,
                code,
                output: tc.output ?? '',
              });
            } else {
              // Para polars_action e outros: args contém o que foi executado (code, mapping, etc.)
              let argsDisplay = '';
              const rawArgs = tc.args;
              if (typeof rawArgs === 'string' && rawArgs.trim()) {
                try {
                  argsDisplay = JSON.stringify(JSON.parse(rawArgs), null, 2);
                } catch {
                  argsDisplay = rawArgs;
                }
              } else if (rawArgs && typeof rawArgs === 'object') {
                argsDisplay = JSON.stringify(rawArgs, null, 2);
              }
              toolCalls.push({
                type: 'tool_call',
                name: (isAgentToolCall ? tc.name : '') || 'tool',
                code: argsDisplay,
                output: tc.output ?? '',
              });
            }
          }
        }
      }
    }

    // Se não tem nenhum THINK nem TOOL_CALL, não mostrar a barra
    if (allReasoning.length === 0 && toolCalls.length === 0) {
      return null;
    }

    // Fase corrente: baseada na última part + submitting
    let phase: UnifiedPhase = 'completed';
    if (effectiveIsSubmitting) {
      const lastPart = content[content.length - 1];
      if (lastPart?.type === ContentTypes.THINK) {
        phase = 'thinking';
      } else if (lastPart?.type === ContentTypes.TOOL_CALL) {
        phase = 'analyzing';
      }
    }

    return { phase, allReasoning, toolCalls };
  }, [content, effectiveIsSubmitting]);

  /**
   * Esconde indicadores de TODAS as parts THINK e TOOL_CALL.
   * Tudo é representado pela barra unificada.
   */
  const shouldHideProgress = useCallback(
    (part: TMessageContentParts) => {
      if (!unifiedData) {
        return false;
      }
      return part.type === ContentTypes.THINK || part.type === ContentTypes.TOOL_CALL;
    },
    [unifiedData],
  );

  /**
   * Render a single content part with proper context.
   */
  const renderPart = useCallback(
    (part: TMessageContentParts, idx: number, isLastPart: boolean) => {
      const toolCallId = (part?.[ContentTypes.TOOL_CALL] as Agents.ToolCall | undefined)?.id ?? '';
      const partAttachments = attachmentMap[toolCallId];
      const hideProgressIndicator = shouldHideProgress(part);

      return (
        <MessageContext.Provider
          key={`provider-${messageId}-${idx}`}
          value={{
            messageId,
            isExpanded: true,
            conversationId,
            partIndex: idx,
            nextType: content?.[idx + 1]?.type,
            isSubmitting: effectiveIsSubmitting,
            isLatestMessage,
            hideThinkingIndicator: !!unifiedData,
          }}
        >
          <Part
            part={part}
            attachments={partAttachments}
            isSubmitting={effectiveIsSubmitting}
            key={`part-${messageId}-${idx}`}
            isCreatedByUser={isCreatedByUser}
            isLast={isLastPart}
            showCursor={isLastPart && isLast}
            hideProgressIndicator={hideProgressIndicator}
          />
        </MessageContext.Provider>
      );
    },
    [
      attachmentMap,
      content,
      conversationId,
      effectiveIsSubmitting,
      shouldHideProgress,
      isCreatedByUser,
      isLast,
      isLatestMessage,
      messageId,
    ],
  );

  // Early return: no content
  if (!content) {
    return null;
  }

  // Edit mode: render editable text parts
  if (edit === true && enterEdit && setSiblingIdx) {
    return (
      <>
        {content.map((part, idx) => {
          if (!part) {
            return null;
          }
          const isTextPart =
            part?.type === ContentTypes.TEXT ||
            typeof (part as unknown as Agents.MessageContentText)?.text !== 'string';
          const isThinkPart =
            part?.type === ContentTypes.THINK ||
            typeof (part as unknown as Agents.ReasoningDeltaUpdate)?.think !== 'string';
          if (!isTextPart && !isThinkPart) {
            return null;
          }

          const isToolCall =
            part.type === ContentTypes.TOOL_CALL || part['tool_call_ids'] != null;
          if (isToolCall) {
            return null;
          }

          return (
            <EditTextPart
              index={idx}
              part={part as Agents.MessageContentText | Agents.ReasoningDeltaUpdate}
              messageId={messageId}
              isSubmitting={isSubmitting}
              enterEdit={enterEdit}
              siblingIdx={siblingIdx ?? null}
              setSiblingIdx={setSiblingIdx}
              key={`edit-${messageId}-${idx}`}
            />
          );
        })}
      </>
    );
  }

  const showEmptyCursor = content.length === 0 && effectiveIsSubmitting;
  const lastContentIdx = content.length - 1;

  // Sequential content: render parts in order (90% of cases)
  const sequentialParts: Array<{ part: TMessageContentParts; idx: number }> = [];
  content.forEach((part, idx) => {
    if (part) {
      sequentialParts.push({ part, idx });
    }
  });

  return (
    <SearchContext.Provider value={{ searchResults }}>
      <MemoryArtifacts attachments={attachments} />
      <Sources messageId={messageId} conversationId={conversationId || undefined} />
      {showEmptyCursor && (
        <Container>
          <EmptyText />
        </Container>
      )}
      {unifiedData && (
        <UnifiedStatusBar
          phase={unifiedData.phase}
          allReasoning={unifiedData.allReasoning}
          toolCalls={unifiedData.toolCalls}
        />
      )}
      {sequentialParts.map(({ part, idx }) => renderPart(part, idx, idx === lastContentIdx))}
    </SearchContext.Provider>
  );
},
);

export default ContentParts;
