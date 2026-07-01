import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { Constants, LocalStorageKeys } from 'librechat-data-provider';

/** Estado de inicialização OAuth/conexão — compartilhado entre todas as instâncias do hook */
export interface MCPServerInitState {
  isInitializing: boolean;
  oauthUrl: string | null;
  oauthStartTime: number | null;
  isCancellable: boolean;
}

export const defaultServerInitState: MCPServerInitState = {
  isInitializing: false,
  oauthUrl: null,
  oauthStartTime: null,
  isCancellable: false,
};

export const mcpServerInitStatesAtom = atom<Record<string, MCPServerInitState>>({});

export function getServerInitState(
  states: Record<string, MCPServerInitState>,
  serverName: string,
): MCPServerInitState {
  return states[serverName] ?? defaultServerInitState;
}

/**
 * Creates a storage atom for MCP values per conversation
 * Uses atomFamily to create unique atoms for each conversation ID
 */
export const mcpValuesAtomFamily = atomFamily((conversationId: string | null) => {
  const key = conversationId ?? Constants.NEW_CONVO;
  const storageKey = `${LocalStorageKeys.LAST_MCP_}${key}`;

  // null = nunca configurado (permite auto-select)
  // []   = usuário limpou explicitamente (não auto-selecionar)
  // [...] = seleção do usuário
  return atomWithStorage<string[] | null>(storageKey, null, undefined, { getOnInit: true });
});

/**
 * Global storage atom for MCP pinned state (shared across all conversations)
 */
export const mcpPinnedAtom = atomWithStorage<boolean>(LocalStorageKeys.PIN_MCP_, true, undefined, {
  getOnInit: true,
});
