import { useAtom } from 'jotai';
import { useToastContext } from '@librechat/client';
import { useQueryClient } from '@tanstack/react-query';
import type {
  MCPConnectionStatusResponse,
  MCPServersResponse,
  TPlugin,
  TUpdateUserPlugins,
} from 'librechat-data-provider';
import { Constants, QueryKeys } from 'librechat-data-provider';
import {
  useCancelMCPOAuthMutation,
  useReinitializeMCPServerMutation,
  useUpdateUserPluginsMutation,
} from 'librechat-data-provider/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConfigFieldDetail } from '~/common';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize, useMCPConnectionStatus, useMCPSelect } from '~/hooks';
import {
  defaultServerInitState,
  getServerInitState,
  mcpServerInitStatesAtom,
} from '~/store/mcp';

type PollIntervals = Record<string, NodeJS.Timeout | null>;

const CONNECTION_POLL_MS = 500;
const CONNECTION_POLL_MAX_ATTEMPTS = 24;

export function useMCPServerManager({ conversationId }: { conversationId?: string | null } = {}) {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { mcpValues, setMCPValues, isPinned, setIsPinned } = useMCPSelect({ conversationId });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedToolForConfig, setSelectedToolForConfig] = useState<TPlugin | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mcpValuesRef = useRef(mcpValues);
  const pendingInitialization = useRef(new Set<string>());
  const initializingServersRef = useRef(new Set<string>());
  const pollIntervalsRef = useRef<PollIntervals>({});
  const lastInitAttemptRef = useRef<Record<string, number>>({});
  const INIT_COOLDOWN_MS = 2500;

  const [serverInitStates, setServerInitStates] = useAtom(mcpServerInitStatesAtom);

  useEffect(() => {
    mcpValuesRef.current = mcpValues;
  }, [mcpValues]);

  const configuredServers = useMemo(() => {
    if (!startupConfig?.mcpServers) return [];
    return Object.entries(startupConfig.mcpServers)
      .filter(([, config]) => config.chatMenu !== false)
      .map(([serverName]) => serverName);
  }, [startupConfig?.mcpServers]);

  const reinitializeMutation = useReinitializeMCPServerMutation();
  const cancelOAuthMutation = useCancelMCPOAuthMutation();

  const updateUserPluginsMutation = useUpdateUserPluginsMutation({
    onSuccess: async () => {
      showToast({ message: localize('com_nav_mcp_vars_updated'), status: 'success' });

      await Promise.all([
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

  const { connectionStatus } = useMCPConnectionStatus({
    enabled: !!startupConfig?.mcpServers && Object.keys(startupConfig.mcpServers).length > 0,
  });

  const serverNeedsConnection = useCallback(
    (serverName: string) => {
      if (initializingServersRef.current.has(serverName)) return false;
      const state = connectionStatus?.[serverName]?.connectionState;
      if (state === 'connected' || state === 'connecting') return false;
      return !state || state === 'disconnected' || state === 'error';
    },
    [connectionStatus],
  );

  const updateServerInitState = useCallback(
    (serverName: string, updates: Partial<typeof defaultServerInitState>) => {
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
      initializingServersRef.current.delete(serverName);
      pendingInitialization.current.delete(serverName);

      const pollInterval = pollIntervalsRef.current[serverName];
      if (pollInterval) {
        clearTimeout(pollInterval);
        pollIntervalsRef.current[serverName] = null;
      }

      updateServerInitState(serverName, defaultServerInitState);
    },
    [updateServerInitState],
  );

  const waitForConnectionAfterInit = useCallback(
    async (serverName: string): Promise<boolean> => {
      for (let attempt = 0; attempt < CONNECTION_POLL_MAX_ATTEMPTS; attempt++) {
        await queryClient.refetchQueries([QueryKeys.mcpConnectionStatus]);
        const data = queryClient.getQueryData<MCPConnectionStatusResponse>([
          QueryKeys.mcpConnectionStatus,
        ]);
        const state = data?.connectionStatus?.[serverName]?.connectionState;
        if (state === 'connected') return true;
        if (state === 'error') return false;
        await new Promise((resolve) => setTimeout(resolve, CONNECTION_POLL_MS));
      }
      return false;
    },
    [queryClient],
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

      const OAUTH_TIMEOUT_MS = 180000;
      let maxAttempts = Math.ceil(OAUTH_TIMEOUT_MS / 5000) + 5;

      const pollOnce = async () => {
        try {
          pollAttempts++;
          const state = getServerInitState(serverInitStates, serverName);

          const elapsedTime = state.oauthStartTime
            ? Date.now() - state.oauthStartTime
            : pollAttempts * 5000;

          if (pollAttempts > maxAttempts || elapsedTime > OAUTH_TIMEOUT_MS) {
            showToast({
              message: localize('com_ui_mcp_oauth_timeout', { 0: serverName }),
              status: 'error',
            });
            if (timeoutId) clearTimeout(timeoutId);
            cleanupServerState(serverName);
            return;
          }

          await queryClient.refetchQueries([QueryKeys.mcpConnectionStatus]);

          const freshConnectionData = queryClient.getQueryData<MCPConnectionStatusResponse>([
            QueryKeys.mcpConnectionStatus,
          ]);
          const serverStatus = freshConnectionData?.connectionStatus?.[serverName];

          if (serverStatus?.connectionState === 'connected') {
            if (timeoutId) clearTimeout(timeoutId);

            showToast({
              message: localize('com_ui_mcp_authenticated_success', { 0: serverName }),
              status: 'success',
            });

            const currentValues = mcpValuesRef.current ?? [];
            if (!currentValues.includes(serverName)) {
              setMCPValues([...currentValues, serverName]);
            }

            await queryClient.invalidateQueries([QueryKeys.mcpTools]);

            setTimeout(() => cleanupServerState(serverName), 1000);
            return;
          }

          if (state.oauthStartTime && Date.now() - state.oauthStartTime > OAUTH_TIMEOUT_MS) {
            showToast({
              message: localize('com_ui_mcp_oauth_timeout', { 0: serverName }),
              status: 'error',
            });
            if (timeoutId) clearTimeout(timeoutId);
            cleanupServerState(serverName);
            return;
          }

          if (serverStatus?.connectionState === 'error') {
            showToast({
              message: localize('com_ui_mcp_init_failed'),
              status: 'error',
            });
            if (timeoutId) clearTimeout(timeoutId);
            cleanupServerState(serverName);
            return;
          }

          const nextInterval = getPollInterval(pollAttempts);
          timeoutId = setTimeout(pollOnce, nextInterval);
          pollIntervalsRef.current[serverName] = timeoutId;
        } catch (error) {
          console.error(`[MCP Manager] Error polling server ${serverName}:`, error);
          if (timeoutId) clearTimeout(timeoutId);
          cleanupServerState(serverName);
        }
      };

      timeoutId = setTimeout(pollOnce, getPollInterval(0));
      pollIntervalsRef.current[serverName] = timeoutId;
    },
    [
      queryClient,
      serverInitStates,
      showToast,
      localize,
      setMCPValues,
      cleanupServerState,
    ],
  );

  const initializeServer = useCallback(
    async (serverName: string, autoOpenOAuth: boolean = true) => {
      if (initializingServersRef.current.has(serverName)) {
        return;
      }

      const lastAttempt = lastInitAttemptRef.current[serverName];
      if (lastAttempt && Date.now() - lastAttempt < INIT_COOLDOWN_MS) {
        return;
      }

      lastInitAttemptRef.current[serverName] = Date.now();
      initializingServersRef.current.add(serverName);
      pendingInitialization.current.add(serverName);
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
          const connected = await waitForConnectionAfterInit(serverName);

          await queryClient.invalidateQueries([QueryKeys.mcpConnectionStatus]);
          await queryClient.invalidateQueries([QueryKeys.mcpTools]);

          if (connected) {
            showToast({
              message: localize('com_ui_mcp_initialized_success', { 0: serverName }),
              status: 'success',
            });
          } else {
            showToast({
              message: localize('com_ui_mcp_init_failed', { 0: serverName }),
              status: 'error',
            });
          }

          const currentValues = mcpValuesRef.current ?? [];
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
      waitForConnectionAfterInit,
      queryClient,
      showToast,
      localize,
      cleanupServerState,
      setMCPValues,
    ],
  );

  const cancelOAuthFlow = useCallback(
    (serverName: string) => {
      pendingInitialization.current.delete(serverName);
      setMCPValues((mcpValuesRef.current ?? []).filter((n) => n !== serverName));
      cancelOAuthMutation.mutate(serverName, {
        onSuccess: () => {
          cleanupServerState(serverName);
          queryClient.invalidateQueries([QueryKeys.mcpConnectionStatus]);

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
    [queryClient, cleanupServerState, showToast, localize, cancelOAuthMutation, setMCPValues],
  );

  const isInitializing = useCallback(
    (serverName: string) => getServerInitState(serverInitStates, serverName).isInitializing,
    [serverInitStates],
  );

  const isCancellable = useCallback(
    (serverName: string) => getServerInitState(serverInitStates, serverName).isCancellable,
    [serverInitStates],
  );

  const getOAuthUrl = useCallback(
    (serverName: string) => getServerInitState(serverInitStates, serverName).oauthUrl,
    [serverInitStates],
  );

  const placeholderText = useMemo(
    () => startupConfig?.interface?.mcpServers?.placeholder || localize('com_ui_mcp_servers'),
    [startupConfig?.interface?.mcpServers?.placeholder, localize],
  );

  const requestServerConnection = useCallback(
    (serverName: string) => {
      if (isInitializing(serverName) || !serverNeedsConnection(serverName)) {
        return;
      }
      initializeServer(serverName);
    },
    [isInitializing, serverNeedsConnection, initializeServer],
  );

  const batchToggleServers = useCallback(
    (serverNames: string[]) => {
      const previousValues = mcpValues ?? [];
      const removed = previousValues.filter((serverName) => !serverNames.includes(serverName));
      const added = serverNames.filter((serverName) => !previousValues.includes(serverName));

      // MultiSelect desmarca ao clicar de novo; se ainda desconectado, reconectar sem alterar seleção
      if (removed.length === 1 && added.length === 0) {
        const serverName = removed[0];
        if (serverNeedsConnection(serverName)) {
          requestServerConnection(serverName);
          return;
        }
      }

      const serverNamesSet = new Set(serverNames);
      for (const pending of pendingInitialization.current) {
        if (!serverNamesSet.has(pending)) {
          pendingInitialization.current.delete(pending);
        }
      }

      setMCPValues(serverNames);
      added.forEach((serverName) => requestServerConnection(serverName));
    },
    [mcpValues, serverNeedsConnection, setMCPValues, requestServerConnection],
  );

  const toggleServerSelection = useCallback(
    (serverName: string) => {
      if (isInitializing(serverName)) {
        if (isCancellable(serverName)) {
          cancelOAuthFlow(serverName);
        }
        return;
      }

      const currentValues = mcpValues ?? [];
      const isCurrentlySelected = currentValues.includes(serverName);

      if (isCurrentlySelected) {
        if (serverNeedsConnection(serverName)) {
          requestServerConnection(serverName);
          return;
        }
        pendingInitialization.current.delete(serverName);
        setMCPValues(currentValues.filter((name) => name !== serverName));
      } else {
        setMCPValues([...currentValues, serverName]);
        requestServerConnection(serverName);
      }
    },
    [
      mcpValues,
      setMCPValues,
      serverNeedsConnection,
      requestServerConnection,
      isInitializing,
      isCancellable,
      cancelOAuthFlow,
    ],
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

        const currentValues = mcpValues ?? [];
        const filteredValues = currentValues.filter((name) => name !== targetName);
        setMCPValues(filteredValues);
      }
    },
    [selectedToolForConfig, updateUserPluginsMutation, mcpValues, setMCPValues],
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
      const serverConfig = startupConfig?.mcpServers?.[serverName];

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

      const hasPendingOAuth =
        serverStatus?.requiresOAuth === true && serverStatus.connectionState === 'connecting';
      const isPendingConnection = serverStatus?.connectionState === 'connecting';
      const canCancelOAuth = isCancellable(serverName) || hasPendingOAuth;

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
        isInitializing: isInitializing(serverName) || hasPendingOAuth || isPendingConnection,
        canCancel: canCancelOAuth,
        onCancel: handleCancelClick,
        hasCustomUserVars,
      };
    },
    [
      queryClient,
      isCancellable,
      isInitializing,
      cancelOAuthFlow,
      connectionStatus,
      startupConfig?.mcpServers,
    ],
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
    configuredServers,
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
    getServerStatusIconProps,
    getConfigDialogProps,
  };
}
