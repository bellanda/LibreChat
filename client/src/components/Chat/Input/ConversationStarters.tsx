import { Constants, EModelEndpoint } from 'librechat-data-provider';
import { useCallback, useMemo } from 'react';
import {
  useAgentsMapContext,
  useAssistantsMapContext,
  useChatContext,
  useChatFormContext,
} from '~/Providers';
import {
  useGetAssistantDocsQuery,
  useGetEndpointsQuery,
  useSuggestedStartersQuery,
} from '~/data-provider';
import { mainTextareaId } from '~/common';
import { useLocalize } from '~/hooks';
import { getEntity, getIconEndpoint } from '~/utils';

const GENERIC_STARTER_KEYS = [
  'com_ui_starter_generic_1',
  'com_ui_starter_generic_2',
  'com_ui_starter_generic_3',
  'com_ui_starter_generic_4',
] as const;

const GENERIC_EMOJIS = ['💡', '📋', '🌐', '✨'] as const;
const FALLBACK_EMOJIS = ['💬', '✏️', '🎯', '🚀'] as const;

const ConversationStarters = () => {
  const localize = useLocalize();
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: endpointsConfig } = useGetEndpointsQuery();

  const endpointType = useMemo(() => {
    let ep = conversation?.endpoint ?? '';
    if (ep === EModelEndpoint.azureOpenAI) {
      ep = EModelEndpoint.openAI;
    }
    return getIconEndpoint({
      endpointsConfig,
      iconURL: conversation?.iconURL,
      endpoint: ep,
    });
  }, [conversation?.endpoint, conversation?.iconURL, endpointsConfig]);

  const { data: documentsMap = new Map() } = useGetAssistantDocsQuery(endpointType, {
    select: (data) => new Map(data.map((dbA) => [dbA.assistant_id, dbA])),
  });

  const { entity, isAgent } = getEntity({
    endpoint: endpointType,
    agentsMap,
    assistantMap,
    agent_id: conversation?.agent_id,
    assistant_id: conversation?.assistant_id,
  });

  const fromDocs = useMemo(
    () => documentsMap.get(entity?.id ?? '')?.conversation_starters ?? [],
    [documentsMap, entity?.id],
  );
  const useGenericOrSuggested = !entity?.conversation_starters?.length && !isAgent && !fromDocs.length;

  const { data: suggestedStarters } = useSuggestedStartersQuery(useGenericOrSuggested);

  const conversation_starters = useMemo(() => {
    if (entity?.conversation_starters?.length) {
      return entity.conversation_starters;
    }
    if (isAgent) {
      return [];
    }
    if (fromDocs.length) {
      return fromDocs;
    }
    if (suggestedStarters?.length) {
      return suggestedStarters;
    }
    return GENERIC_STARTER_KEYS.map((key) => localize(key));
  }, [documentsMap, isAgent, entity, fromDocs, suggestedStarters, localize]);

  const methods = useChatFormContext();
  const isGeneric =
    !entity?.conversation_starters?.length &&
    !fromDocs.length &&
    !(suggestedStarters?.length);
  const emojis = isGeneric ? GENERIC_EMOJIS : FALLBACK_EMOJIS;

  /** Puts the suggestion into the chat input so the user can edit before sending. */
  const fillInputWithStarter = useCallback(
    (text: string) => {
      methods.setValue('text', text + ' ', { shouldValidate: true });
      const textarea = document.getElementById(mainTextareaId) as HTMLTextAreaElement | null;
      textarea?.focus();
    },
    [methods],
  );

  if (!conversation_starters.length) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 px-4">
      <p className="text-center text-sm text-text-secondary" role="status">
        {localize('com_ui_welcome_message')}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {conversation_starters
          .slice(0, Constants.MAX_CONVO_STARTERS)
          .map((text: string, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => fillInputWithStarter(text)}
              title={text}
              className="relative flex h-12 w-44 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border-medium px-3 text-center text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition-colors duration-300 ease-in-out fade-in hover:bg-surface-tertiary"
            >
              <span className="flex flex-shrink-0 items-center justify-center text-base">
                {emojis[index % emojis.length]}
              </span>
              <span className="min-w-0 flex-1 truncate text-center text-text-secondary">
                {text}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default ConversationStarters;
