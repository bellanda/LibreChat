import { useToastContext } from '@librechat/client';
import type * as t from 'librechat-data-provider';
import { EModelEndpoint, isAgentsEndpoint, isAssistantsEndpoint } from 'librechat-data-provider';
import debounce from 'lodash/debounce';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Endpoint, SelectedValues } from '~/common';
import { NotificationSeverity } from '~/common';
import { useGetEndpointsQuery, useListAgentsQuery } from '~/data-provider';
import {
  useAgentDefaultPermissionLevel,
  useEndpoints,
  useKeyDialog,
  useSelectorEffects,
} from '~/hooks';
import useSelectMention from '~/hooks/Input/useSelectMention';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useModelSelectorChatContext } from './ModelSelectorChatContext';
import { filterItems } from './utils';

type ModelSelectorContextType = {
  // State
  searchValue: string;
  selectedValues: SelectedValues;
  endpointSearchValues: Record<string, string>;
  searchResults: (t.TModelSpec | Endpoint)[] | null;
  // LibreChat
  modelSpecs: t.TModelSpec[];
  mappedEndpoints: Endpoint[];
  agentsMap: t.TAgentsMap | undefined;
  assistantsMap: t.TAssistantsMap | undefined;
  endpointsConfig: t.TEndpointsConfig;

  // Functions
  endpointRequiresUserKey: (endpoint: string) => boolean;
  setSelectedValues: React.Dispatch<React.SetStateAction<SelectedValues>>;
  setSearchValue: (value: string) => void;
  setEndpointSearchValue: (endpoint: string, value: string) => void;
  handleSelectSpec: (spec: t.TModelSpec) => void;
  handleSelectEndpoint: (endpoint: Endpoint) => void;
  handleSelectModel: (endpoint: Endpoint, model: string) => void;
} & ReturnType<typeof useKeyDialog>;

const ModelSelectorContext = createContext<ModelSelectorContextType | undefined>(undefined);

export function useModelSelectorContext() {
  const context = useContext(ModelSelectorContext);
  if (context === undefined) {
    throw new Error('useModelSelectorContext must be used within a ModelSelectorProvider');
  }
  return context;
}

interface ModelSelectorProviderProps {
  children: React.ReactNode;
  startupConfig: t.TStartupConfig | undefined;
}

