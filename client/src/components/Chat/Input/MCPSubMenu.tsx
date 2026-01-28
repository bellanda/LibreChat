import * as Ariakit from '@ariakit/react';
import { MCPIcon, PinIcon } from '@librechat/client';
import { ChevronRight } from 'lucide-react';
import React, { useMemo } from 'react';
import MCPConfigDialog from '~/components/MCP/MCPConfigDialog';
import MCPServerStatusIcon from '~/components/MCP/MCPServerStatusIcon';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize, useMCPConnectionStatus } from '~/hooks';
import { useBadgeRowContext } from '~/Providers';
import { cn } from '~/utils';

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

interface MCPSubMenuProps {
  placeholder?: string;
}

const MCPSubMenu = React.forwardRef<HTMLDivElement, MCPSubMenuProps>(
  ({ placeholder, ...props }, ref) => {
    const localize = useLocalize();
    const { mcpServerManager } = useBadgeRowContext();
    const { data: startupConfig } = useGetStartupConfig();
    const { connectionStatus } = useMCPConnectionStatus({
      enabled: !!startupConfig?.mcpServers && Object.keys(startupConfig.mcpServers).length > 0,
    });
    const {
      isPinned,
      mcpValues,
      setIsPinned,
      placeholderText,
      isInitializing,
      getConfigDialogProps,
      toggleServerSelection,
      getServerStatusIconProps,
    } = mcpServerManager;

    const menuStore = Ariakit.useMenuStore({
      focusLoop: true,
      showTimeout: 100,
      placement: 'right',
    });

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

    // Don't render if no MCP servers are configured
    if (!selectableServers || selectableServers.length === 0) {
      return null;
    }

    const configDialogProps = getConfigDialogProps();

    return (
      <div ref={ref}>
        <Ariakit.MenuProvider store={menuStore}>
          <Ariakit.MenuItem
            {...props}
            hideOnClick={false}
            render={
              <Ariakit.MenuButton
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  menuStore.toggle();
                }}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-surface-hover"
              />
            }
          >
            <div className="flex items-center gap-2">
              <MCPIcon className="h-5 w-5 flex-shrink-0 text-text-primary" aria-hidden="true" />
              <span>{placeholder || placeholderText}</span>
              <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPinned(!isPinned);
              }}
              className={cn(
                'rounded p-1 transition-all duration-200',
                'hover:bg-surface-tertiary hover:shadow-sm',
                !isPinned && 'text-text-secondary hover:text-text-primary',
              )}
              aria-label={isPinned ? localize('com_ui_unpin') : localize('com_ui_pin')}
            >
              <div className="h-4 w-4">
                <PinIcon unpin={isPinned} />
              </div>
            </button>
          </Ariakit.MenuItem>

          <Ariakit.Menu
            portal={true}
            unmountOnHide={true}
            aria-label={localize('com_ui_mcp_servers')}
            className={cn(
              'animate-popover-left z-40 ml-3 flex min-w-[260px] max-w-[320px] flex-col rounded-xl',
              'border border-border-light bg-presentation p-1.5 shadow-lg',
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
                  onToggle={toggleServerSelection}
                />
              ))}
            </div>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
        {configDialogProps && <MCPConfigDialog {...configDialogProps} />}
      </div>
    );
  },
);

MCPSubMenu.displayName = 'MCPSubMenu';

export default React.memo(MCPSubMenu);
