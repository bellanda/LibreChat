import { useCallback, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import isEqual from 'lodash/isEqual';
import { useRecoilState } from 'recoil';
import { Constants, LocalStorageKeys } from 'librechat-data-provider';
import { ephemeralAgentByConvoId, mcpValuesAtomFamily, mcpPinnedAtom } from '~/store';
import { useGetStartupConfig } from '~/data-provider';
import { setTimestamp } from '~/utils/timestamps';

export function useMCPSelect({ conversationId }: { conversationId?: string | null }) {
  const key = conversationId ?? Constants.NEW_CONVO;
  const { data: startupConfig } = useGetStartupConfig();
  const configuredServers = useMemo(() => {
    return new Set(Object.keys(startupConfig?.mcpServers ?? {}));
  }, [startupConfig?.mcpServers]);
  const configuredServerList = useMemo(() => [...configuredServers], [configuredServers]);

  const [isPinned, setIsPinned] = useAtom(mcpPinnedAtom);
  const [mcpValues, setMCPValuesRaw] = useAtom(mcpValuesAtomFamily(key));
  const [ephemeralAgent, setEphemeralAgent] = useRecoilState(ephemeralAgentByConvoId(key));
  // Sync Jotai state with ephemeral agent state; auto-enable visible MCPs when never configured
  useEffect(() => {
    const mcps = ephemeralAgent?.mcp;

    // Undefined = nova conversa, nunca configurado → auto-selecionar os servidores visíveis
    if (mcps === undefined) {
      if (configuredServerList.length > 0) {
        setMCPValuesRaw(configuredServerList);
      }
      return;
    }

    // mcp_clear = usuário explicitamente desligou tudo → limpar sem auto-selecionar
    if (mcps.length === 1 && mcps[0] === Constants.mcp_clear) {
      setMCPValuesRaw([]);
      return;
    }

    // Lista não-vazia: aplicar filtrando só os servidores ainda visíveis
    if (mcps.length > 0) {
      const activeMcps = mcps.filter((mcp) => configuredServers.has(mcp));
      setMCPValuesRaw(activeMcps);
    }
    // Lista vazia explícita (= usuário desligou tudo mas não via mcp_clear): não re-ligar
  }, [ephemeralAgent?.mcp, setMCPValuesRaw, configuredServers, configuredServerList]);

  useEffect(() => {
    setEphemeralAgent((prev) => {
      // Quando vazio, propagar mcp_clear para que o auto-select não religue numa remontagem
      const nextMcp = mcpValues.length === 0 ? [Constants.mcp_clear as string] : mcpValues;
      if (!isEqual(prev?.mcp, nextMcp)) {
        return { ...(prev ?? {}), mcp: nextMcp };
      }
      return prev;
    });
  }, [mcpValues, setEphemeralAgent]);

  useEffect(() => {
    const mcpStorageKey = `${LocalStorageKeys.LAST_MCP_}${key}`;
    if (mcpValues.length > 0) {
      setTimestamp(mcpStorageKey);
    }
  }, [mcpValues, key]);

  /** Stable memoized setter. */
  const setMCPValues = useCallback(
    (value: string[]) => {
      if (!Array.isArray(value)) {
        return;
      }
      setMCPValuesRaw(value);
    },
    [setMCPValuesRaw],
  );

  return {
    isPinned,
    mcpValues,
    setIsPinned,
    setMCPValues,
  };
}