export function ModelSelectorProvider({ children, startupConfig }: ModelSelectorProviderProps) {
  const agentsMap = useAgentsMapContext();
  const assistantsMap = useAssistantsMapContext();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { endpoint, model, spec, agent_id, assistant_id, conversation, newConversation } =
    useModelSelectorChatContext();
  const { getModelDescription } = useModelDescriptions();
  const { showToast } = useToastContext();
  const modelSpecs = useMemo(() => {
    const specs = startupConfig?.modelSpecs?.list ?? [];
    if (!agentsMap) {
      return specs;
    }

    /**
     * Filter modelSpecs to only include agents the user has access to.
     * Use agentsMap which already contains permission-filtered agents (consistent with other components).
     */
    return specs.filter((spec) => {
      if (spec.preset?.endpoint === EModelEndpoint.agents && spec.preset?.agent_id) {
        return spec.preset.agent_id in agentsMap;
      }
      /** Keep non-agent modelSpecs */
      return true;
    });
  }, [startupConfig, agentsMap]);
  const permissionLevel = useAgentDefaultPermissionLevel();
  const { data: agents = null } = useListAgentsQuery(
    { requiredPermission: permissionLevel },
    {
      select: (data) => data?.data,
    },
  );

  const { mappedEndpoints: rawMappedEndpoints, endpointRequiresUserKey } = useEndpoints({
    agents,
    assistantsMap,
    startupConfig,
    endpointsConfig,
  });

  const mappedEndpoints = useMemo(() => {
    if (!rawMappedEndpoints?.length) {
      return [];
    }

    const visibleEndpointGroups = new Set(
      (modelSpecs || [])
        .map((spec) => spec.group)
        .filter((group): group is string => typeof group === 'string' && group.length > 0),
    );

    return rawMappedEndpoints.filter(
      (endpoint) => endpoint.hasModels || visibleEndpointGroups.has(endpoint.value),
    );
  }, [rawMappedEndpoints, modelSpecs]);

  const { onSelectEndpoint, onSelectSpec } = useSelectMention({
    // presets,
    modelSpecs,
    conversation,
    assistantsMap,
    endpointsConfig,
    newConversation,
    returnHandlers: true,
  });

  // State
  const [selectedValues, setSelectedValues] = useState<SelectedValues>({
    endpoint: endpoint || '',
    model: model || '',
    modelSpec: spec || '',
  });
  useSelectorEffects({
    agentsMap,
    conversation: endpoint
      ? ({
          endpoint: endpoint ?? null,
          model: model ?? null,
          spec: spec ?? null,
          agent_id: agent_id ?? null,
          assistant_id: assistant_id ?? null,
        } as any)
      : null,
    assistantsMap,
    setSelectedValues,
  });

  const [searchValue, setSearchValueState] = useState('');
  const [endpointSearchValues, setEndpointSearchValues] = useState<Record<string, string>>({});

  const keyProps = useKeyDialog();

  /** Memoized search results */
  const searchResults = useMemo(() => {
    if (!searchValue) {
      return null;
    }
    const allItems = [...modelSpecs, ...mappedEndpoints];
    return filterItems(allItems, searchValue, agentsMap, assistantsMap || {});
  }, [searchValue, modelSpecs, mappedEndpoints, agentsMap, assistantsMap]);

  const setDebouncedSearchValue = useMemo(
    () =>
      debounce((value: string) => {
        setSearchValueState(value);
      }, 200),
    [],
  );
  const setEndpointSearchValue = (endpoint: string, value: string) => {
    setEndpointSearchValues((prev) => ({
      ...prev,
      [endpoint]: value,
    }));
  };

  const handleSelectSpec = (spec: t.TModelSpec) => {
    let model = spec.preset.model ?? null;

    // Check if the selected model supports web search
    const modelDescription = getModelDescription(model);
    if (modelDescription && modelDescription.supportsWebSearch === false) {
      showToast({
        message: `O modelo "${modelDescription.name || model}" não suporta busca na web. O recurso de busca na web não estará disponível para este modelo.`,
        severity: NotificationSeverity.WARNING,
        duration: 5000,
      });
    }

    onSelectSpec?.(spec);
    if (isAgentsEndpoint(spec.preset.endpoint)) {
      model = spec.preset.agent_id ?? '';
    } else if (isAssistantsEndpoint(spec.preset.endpoint)) {
      model = spec.preset.assistant_id ?? '';
    } else {
      // For non-agent endpoints, ensure agent_id is cleared
      if (spec.preset.agent_id !== undefined) {
        spec.preset.agent_id = undefined;
      }
    }
    setSelectedValues({
      endpoint: spec.preset.endpoint,
      model,
      modelSpec: spec.name,
    });
  };

  const handleSelectEndpoint = (endpoint: Endpoint) => {
    if (!endpoint.hasModels) {
      if (endpoint.value) {
        onSelectEndpoint?.(endpoint.value);
      }
      setSelectedValues({
        endpoint: endpoint.value,
        model: '',
        modelSpec: '',
      });
    }
  };

  const handleSelectModel = (endpoint: Endpoint, model: string) => {
    // Check if the selected model supports web search
    const modelDescription = getModelDescription(model);
    if (modelDescription && modelDescription.supportsWebSearch === false) {
      showToast({
        message: `O modelo "${modelDescription.name || model}" não suporta busca na web. O recurso de busca na web não estará disponível para este modelo.`,
        severity: NotificationSeverity.WARNING,
        duration: 5000,
      });
    }

    if (isAgentsEndpoint(endpoint.value)) {
      onSelectEndpoint?.(endpoint.value, {
        agent_id: model,
        model: agentsMap?.[model]?.model ?? '',
      });
    } else if (isAssistantsEndpoint(endpoint.value)) {
      onSelectEndpoint?.(endpoint.value, {
        assistant_id: model,
        model: assistantsMap?.[endpoint.value]?.[model]?.model ?? '',
      });
    } else if (endpoint.value) {
      // For non-agent endpoints, explicitly clear agent_id to prevent cache issues
      onSelectEndpoint?.(endpoint.value, {
        model,
        agent_id: undefined, // Explicitly clear agent_id for non-agent endpoints
      });
    }
    setSelectedValues({
      endpoint: endpoint.value,
      model,
      modelSpec: '',
    });
  };

  const value = {
    // State
    searchValue,
    searchResults,
    selectedValues,
    endpointSearchValues,
    // LibreChat
    agentsMap,
    modelSpecs,
    assistantsMap,
    mappedEndpoints,
    endpointsConfig,

    // Functions
    handleSelectSpec,
    handleSelectModel,
    setSelectedValues,
    handleSelectEndpoint,
    setEndpointSearchValue,
    endpointRequiresUserKey,
    setSearchValue: setDebouncedSearchValue,
    // Dialog
    ...keyProps,
  };

  return <ModelSelectorContext.Provider value={value}>{children}</ModelSelectorContext.Provider>;
}
