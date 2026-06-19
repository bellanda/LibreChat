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
  // rawMcpValues: null = nunca configurado, [] = limpado, [...] = seleção
  const [rawMcpValues, setMCPValuesRaw] = useAtom(mcpValuesAtomFamily(key));
  // mcpValues exposto externamente é sempre string[] (referência estável p/ evitar re-render)
  const mcpValues = useMemo(() => rawMcpValues ?? [], [rawMcpValues]);
  const [ephemeralAgent, setEphemeralAgent] = useRecoilState(ephemeralAgentByConvoId(key));

  // Sync ephemeralAgent → mcpValues; auto-enable quando nunca configurado.
  // Todas as escritas usam guard de igualdade para não recriar referências em loop.
  useEffect(() => {
    const mcps = ephemeralAgent?.mcp;

    // Nunca configurado (null em storage) + ephemeral zerado → auto-selecionar
    if (rawMcpValues === null && mcps === undefined) {
      if (configuredServerList.length > 0) {
        setMCPValuesRaw(configuredServerList);
      }
      return;
    }

    // Ephemeral ainda não inicializado: nada a derivar dele (Effect 2 cuida do storage→ephemeral)
    if (mcps === undefined) {
      return;
    }

    // mcp_clear = usuário explicitamente desligou tudo nesta sessão
    if (mcps.length === 1 && mcps[0] === Constants.mcp_clear) {
      if (mcpValues.length !== 0) {
        setMCPValuesRaw([]);
      }
      return;
    }

    // Lista vinda do ephemeral: aplicar filtrando só os servidores visíveis
    const activeMcps = mcps.filter((mcp) => configuredServers.has(mcp));
    if (!isEqual(activeMcps, mcpValues)) {
      setMCPValuesRaw(activeMcps);
    }
  }, [
    ephemeralAgent?.mcp,
    rawMcpValues,
    mcpValues,
    setMCPValuesRaw,
    configuredServers,
    configuredServerList,
  ]);

  // Sync mcpValues → ephemeralAgent
  useEffect(() => {
    // Aguardar o auto-select: atom nulo → ainda não há decisão do usuário a propagar
    if (rawMcpValues === null) {
      return;
    }
    setEphemeralAgent((prev) => {
      // Vazio → propagar mcp_clear para que remontagem não re-ligue servidores desligados
      const nextMcp = mcpValues.length === 0 ? [Constants.mcp_clear as string] : mcpValues;
      if (!isEqual(prev?.mcp, nextMcp)) {
        return { ...(prev ?? {}), mcp: nextMcp };
      }
      return prev;
    });
  }, [mcpValues, rawMcpValues, setEphemeralAgent]);

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
