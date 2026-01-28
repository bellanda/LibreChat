import * as Ariakit from '@ariakit/react';
import { TooltipAnchor } from '@librechat/client';
import { ChevronDown } from 'lucide-react';
import { memo, useCallback, useMemo, useRef } from 'react';
import MCPConfigDialog from '~/components/MCP/MCPConfigDialog';
import MCPServerStatusIcon from '~/components/MCP/MCPServerStatusIcon';
import { useGetStartupConfig } from '~/data-provider';
import { useMCPConnectionStatus } from '~/hooks';
import { useBadgeRowContext } from '~/Providers';
import { cn } from '~/utils';

// Simple StackedMCPIcons replacement
function StackedMCPIcons({
  selectedServers,
  maxIcons = 3,
  iconSize = 'sm',
}: {
  selectedServers: Array<{ serverName: string; config?: { title?: string } }>;
  maxIcons?: number;
  iconSize?: string;
}) {
  if (selectedServers.length === 0) {
    return null;
  }

  const iconsToShow = selectedServers.slice(0, maxIcons);
  const remainingCount = selectedServers.length - maxIcons;

  return (
    <div className="flex items-center -space-x-2">
      {iconsToShow.map((server, index) => (
        <div
          key={server.serverName}
          className={cn(
            'relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-border-light bg-surface-secondary text-xs font-medium text-text-primary',
            index > 0 && 'ml-[-4px]',
          )}
          title={server.config?.title || server.serverName}
        >
          {(server.config?.title || server.serverName).charAt(0).toUpperCase()}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-border-light bg-surface-secondary text-xs font-medium text-text-primary ml-[-4px]">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Simple MCPServerMenuItem replacement
function MCPServerMenuItem({
  server,
  isSelected,
  connectionStatus,
  isInitializing,
  statusIconProps,
  onToggle,
}: {
  server: { serverName: string; config?: { title?: string } };
  isSelected: boolean;
  connectionStatus?: Record<string, any>;
  isInitializing: (serverName: string) => boolean;
  statusIconProps?: any;
  onToggle: (serverName: string) => void;
}) {
  const isServerInitializing = isInitializing(server.serverName);
  const displayName = server.config?.title || server.serverName;

  return (
    <Ariakit.MenuItem
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
        'hover:bg-surface-hover focus:bg-surface-hover',
        isSelected && 'bg-surface-hover',
        isServerInitializing && 'opacity-50 cursor-not-allowed',
      )}
      disabled={isServerInitializing}
      onClick={() => onToggle(server.serverName)}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded border',
            isSelected
              ? 'border-border-xheavy bg-surface-primary'
              : 'border-border-medium bg-transparent',
          )}
        >
          {isSelected && (
            <svg className="h-3 w-3 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span className="text-text-primary">{displayName}</span>
      </div>
      {statusIconProps && (
        <div className="ml-2 flex items-center">
          <MCPServerStatusIcon {...statusIconProps} />
        </div>
      )}
    </Ariakit.MenuItem>
  );
}

function MCPSelectContent() {
  const { conversationId, mcpServerManager } = useBadgeRowContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { connectionStatus } = useMCPConnectionStatus({
    enabled: !!startupConfig?.mcpServers && Object.keys(startupConfig.mcpServers).length > 0,
  });
  const {
    localize,
    isPinned,
    mcpValues,
    placeholderText,
    toggleServerSelection,
    isInitializing,
    getConfigDialogProps,
    getServerStatusIconProps,
  } = mcpServerManager;

  const menuStore = Ariakit.useMenuStore({ focusLoop: true });
  const isOpen = menuStore.useState('open');
  const focusedElementRef = useRef<HTMLElement | null>(null);

  const selectedCount = mcpValues?.length ?? 0;

  // Create selectableServers from configuredServers and startupConfig
  const selectableServers = useMemo(() => {
    if (!startupConfig?.mcpServers) return [];
    return Object.entries(startupConfig.mcpServers)
      .filter(([, config]) => config.chatMenu !== false)
      .map(([serverName, config]) => ({
        serverName,
        config: {
          title: config.title || serverName,
          ...config,
        },
      }));
  }, [startupConfig?.mcpServers]);

  // Wrap toggleServerSelection to preserve focus after state update
  const handleToggle = useCallback(
    (serverName: string) => {
      // Save currently focused element
      focusedElementRef.current = document.activeElement as HTMLElement;
      toggleServerSelection(serverName);
      // Restore focus after React re-renders
      requestAnimationFrame(() => {
        focusedElementRef.current?.focus();
      });
    },
    [toggleServerSelection],
  );

  const selectedServers = useMemo(() => {
    if (!mcpValues || mcpValues.length === 0) {
      return [];
    }
    return selectableServers.filter((s) => mcpValues.includes(s.serverName));
  }, [selectableServers, mcpValues]);

  const displayText = useMemo(() => {
    if (selectedCount === 0) {
      return null;
    }
    if (selectedCount === 1) {
      const server = selectableServers.find((s) => s.serverName === mcpValues?.[0]);
      return server?.config?.title || mcpValues?.[0];
    }
    return localize('com_ui_x_selected', { 0: selectedCount });
  }, [selectedCount, selectableServers, mcpValues, localize]);

  if (!isPinned && mcpValues?.length === 0) {
    return null;
  }

  const configDialogProps = getConfigDialogProps();

  return (
    <>
      <Ariakit.MenuProvider store={menuStore}>
        <TooltipAnchor
          description={placeholderText}
          disabled={isOpen}
          render={
            <Ariakit.MenuButton
              className={cn(
                'group relative inline-flex items-center justify-center gap-1.5',
                'border border-border-medium text-sm font-medium transition-all',
                'h-9 min-w-9 rounded-full bg-transparent px-2.5 shadow-sm',
                'hover:bg-surface-hover hover:shadow-md active:shadow-inner',
                'md:w-fit md:justify-start md:px-3',
                isOpen && 'bg-surface-hover',
              )}
            />
          }
        >
          <StackedMCPIcons selectedServers={selectedServers} maxIcons={3} iconSize="sm" />
          <span className="hidden truncate text-text-primary md:block">
            {displayText || placeholderText}
          </span>
          <ChevronDown
            className={cn(
              'hidden h-3 w-3 text-text-secondary transition-transform md:block',
              isOpen && 'rotate-180',
            )}
          />
        </TooltipAnchor>

        <Ariakit.Menu
          portal={true}
          gutter={8}
          aria-label={localize('com_ui_mcp_servers')}
          className={cn(
            'z-50 flex min-w-[260px] max-w-[320px] flex-col rounded-xl',
            'border border-border-light bg-presentation p-1.5 shadow-lg',
            'origin-top opacity-0 transition-[opacity,transform] duration-200 ease-out',
            'data-[enter]:scale-100 data-[enter]:opacity-100',
            'scale-95 data-[leave]:scale-95 data-[leave]:opacity-0',
          )}
        >
          <div className="flex max-h-[320px] flex-col gap-1 overflow-y-auto">
            {selectableServers.map((server) => (
              <MCPServerMenuItem
                key={server.serverName}
                server={server}
                isSelected={mcpValues?.includes(server.serverName) ?? false}
                connectionStatus={connectionStatus}
                isInitializing={isInitializing}
                statusIconProps={getServerStatusIconProps(server.serverName)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      {configDialogProps && (
        <MCPConfigDialog {...configDialogProps} conversationId={conversationId} />
      )}
    </>
  );
}

function MCPSelect() {
  const { mcpServerManager } = useBadgeRowContext();
  const { data: startupConfig } = useGetStartupConfig();

  const selectableServers = useMemo(() => {
    if (!startupConfig?.mcpServers) return [];
    return Object.entries(startupConfig.mcpServers)
      .filter(([, config]) => config.chatMenu !== false)
      .map(([serverName]) => serverName);
  }, [startupConfig?.mcpServers]);

  if (!selectableServers || selectableServers.length === 0) {
    return null;
  }

  return <MCPSelectContent />;
}

export default memo(MCPSelect);
