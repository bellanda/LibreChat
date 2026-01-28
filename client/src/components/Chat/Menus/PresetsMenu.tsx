import { useRef } from 'react';
import type { FC } from 'react';
import { BookCopy } from 'lucide-react';
import {
  Button,
  TooltipAnchor,
} from '@librechat/client';
import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { EditPresetDialog, PresetItems } from './Presets';
import { useLocalize, usePresets } from '~/hooks';
import { useChatContext } from '~/Providers';

const PresetsMenu: FC = () => {
  const localize = useLocalize();
  const presetsMenuTriggerRef = useRef<HTMLDivElement>(null);
  const {
    presetsQuery,
    onSetDefaultPreset,
    onFileSelected,
    onSelectPreset,
    onChangePreset,
    clearAllPresets,
    onDeletePreset,
    submitPreset,
    exportPreset,
  } = usePresets();
  const { preset } = useChatContext();
  return (
    <Root>
      <Trigger asChild>
        <TooltipAnchor
          ref={presetsMenuTriggerRef}
          description={localize('com_endpoint_examples')}
          render={
            <Button
              size="icon"
              variant="outline"
              tabIndex={0}
              id="presets-button"
              data-testid="presets-button"
              aria-label={localize('com_endpoint_examples')}
              className="rounded-xl bg-presentation p-2 duration-0 hover:bg-surface-active-alt"
            >
              <BookCopy className="icon-lg" aria-hidden="true" />
            </Button>
          }
        />
      </Trigger>
      <Portal>
        <div
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            transform: 'translate3d(268px, 50px, 0px)',
            minWidth: 'max-content',
            zIndex: 'auto',
          }}
        >
          <Content
            side="bottom"
            align="center"
            className="mt-2 max-h-[495px] overflow-x-hidden rounded-lg border border-border-light bg-presentation text-text-primary shadow-lg md:min-w-[400px]"
          >
            <PresetItems
              presets={presetsQuery.data}
              onSetDefaultPreset={onSetDefaultPreset}
              onSelectPreset={onSelectPreset}
              onChangePreset={onChangePreset}
              onDeletePreset={onDeletePreset}
              clearAllPresets={clearAllPresets}
              onFileSelected={onFileSelected}
            />
          </Content>
        </div>
      </Portal>
      {preset && (
        <EditPresetDialog
          submitPreset={submitPreset}
          exportPreset={exportPreset}
          triggerRef={presetsMenuTriggerRef}
        />
      )}
    </Root>
  );
};

export default PresetsMenu;
