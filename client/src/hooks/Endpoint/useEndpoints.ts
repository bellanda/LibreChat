import type {
  Agent,
  Assistant,
  TAgentsMap,
  TAssistantsMap,
  TEndpointsConfig,
  TStartupConfig,
} from 'librechat-data-provider';
import {
  EModelEndpoint,
  PermissionTypes,
  Permissions,
  alternateName,
} from 'librechat-data-provider';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import React, { useCallback, useMemo } from 'react';
import type { Endpoint } from '~/common';
import { useGetEndpointsQuery } from '~/data-provider';
import { useHasAccess } from '~/hooks';
import { useChatContext } from '~/Providers';
import { getEndpointField, getIconKey } from '~/utils';
import { icons } from './Icons';

export const useEndpoints = ({
  agentsMap,
  assistantsMap,
  endpointsConfig,
  startupConfig,
}: {
  agentsMap?: TAgentsMap;
  assistantsMap?: TAssistantsMap;
  endpointsConfig: TEndpointsConfig;
  startupConfig: TStartupConfig | undefined;
}) => {
  const modelsQuery = useGetModelsQuery();
  const { conversation } = useChatContext();
  // Get the filtered endpoints config directly from backend (already filtered by group permissions)
  const { data: filteredEndpointsConfig = {} } = useGetEndpointsQuery();
  const { instanceProjectId } = startupConfig ?? {};
  const interfaceConfig = startupConfig?.interface ?? {};
  const includedEndpoints = useMemo(
    () => new Set(startupConfig?.modelSpecs?.addedEndpoints ?? []),
    [startupConfig?.modelSpecs?.addedEndpoints],
  );

  const { endpoint } = conversation ?? {};

  const hasAgentAccess = useHasAccess({
    permissionType: PermissionTypes.AGENTS,
    permission: Permissions.USE,
  });

  const agents = useMemo(
    () =>
      Object.values(agentsMap ?? {}).filter(
        (agent): agent is Agent & { name: string } =>
          agent !== undefined && 'id' in agent && 'name' in agent && agent.name !== null,
      ),
    [agentsMap],
  );

  const assistants: Assistant[] = useMemo(
    () => Object.values(assistantsMap?.[EModelEndpoint.assistants] ?? {}),
    [endpoint, assistantsMap],
  );

  const azureAssistants: Assistant[] = useMemo(
    () => Object.values(assistantsMap?.[EModelEndpoint.azureAssistants] ?? {}),
    [endpoint, assistantsMap],
  );

  // Convert the filtered endpoints config to an array of endpoint names
  const availableEndpoints = useMemo(() => {
    if (!interfaceConfig.modelSelect) {
      return [];
    }

    // Get endpoints that are available (not null/undefined) in the filtered config
    const endpoints = Object.keys(filteredEndpointsConfig).filter(
      (ep) => filteredEndpointsConfig[ep] != null,
    ) as EModelEndpoint[];

    // Sort by order if available
    endpoints.sort((a, b) => {
      const orderA = filteredEndpointsConfig[a]?.order ?? 999;
      const orderB = filteredEndpointsConfig[b]?.order ?? 999;
      return orderA - orderB;
    });

    return endpoints;
  }, [filteredEndpointsConfig, interfaceConfig.modelSelect]);

  const filteredEndpoints = useMemo(() => {
    const result: EModelEndpoint[] = [];
    for (let i = 0; i < availableEndpoints.length; i++) {
      if (availableEndpoints[i] === EModelEndpoint.agents && !hasAgentAccess) {
        continue;
      }
      if (includedEndpoints.size > 0 && !includedEndpoints.has(availableEndpoints[i])) {
        continue;
      }
      result.push(availableEndpoints[i]);
    }

    return result;
  }, [availableEndpoints, hasAgentAccess, includedEndpoints]);

  const endpointRequiresUserKey = useCallback(
    (ep: string) => {
      return !!getEndpointField(endpointsConfig, ep, 'userProvide');
    },
    [endpointsConfig],
  );

  const mappedEndpoints: Endpoint[] = useMemo(() => {
    return filteredEndpoints.map((ep) => {
      const endpointType = getEndpointField(endpointsConfig, ep, 'type');
      const iconKey = getIconKey({ endpoint: ep, endpointsConfig, endpointType });
      const Icon = icons[iconKey];
      const endpointIconURL = getEndpointField(endpointsConfig, ep, 'iconURL');
      const hasModels =
        (ep === EModelEndpoint.agents && agents?.length > 0) ||
        (ep === EModelEndpoint.assistants && assistants?.length > 0) ||
        (ep !== EModelEndpoint.assistants &&
          ep !== EModelEndpoint.agents &&
          (modelsQuery.data?.[ep]?.length ?? 0) > 0);

      // Base result object with formatted default icon
      const result: Endpoint = {
        value: ep,
        label: alternateName[ep] || ep,
        hasModels,
        icon: Icon
          ? React.createElement(Icon, {
              size: 20,
              className: 'text-text-primary shrink-0 icon-md',
              iconURL: endpointIconURL,
              endpoint: ep,
            })
          : null,
      };

      // Handle agents case
      if (ep === EModelEndpoint.agents && agents.length > 0) {
        result.models = agents.map((agent) => ({
          name: agent.id,
          isGlobal:
            (instanceProjectId != null && agent.projectIds?.includes(instanceProjectId)) ?? false,
        }));
        result.agentNames = agents.reduce((acc, agent) => {
          acc[agent.id] = agent.name || '';
          return acc;
        }, {});
        result.modelIcons = agents.reduce((acc, agent) => {
          acc[agent.id] = agent?.avatar?.filepath;
          return acc;
        }, {});
      }

      // Handle assistants case
      else if (ep === EModelEndpoint.assistants && assistants.length > 0) {
        result.models = assistants.map((assistant: { id: string }) => ({
          name: assistant.id,
          isGlobal: false,
        }));
        result.assistantNames = assistants.reduce(
          (acc: Record<string, string>, assistant: Assistant) => {
            acc[assistant.id] = assistant.name || '';
            return acc;
          },
          {},
        );
        result.modelIcons = assistants.reduce(
          (acc: Record<string, string | undefined>, assistant: Assistant) => {
            acc[assistant.id] = assistant.metadata?.avatar;
            return acc;
          },
          {},
        );
      }

      // Handle Azure assistants case
      else if (ep === EModelEndpoint.azureAssistants && azureAssistants.length > 0) {
        result.models = azureAssistants.map((assistant: { id: string }) => ({
          name: assistant.id,
          isGlobal: false,
        }));
        result.assistantNames = azureAssistants.reduce(
          (acc: Record<string, string>, assistant: Assistant) => {
            acc[assistant.id] = assistant.name || '';
            return acc;
          },
          {},
        );
        result.modelIcons = azureAssistants.reduce(
          (acc: Record<string, string | undefined>, assistant: Assistant) => {
            acc[assistant.id] = assistant.metadata?.avatar;
            return acc;
          },
          {},
        );
      }

      // For other endpoints with models from the modelsQuery
      else if (
        ep !== EModelEndpoint.agents &&
        ep !== EModelEndpoint.assistants &&
        ep !== EModelEndpoint.azureAssistants &&
        (modelsQuery.data?.[ep]?.length ?? 0) > 0
      ) {
        result.models = modelsQuery.data?.[ep]?.map((model) => ({
          name: model,
          isGlobal: false,
        }));
      }

      return result;
    });
  }, [filteredEndpoints, endpointsConfig, modelsQuery.data, agents, assistants, azureAssistants]);

  return {
    mappedEndpoints,
    endpointRequiresUserKey,
  };
};

export default useEndpoints;
