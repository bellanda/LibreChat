import { Spinner } from '@librechat/client';
import type { MCPServerStatus, TPlugin } from 'librechat-data-provider';
import { AlertTriangle, KeyRound, PlugZap, SettingsIcon, X } from 'lucide-react';
import React from 'react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

let localize: ReturnType<typeof useLocalize>;

interface StatusIconProps {
  serverName: string;
  onConfigClick: (e: React.MouseEvent) => void;
}

interface InitializingStatusProps extends StatusIconProps {
  onCancel: (e: React.MouseEvent) => void;
  canCancel: boolean;
}

interface MCPServerStatusIconProps {
  serverName: string;
  serverStatus?: MCPServerStatus;
  tool?: TPlugin;
  onConfigClick: (e: React.MouseEvent) => void;
  isInitializing: boolean;
  canCancel: boolean;
  onCancel: (e: React.MouseEvent) => void;
  hasCustomUserVars?: boolean;
  /** When true, renders as a small status dot for compact layouts */
  compact?: boolean;
}

/**
 * Renders the appropriate status icon for an MCP server based on its state.
 *
 * Unified icon system:
 * - SettingsIcon: Configure/auth status (for connected servers with custom vars)
 * - KeyRound / PlugZap: Connect/Authenticate (for disconnected servers that need connection)
 * - Spinner: Loading state (during connection)
 * - X: Cancel (during OAuth flow, shown on hover over spinner)
 */
export default function MCPServerStatusIcon({
  serverName,
  serverStatus,
  tool,
  onConfigClick,
  isInitializing,
  canCancel,
  onCancel,
  hasCustomUserVars = false,
  compact = false,
}: MCPServerStatusIconProps) {
  localize = useLocalize();

  // Compact mode: render as a small status dot
  if (compact) {
    return <CompactStatusDot serverStatus={serverStatus} isInitializing={isInitializing} />;
  }

  if (isInitializing) {
    return (
      <InitializingStatusIcon
        serverName={serverName}
        onConfigClick={onConfigClick}
        onCancel={onCancel}
        canCancel={canCancel}
      />
    );
  }

  if (!serverStatus) {
    return null;
  }

  const { connectionState, requiresOAuth } = serverStatus;

  if (connectionState === 'connecting') {
    return <ConnectingStatusIcon serverName={serverName} onConfigClick={onConfigClick} />;
  }

  if (connectionState === 'disconnected') {
    if (requiresOAuth) {
      return <DisconnectedOAuthStatusIcon serverName={serverName} onConfigClick={onConfigClick} />;
    }
    return <DisconnectedStatusIcon serverName={serverName} onConfigClick={onConfigClick} />;
  }

  if (connectionState === 'error') {
    return <ErrorStatusIcon serverName={serverName} onConfigClick={onConfigClick} />;
  }

  if (connectionState === 'connected') {
    // Only show config button if there are customUserVars to configure
    if (hasCustomUserVars) {
      const isAuthenticated = tool?.authenticated || requiresOAuth;
      return (
        <AuthenticatedStatusIcon
          serverName={serverName}
          onConfigClick={onConfigClick}
          isAuthenticated={isAuthenticated}
        />
      );
    }
    return null; // No config button for connected servers without customUserVars
  }

  return null;
}

interface CompactStatusDotProps {
  serverStatus?: MCPServerStatus;
  isInitializing: boolean;
}

function CompactStatusDot({ serverStatus, isInitializing }: CompactStatusDotProps) {
  if (isInitializing) {
    return (
      <div className="flex size-3.5 items-center justify-center rounded-full border-2 border-surface-secondary bg-blue-500">
        <div className="size-1.5 animate-pulse rounded-full bg-white" />
      </div>
    );
  }

  if (!serverStatus) {
    return <div className="size-3 rounded-full border-2 border-surface-secondary bg-gray-400" />;
  }

  const { connectionState, requiresOAuth } = serverStatus;

  let colorClass = 'bg-gray-400';
  if (connectionState === 'connected') {
    colorClass = 'bg-green-500';
  } else if (connectionState === 'connecting') {
    colorClass = 'bg-blue-500';
  } else if (connectionState === 'error') {
    colorClass = 'bg-red-500';
  } else if (connectionState === 'disconnected' && requiresOAuth) {
    colorClass = 'bg-amber-500';
  }

  return (
    <div className={cn('size-3 rounded-full border-2 border-surface-secondary', colorClass)} />
  );
}

function InitializingStatusIcon({ serverName, onCancel, canCancel }: InitializingStatusProps) {
  if (canCancel) {
    return (
      <button
        type="button"
        onClick={onCancel}
        className="group flex h-6 w-6 items-center justify-center rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/20"
        aria-label={localize('com_ui_cancel')}
        title={localize('com_ui_cancel')}
      >
        <div className="relative h-4 w-4">
          <Spinner className="h-4 w-4 group-hover:opacity-0" />
          <X className="absolute inset-0 h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100" />
        </div>
      </button>
    );
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded p-1">
      <Spinner
        className="h-4 w-4"
        aria-label={localize('com_nav_mcp_status_connecting', { 0: serverName })}
      />
    </div>
  );
}

function ConnectingStatusIcon({ serverName }: StatusIconProps) {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded p-1">
      <Spinner
        className="h-4 w-4"
        aria-label={localize('com_nav_mcp_status_connecting', { 0: serverName })}
      />
    </div>
  );
}

function DisconnectedOAuthStatusIcon({ serverName, onConfigClick }: StatusIconProps) {
  return (
    <button
      type="button"
      onClick={onConfigClick}
      className="flex h-6 w-6 items-center justify-center rounded p-1 hover:bg-surface-secondary"
      aria-label={localize('com_nav_mcp_configure_server', { 0: serverName })}
    >
      <KeyRound className="h-4 w-4 text-amber-500" />
    </button>
  );
}

function DisconnectedStatusIcon({ serverName, onConfigClick }: StatusIconProps) {
  return (
    <button
      type="button"
      onClick={onConfigClick}
      className="flex h-6 w-6 items-center justify-center rounded p-1 hover:bg-surface-secondary"
      aria-label={localize('com_nav_mcp_configure_server', { 0: serverName })}
    >
      <PlugZap className="h-4 w-4 text-orange-500" />
    </button>
  );
}

function ErrorStatusIcon({ serverName, onConfigClick }: StatusIconProps) {
  return (
    <button
      type="button"
      onClick={onConfigClick}
      className="flex h-6 w-6 items-center justify-center rounded p-1 hover:bg-surface-secondary"
      aria-label={localize('com_nav_mcp_configure_server', { 0: serverName })}
    >
      <AlertTriangle className="h-4 w-4 text-red-500" />
    </button>
  );
}

interface AuthenticatedStatusProps extends StatusIconProps {
  isAuthenticated: boolean;
}

function AuthenticatedStatusIcon({
  serverName,
  onConfigClick,
  isAuthenticated,
}: AuthenticatedStatusProps) {
  return (
    <button
      type="button"
      onClick={onConfigClick}
      className="flex h-6 w-6 items-center justify-center rounded p-1 hover:bg-surface-secondary"
      aria-label={localize('com_nav_mcp_configure_server', { 0: serverName })}
    >
      <SettingsIcon className={`h-4 w-4 ${isAuthenticated ? 'text-green-500' : 'text-gray-400'}`} />
    </button>
  );
}
