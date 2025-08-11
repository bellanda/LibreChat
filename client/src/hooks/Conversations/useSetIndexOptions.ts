import {
  EModelEndpoint,
  TConversation,
  tConvoUpdateSchema,
  TPlugin,
  TPreset,
} from 'librechat-data-provider';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useChatContext } from '~/Providers';
import type { TSetExample, TSetOption, TSetOptionsPayload } from '~/common';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import store from '~/store';
import usePresetIndexOptions from './usePresetIndexOptions';

type TUseSetOptions = (preset?: TPreset | boolean | null) => TSetOptionsPayload;

const useSetIndexOptions: TUseSetOptions = (preset = false) => {
  const setShowPluginStoreDialog = useSetRecoilState(store.showPluginStoreDialog);
  const availableTools = useRecoilValue(store.availableTools);
  const { conversation, setConversation } = useChatContext();
  const { getModelDescription } = useModelDescriptions();

  const result = usePresetIndexOptions(preset);

  if (result && typeof result !== 'boolean') {
    return result;
  }

  const setOption: TSetOption = (param) => (newValue) => {
    if (param === 'model' && typeof newValue === 'string') {
      const modelDescription = getModelDescription(newValue);
      if (modelDescription && modelDescription.supportsWebSearch === false) {
        // Toast functionality removed - model description check still works
        console.warn(
          `O modelo "${modelDescription.name || newValue}" não suporta busca na web. O recurso de busca na web não estará disponível para este modelo.`,
        );
      }
    }

    const update = {};
    update[param] = newValue;

    if (param === 'presetOverride') {
      const currentOverride = conversation?.presetOverride || {};
      update['presetOverride'] = {
        ...currentOverride,
        ...(newValue as unknown as Partial<TPreset>),
      };
    }

    // Auto-enable Responses API when web search is enabled (only for OpenAI/Azure/Custom endpoints)
    if (param === 'web_search' && newValue === true) {
      const currentEndpoint = conversation?.endpoint;
      const isOpenAICompatible =
        currentEndpoint === EModelEndpoint.openAI ||
        currentEndpoint === EModelEndpoint.azureOpenAI ||
        currentEndpoint === EModelEndpoint.custom;

      if (isOpenAICompatible) {
        const currentUseResponsesApi = conversation?.useResponsesApi ?? false;
        if (!currentUseResponsesApi) {
          update['useResponsesApi'] = true;
        }
      }
    }

    setConversation(
      (prevState) =>
        tConvoUpdateSchema.parse({
          ...prevState,
          ...update,
        }) as TConversation,
    );
  };

  const setExample: TSetExample = (i, type, newValue = null) => {
    const update = {};
    const current = conversation?.examples?.slice() || [];
    const currentExample = { ...current[i] };
    currentExample[type] = { content: newValue };
    current[i] = currentExample;
    update['examples'] = current;
    setConversation(
      (prevState) =>
        tConvoUpdateSchema.parse({
          ...prevState,
          ...update,
        }) as TConversation,
    );
  };

  const addExample: () => void = () => {
    const update = {};
    const current = conversation?.examples?.slice() || [];
    current.push({ input: { content: '' }, output: { content: '' } });
    update['examples'] = current;
    setConversation(
      (prevState) =>
        tConvoUpdateSchema.parse({
          ...prevState,
          ...update,
        }) as TConversation,
    );
  };

  const removeExample: () => void = () => {
    const update = {};
    const current = conversation?.examples?.slice() || [];
    if (current.length <= 1) {
      update['examples'] = [{ input: { content: '' }, output: { content: '' } }];
      setConversation(
        (prevState) =>
          tConvoUpdateSchema.parse({
            ...prevState,
            ...update,
          }) as TConversation,
      );
      return;
    }
    current.pop();
    update['examples'] = current;
    setConversation(
      (prevState) =>
        tConvoUpdateSchema.parse({
          ...prevState,
          ...update,
        }) as TConversation,
    );
  };

  function checkPluginSelection(value: string) {
    if (!conversation?.tools) {
      return false;
    }
    return conversation.tools.find((el) => {
      if (typeof el === 'string') {
        return el === value;
      }
      return el.pluginKey === value;
    })
      ? true
      : false;
  }

  const setAgentOption: TSetOption = (param) => (newValue) => {
    const editableConvo = JSON.stringify(conversation);
    const convo = JSON.parse(editableConvo);
    const { agentOptions } = convo;
    agentOptions[param] = newValue;

    setConversation(
      (prevState) =>
        tConvoUpdateSchema.parse({
          ...prevState,
          agentOptions,
        }) as TConversation,
    );
  };

  const setTools: (newValue: string, remove?: boolean) => void = (newValue, remove) => {
    if (newValue === 'pluginStore') {
      setShowPluginStoreDialog(true);
      return;
    }

    const update = {};
    const current =
      conversation?.tools
        ?.map((tool: string | TPlugin) => {
          if (typeof tool === 'string') {
            return availableTools[tool];
          }
          return tool;
        })
        .filter((el) => !!el) || [];
    const isSelected = checkPluginSelection(newValue);
    const tool = availableTools[newValue];
    if (isSelected || remove) {
      update['tools'] = current.filter((el) => el.pluginKey !== newValue);
    } else {
      update['tools'] = [...current, tool];
    }

    setConversation(
      (prevState) =>
        tConvoUpdateSchema.parse({
          ...prevState,
          ...update,
        }) as TConversation,
    );
  };

  return {
    setTools,
    setOption,
    setExample,
    addExample,
    removeExample,
    setAgentOption,
    checkPluginSelection,
  };
};

export default useSetIndexOptions;
