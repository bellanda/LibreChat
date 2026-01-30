import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useToastContext } from '@librechat/client';
import { useQueryClient } from '@tanstack/react-query';
import { Constants, QueryKeys, MCPOptions, ResourceType } from 'librechat-data-provider';
import {
  useCancelMCPOAuthMutation,
  useUpdateUserPluginsMutation,
  useReinitializeMCPServerMutation,
  useGetAllEffectivePermissionsQuery,
} from 'librechat-data-provider/react-query';
import type { TUpdateUserPlugins, TPlugin, MCPServersResponse } from 'librechat-data-provider';
import type { ConfigFieldDetail } from '~/common';
import { useLocalize, useMCPSelect, useMCPConnectionStatus } from '~/hooks';
import { useGetStartupConfig, useMCPServersQuery } from '~/data-provider';
import { mcpServerInitStatesAtom, getServerInitState } from '~/store/mcp';
import type { MCPServerInitState } from '~/store/mcp';

export interface MCPServerDefinition {
  serverName: string;
  config: MCPOptions;
  dbId?: string;
  effectivePermissions: number;
  consumeOnly?: boolean;
}

type PollIntervals = Record<string, NodeJS.Timeout | null>;

export function useMCPServerManager({ conversationId }: { conversationId?: string | null } = {}) {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { data: startupConfig } = useGetStartupConfig();

  const { data: loadedServers, isLoading } = useMCPServersQuery();
  const { data: permissionsMap } = useGetAllEffectivePermissionsQuery(ResourceType.MCPSERVER);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedToolForConfig, setSelectedToolForConfig] = useState<TPlugin | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const availableMCPServers: MCPServerDefinition[] = useMemo<MCPServerDefinition[]>(() => {
    const definitions: MCPServerDefinition[] = [];
    if (loadedServers) {
      for (const [serverName, metadata] of Object.entries(loadedServers)) {
        const { dbId, consumeOnly, ...config } = metadata;

        const effectivePermissions = dbId && permissionsMap?.[dbId] ? permissionsMap[dbId] : 1;

        definitions.push({
          serverName,
          dbId,
          effectivePermissions,
          consumeOnly,
          config,
        });
      }
    }
    return definitions;
  }, [loadedServers, permissionsMap]);

  const selectableServers = useMemo(
    () => availableMCPServers.filter((s) => s.config.chatMenu !== false && !s.consumeOnly),
    [availableMCPServers],
  );

  const { mcpValues, setMCPValues, isPinned, setIsPinned } = useMCPSelect({
    conversationId,
    servers: selectableServers,
  });
  const mcpValuesRef = useRef(mcpValues);

  useEffect(() => {
    mcpValuesRef.current = mcpValues;
  }, [mcpValues]);

  const checkEffectivePermission = useCallback(
    (effectivePermissions: number, permissionBit: number): boolean => {
      return (effectivePermissions & permissionBit) !== 0;
    },
    [],
  );

  const reinitializeMutation = useReinitializeMCPServerMutation();
  const cancelOAuthMutation = useCancelMCPOAuthMutation();

  const updateUserPluginsMutation = useUpdateUserPluginsMutation({
    onSuccess: async (_data, variables) => {
      const isRevoke = variables.action === 'uninstall';
      const message = isRevoke
        ? localize('com_nav_mcp_access_revoked')
        : localize('com_nav_mcp_vars_updated');
      showToast({ message, status: 'success' });

      if (isRevoke && variables.pluginKey?.startsWith(Constants.mcp_prefix)) {
        const serverName = variables.pluginKey.replace(Constants.mcp_prefix, '');
        const currentValues = mcpValuesRef.current ?? [];
        const filteredValues = currentValues.filter((name) => name !== serverName);
        setMCPValues(filteredValues);
      }

      await Promise.all([
        queryClient.invalidateQueries([QueryKeys.mcpServers]),
        queryClient.invalidateQueries([QueryKeys.mcpTools]),
        queryClient.invalidateQueries([QueryKeys.mcpAuthValues]),
        queryClient.invalidateQueries([QueryKeys.mcpConnectionStatus]),
      ]);
    },
    onError: (error: unknown) => {
      console.error('Error updating MCP auth:', error);
      showToast({
        message: localize('com_nav_mcp_vars_update_error'),
        status: 'error',
      });
    },
  });

  const [serverInitStates, setServerInitStates] = useAtom(mcpServerInitStatesAtom);
  const pollIntervalsRef = useRef<PollIntervals>({});

  const { connectionStatus } = useMCPConnectionStatus({
    enabled: !isLoading && availableMCPServers.length > 0,
  });

  const updateServerInitState = useCallback(
    (serverName: string, updates: Partial<MCPServerInitState>) => {
      setServerInitStates((prev) => {
        const currentState = getServerInitState(prev, serverName);
        return {
          ...prev,
          [serverName]: { ...currentState, ...updates },
        };
      });
    },
    [setServerInitStates],
  );

  const cleanupServerState = useCallback(
    (serverName: string) => {
      const pollInterval = pollIntervalsRef.current[serverName];
      if (pollInterval) {
        clearTimeout(pollInterval);
        pollIntervalsRef.current[serverName] = null;
      }
      updateServerInitState(serverName, {
        isInitializing: false,
        oauthUrl: null,
        oauthStartTime: null,
        isCancellable: false,
      });
    },
    [updateServerInitState],
  );

  const startServerPolling = useCallback(
    (serverName: string) => {
      if (pollIntervalsRef.current[serverName]) {
        console.debug(`[MCP Manager] Polling already active for ${serverName}, skipping duplicate`);
        return;
      }

      let pollAttempts = 0;
      let timeoutId: NodeJS.Timeout | null = null;

      const getPollInterval = (attempt: number): number => {
        if (attempt < 12) return 5000;
        if (attempt < 22) return 6000;
        return 7500;
      };

      const maxAttempts = 30;
      const OAUTH_TIMEOUT_MS = 180000;

      const pollOnce = async () => {
        try {
          pollAttempts++;
          const state = getServerInitState(serverInitStates, serverName);

          const elapsedTime = state?.oauthStartTime
            ? Date.now() - state.oauthStartTime
            : pollAttempts * 5000;

          if (pollAttempts > maxAttempts || elapsedTime > OAUTH_TIMEOUT_MS) {
            console.warn(
              `[MCP Manager] OAuth timeout for ${serverName} after ${(elapsedTime / 1000).toFixed(
                0,
              )}s (attempt ${pollAttempts})`,
            );
            showToast({
              message: localize('com_ui_mcp_oauth_timeout', { 0: serverName }),
              status: 'error',
            });
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            cleanupServerState(serverName);
            return;
          }

          await queryClient.refetchQueries([QueryKeys.mcpConnectionStatus]);

          const freshConnectionData = queryClient.getQueryData([
            QueryKeys.mcpConnectionStatus,
          ]) as any;
          const freshConnectionStatus = freshConnectionData?.connectionStatus || {};

          const serverStatus = freshConnectionStatus[serverName];

          if (serverStatus?.connectionState === 'connected') {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }

            showToast({
              message: localize('com_ui_mcp_authenticated_success', { 0: serverName }),
              status: 'success',
            });

            const currentValues = mcpValuesRef.current ?? [];
            if (!currentValues.includes(serverName)) {
              setMCPValues([...currentValues, serverName]);
            }

            await queryClient.invalidateQueries([QueryKeys.mcpTools]);

            setTimeout(() => {
              cleanupServerState(serverName);
            }, 1000);
            return;
          }

          if (state?.oauthStartTime && Date.now() - state.oauthStartTime > OAUTH_TIMEOUT_MS) {
            showToast({
              message: localize('com_ui_mcp_oauth_timeout', { 0: serverName }),
              status: 'error',
            });
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            cleanupServerState(serverName);
            return;
          }

          if (serverStatus?.connectionState === 'error') {
            showToast({
              message: localize('com_ui_mcp_init_failed'),
              status: 'error',
            });
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            cleanupServerState(serverName);
            return;
          }

          const nextInterval = getPollInterval(pollAttempts);

          if (pollAttempts % 5 === 0 || pollAttempts <= 2) {
            console.debug(
              `[MCP Manager] Polling ${serverName} attempt ${pollAttempts}/${maxAttempts}, next in ${nextInterval / 1000
              }s`,
            );
          }

          timeoutId = setTimeout(pollOnce, nextInterval);
          pollIntervalsRef.current[serverName] = timeoutId;
        } catch (error) {
          console.error(`[MCP Manager] Error polling server ${serverName}:`, error);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          cleanupServerState(serverName);
          return;
        }
      };

      timeoutId = setTimeout(pollOnce, getPollInterval(0));
      pollIntervalsRef.current[serverName] = timeoutId;
    },
    [queryClient, serverInitStates, showToast, localize, setMCPValues, cleanupServerState],
  );

  const initializeServer = useCallback(
    async (serverName: string, autoOpenOAuth: boolean = true) => {
      updateServerInitState(serverName, { isInitializing: true });
      try {
        const response = await reinitializeMutation.mutateAsync(serverName);
        if (!response.success) {
          showToast({
            message: localize('com_ui_mcp_init_failed', { 0: serverName }),
            status: 'error',
          });
          cleanupServerState(serverName);
          return response;
        }

        if (response.oauthRequired && response.oauthUrl) {
          updateServerInitState(serverName, {
            oauthUrl: response.oauthUrl,
            oauthStartTime: Date.now(),
            isCancellable: true,
            isInitializing: true,
          });

          if (autoOpenOAuth) {
            window.open(response.oauthUrl, '_blank', 'noopener,noreferrer');
          }

          startServerPolling(serverName);
        } else {
          await Promise.all([
            queryClient.invalidateQueries([QueryKeys.mcpServers]),
            queryClient.invalidateQueries([QueryKeys.mcpTools]),
            queryClient.invalidateQueries([QueryKeys.mcpAuthValues]),
            queryClient.invalidateQueries([QueryKeys.mcpConnectionStatus]),
          ]);

          showToast({
            message: localize('com_ui_mcp_initialized_success', { 0: serverName }),
            status: 'success',
          });

          const currentValues = mcpValues ?? [];
          if (!currentValues.includes(serverName)) {
            setMCPValues([...currentValues, serverName]);
          }

          cleanupServerState(serverName);
        }
        return response;
      } catch (error) {
        console.error(`[MCP Manager] Failed to initialize ${serverName}:`, error);
        showToast({
          message: localize('com_ui_mcp_init_failed', { 0: serverName }),
          status: 'error',
        });
        cleanupServerState(serverName);
      }
    },
    [
      updateServerInitState,
      reinitializeMutation,
      startServerPolling,
      queryClient,
      showToast,
      localize,
      mcpValues,
      cleanupServerState,
      setMCPValues,
    ],
  );

  const cancelOAuthFlow = useCallback(
    (serverName: string) => {
      cancelOAuthMutation.mutate(serverName, {
        onSuccess: () => {
          cleanupServerState(serverName);
          Promise.all([
            queryClient.invalidateQueries([QueryKeys.mcpServers]),
            queryClient.invalidateQueries([QueryKeys.mcpTools]),
            queryClient.invalidateQueries([QueryKeys.mcpAuthValues]),
            queryClient.invalidateQueries([QueryKeys.mcpConnectionStatus]),
          ]);

          showToast({
            message: localize('com_ui_mcp_oauth_cancelled', { 0: serverName }),
            status: 'warning',
          });
        },
        onError: (error) => {
          console.error(`[MCP Manager] Failed to cancel OAuth for ${serverName}:`, error);
          showToast({
            message: localize('com_ui_mcp_init_failed', { 0: serverName }),
            status: 'error',
          });
        },
      });
    },
    [queryClient, cleanupServerState, showToast, localize, cancelOAuthMutation],
  );

  const isInitializing = useCallback(
    (serverName: string) => {
      return getServerInitState(serverInitStates, serverName).isInitializing;
    },
    [serverInitStates],
  );

  const isCancellable = useCallback(
    (serverName: string) => {
      return getServerInitState(serverInitStates, serverName).isCancellable;
    },
    [serverInitStates],
  );

  const getOAuthUrl = useCallback(
    (serverName: string) => {
      return getServerInitState(serverInitStates, serverName).oauthUrl;
    },
    [serverInitStates],
  );

  const placeholderText = useMemo(
    () => startupConfig?.interface?.mcpServers?.placeholder || localize('com_ui_mcp_servers'),
    [startupConfig?.interface?.mcpServers?.placeholder, localize],
  );

  const batchToggleServers = useCallback(
    (serverNames: string[]) => {
      const connectedServers: string[] = [];
      const disconnectedServers: string[] = [];

      serverNames.forEach((serverName) => {
        if (isInitializing(serverName)) {
          return;
        }

        const serverStatus = connectionStatus?.[serverName];
        if (serverStatus?.connectionState === 'connected') {
          connectedServers.push(serverName);
        } else {
          disconnectedServers.push(serverName);
        }
      });

      setMCPValues(connectedServers);

      disconnectedServers.forEach((serverName) => {
        initializeServer(serverName);
      });
    },
    [connectionStatus, setMCPValues, initializeServer, isInitializing],
  );

  const toggleServerSelection = useCallback(
    (serverName: string) => {
      if (isInitializing(serverName)) {
        return;
      }

      const currentValues = mcpValues ?? [];
      const isCurrentlySelected = currentValues.includes(serverName);

      if (isCurrentlySelected) {
        const filteredValues = currentValues.filter((name) => name !== serverName);
        setMCPValues(filteredValues);
      } else {
        const serverStatus = connectionStatus?.[serverName];
        if (serverStatus?.connectionState === 'connected') {
          setMCPValues([...currentValues, serverName]);
        } else {
          initializeServer(serverName);
        }
      }
    },
    [mcpValues, setMCPValues, connectionStatus, initializeServer, isInitializing],
  );

  const handleConfigSave = useCallback(
    (targetName: string, authData: Record<string, string>) => {
      if (selectedToolForConfig && selectedToolForConfig.name === targetName) {
        const payload: TUpdateUserPlugins = {
          pluginKey: `${Constants.mcp_prefix}${targetName}`,
          action: 'install',
          auth: authData,
        };
        updateUserPluginsMutation.mutate(payload);
      }
    },
    [selectedToolForConfig, updateUserPluginsMutation],
  );

  const handleConfigRevoke = useCallback(
    (targetName: string) => {
      if (selectedToolForConfig && selectedToolForConfig.name === targetName) {
        const payload: TUpdateUserPlugins = {
          pluginKey: `${Constants.mcp_prefix}${targetName}`,
          action: 'uninstall',
          auth: {},
        };
        updateUserPluginsMutation.mutate(payload);
      }
    },
    [selectedToolForConfig, updateUserPluginsMutation],
  );

  const revokeOAuthForServer = useCallback(
    (serverName: string) => {
      const payload: TUpdateUserPlugins = {
        pluginKey: `${Constants.mcp_prefix}${serverName}`,
        action: 'uninstall',
        auth: {},
      };
      updateUserPluginsMutation.mutate(payload);
    },
    [updateUserPluginsMutation],
  );

  const handleSave = useCallback(
    (authData: Record<string, string>) => {
      if (selectedToolForConfig) {
        handleConfigSave(selectedToolForConfig.name, authData);
      }
    },
    [selectedToolForConfig, handleConfigSave],
  );

  const handleRevoke = useCallback(() => {
    if (selectedToolForConfig) {
      handleConfigRevoke(selectedToolForConfig.name);
    }
  }, [selectedToolForConfig, handleConfigRevoke]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsConfigModalOpen(open);

    if (!open && previousFocusRef.current) {
      setTimeout(() => {
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
        previousFocusRef.current = null;
      }, 0);
    }
  }, []);

  const getServerStatusIconProps = useCallback(
    (serverName: string) => {
      const mcpData = queryClient.getQueryData<MCPServersResponse | undefined>([
        QueryKeys.mcpTools,
      ]);
      const serverData = mcpData?.servers?.[serverName];
      const serverStatus = connectionStatus?.[serverName];
      const serverConfig = loadedServers?.[serverName];

      const handleConfigClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        previousFocusRef.current = document.activeElement as HTMLElement;

        const configTool: TPlugin = {
          name: serverName,
          pluginKey: `${Constants.mcp_prefix}${serverName}`,
          authConfig:
            serverData?.authConfig ||
            (serverConfig?.customUserVars
              ? Object.entries(serverConfig.customUserVars).map(([key, config]) => ({
                authField: key,
                label: config.title,
                description: config.description,
              }))
              : []),
          authenticated: serverData?.authenticated ?? false,
        };
        setSelectedToolForConfig(configTool);
        setIsConfigModalOpen(true);
      };

      const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        cancelOAuthFlow(serverName);
      };

      const hasCustomUserVars =
        serverConfig?.customUserVars && Object.keys(serverConfig.customUserVars).length > 0;

      return {
        serverName,
        serverStatus,
        tool: serverData
          ? ({
            name: serverName,
            pluginKey: `${Constants.mcp_prefix}${serverName}`,
            icon: serverData.icon,
            authenticated: serverData.authenticated,
          } as TPlugin)
          : undefined,
        onConfigClick: handleConfigClick,
        isInitializing: isInitializing(serverName),
        canCancel: isCancellable(serverName),
        onCancel: handleCancelClick,
        hasCustomUserVars,
      };
    },
    [queryClient, isCancellable, isInitializing, cancelOAuthFlow, connectionStatus, loadedServers],
  );

  const getConfigDialogProps = useCallback(() => {
    if (!selectedToolForConfig) return null;

    const fieldsSchema: Record<string, ConfigFieldDetail> = {};
    if (selectedToolForConfig?.authConfig) {
      selectedToolForConfig.authConfig.forEach((field) => {
        fieldsSchema[field.authField] = {
          title: field.label || field.authField,
          description: field.description,
        };
      });
    }

    const initialValues: Record<string, string> = {};
    if (selectedToolForConfig?.authConfig) {
      selectedToolForConfig.authConfig.forEach((field) => {
        initialValues[field.authField] = '';
      });
    }

    return {
      serverName: selectedToolForConfig.name,
      serverStatus: connectionStatus?.[selectedToolForConfig.name],
      isOpen: isConfigModalOpen,
      onOpenChange: handleDialogOpenChange,
      fieldsSchema,
      initialValues,
      onSave: handleSave,
      onRevoke: handleRevoke,
      isSubmitting: updateUserPluginsMutation.isLoading,
    };
  }, [
    selectedToolForConfig,
    connectionStatus,
    isConfigModalOpen,
    handleDialogOpenChange,
    handleSave,
    handleRevoke,
    updateUserPluginsMutation.isLoading,
  ]);

  return {
    availableMCPServers,
    selectableServers,
    availableMCPServersMap: loadedServers,
    isLoading,
    connectionStatus,
    initializeServer,
    cancelOAuthFlow,
    isInitializing,
    isCancellable,
    getOAuthUrl,
    mcpValues,
    setMCPValues,

    isPinned,
    setIsPinned,
    placeholderText,
    batchToggleServers,
    toggleServerSelection,
    localize,

    isConfigModalOpen,
    handleDialogOpenChange,
    selectedToolForConfig,
    setSelectedToolForConfig,
    handleSave,
    handleRevoke,
    revokeOAuthForServer,
    getServerStatusIconProps,
    getConfigDialogProps,
    checkEffectivePermission,
  };
}
