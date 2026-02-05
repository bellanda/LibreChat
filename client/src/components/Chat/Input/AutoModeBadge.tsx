import { CheckboxButton } from '@librechat/client';
import { Sparkles } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { Constants } from 'librechat-data-provider';
import { autoModeByConvoId, ephemeralAgentByConvoId } from '~/store/agents';
import { useLocalize } from '~/hooks';
import { useBadgeRowContext } from '~/Providers';

function AutoModeBadge() {
  const localize = useLocalize();
  const { conversationId } = useBadgeRowContext();
  const key = conversationId ?? Constants.NEW_CONVO;

  const [autoMode, setAutoMode] = useRecoilState(autoModeByConvoId(key));
  const [, setEphemeralAgent] = useRecoilState(ephemeralAgentByConvoId(key));

  const handleToggle = useCallback(
    ({ value }: { e?: React.ChangeEvent<HTMLInputElement>; value?: boolean }) => {
      const newAutoMode = value ?? !autoMode;
      setAutoMode(newAutoMode);

      // Quando autoMode está ativo, ativa todas as tools (artefatos com shadcn para o backend aceitar)
      // Backend exige artifacts como string ('default'|'shadcnui'|'custom') para injetar o prompt
      setEphemeralAgent((prev) => ({
        ...(prev || {}),
        execute_code: newAutoMode,
        file_search: newAutoMode,
        web_search: newAutoMode,
        artifacts: newAutoMode ? ArtifactModes.SHADCNUI : undefined,
        mcp: prev?.mcp,
      }));
    },
    [autoMode, setAutoMode, setEphemeralAgent],
  );

  return (
    <CheckboxButton
      className="max-w-fit"
      checked={autoMode}
      setValue={handleToggle}
      label={localize('com_ui_auto_mode')}
      isCheckedClassName="border-green-600/40 bg-green-500/10 hover:bg-green-700/10"
      icon={<Sparkles className="icon-md" aria-hidden="true" />}
    />
  );
}

export default memo(AutoModeBadge);
