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

  // Nunca configurado (null em storage) + ephemeral zerado → auto-selecionar uma única vez
  useEffect(() => {
    if (rawMcpValues !== null) return;
    if (ephemeralAgent?.mcp !== undefined) return;
    if (configuredServerList.length === 0) return;
    setMCPValuesRaw(configuredServerList);
  }, [rawMcpValues, ephemeralAgent?.mcp, configuredServerList, setMCPValuesRaw]);

  /**
   * Sincroniza ephemeralAgent → Jotai apenas quando o ephemeral muda por fora
   * (ex: template de agente aplicado, fluxo OAuth). NÃO existe efeito no sentido
   * inverso (Jotai → ephemeral): esse caminho é feito diretamente dentro de
   * `setMCPValues`, evitando o ping-pong de dois efeitos se retro-alimentando.
   */
  useEffect(() => {
    const mcps = ephemeralAgent?.mcp;
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

    const activeMcps = mcps.filter((mcp) => configuredServers.has(mcp));
    if (!isEqual(activeMcps, mcpValues)) {
      setMCPValuesRaw(activeMcps);
    }
  }, [ephemeralAgent?.mcp, configuredServers, mcpValues, setMCPValuesRaw]);

  useEffect(() => {
    const mcpStorageKey = `${LocalStorageKeys.LAST_MCP_}${key}`;
    if (mcpValues.length > 0) {
      setTimestamp(mcpStorageKey);
    }
  }, [mcpValues, key]);

  /** Escreve nos dois stores de uma vez (sem depender de efeito para o caminho de volta). */
  const setMCPValues = useCallback(
    (value: string[]) => {
      if (!Array.isArray(value)) {
        return;
      }
      setMCPValuesRaw(value);
      setEphemeralAgent((prev) => {
        // Vazio → propagar mcp_clear para que remontagem não re-ligue servidores desligados
        const nextMcp = value.length === 0 ? [Constants.mcp_clear as string] : value;
        if (!isEqual(prev?.mcp, nextMcp)) {
          return { ...(prev ?? {}), mcp: nextMcp };
        }
        return prev;
      });
    },
    [setMCPValuesRaw, setEphemeralAgent],
  );

  return {
    isPinned,
    mcpValues,
    setIsPinned,
    setMCPValues,
  };
}
