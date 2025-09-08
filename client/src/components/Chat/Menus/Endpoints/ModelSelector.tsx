import React, { useMemo } from 'react';
import type { ModelSelectorProps } from '~/common';
import { useLocalize } from '~/hooks';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { CustomMenu as Menu } from './CustomMenu';
import DialogManager from './DialogManager';
import { ModelSelectorChatProvider } from './ModelSelectorChatContext';
import { ModelSelectorProvider, useModelSelectorContext } from './ModelSelectorContext';
import { renderEndpoints, renderModelSpecs, renderSearchResults } from './components';
import { getDisplayValue, getSelectedIcon } from './utils';

function ModelSelectorContent() {
  const localize = useLocalize();

  const {
    // LibreChat
    agentsMap,
    modelSpecs,
    mappedEndpoints,
    endpointsConfig,
    // State
    searchValue,
    searchResults,
    selectedValues,

    // Functions
    setSearchValue,
    setSelectedValues,
    // Dialog
    keyDialogOpen,
    onOpenChange,
    keyDialogEndpoint,
  } = useModelSelectorContext();

  const selectedIcon = useMemo(
    () =>
      getSelectedIcon({
        mappedEndpoints: mappedEndpoints ?? [],
        selectedValues,
        modelSpecs,
        endpointsConfig,
      }),
    [mappedEndpoints, selectedValues, modelSpecs, endpointsConfig],
  );
  const { getModelDescription } = useModelDescriptions();
  const modelDescription = getModelDescription(selectedValues.model);

  const selectedDisplayValue = useMemo(() => {
    const baseDisplayValue = getDisplayValue({
      localize,
      agentsMap,
      modelSpecs,
      selectedValues,
      mappedEndpoints,
    });

    // Apply model description translation if available
    if (modelDescription?.name) {
      return modelDescription.name;
    }

    return baseDisplayValue;
  }, [localize, agentsMap, modelSpecs, selectedValues, mappedEndpoints, modelDescription]);

  const trigger = (
    <button
      className="my-1 flex h-10 w-full max-w-[70vw] items-center justify-center gap-2 rounded-xl border border-border-light bg-surface-secondary px-3 py-2 text-sm text-text-primary hover:bg-surface-tertiary"
      aria-label={localize('com_ui_select_model')}
    >
      {selectedIcon && React.isValidElement(selectedIcon) && (
        <div className="flex overflow-hidden flex-shrink-0 justify-center items-center">
          {selectedIcon}
        </div>
      )}
      <div className="flex-grow text-left truncate">
        {modelDescription ? (
          <div className="flex flex-col">
            <span>{modelDescription.name}</span>
            <span className="text-xs text-text-secondary">{modelDescription.shortUseCase}</span>
          </div>
        ) : (
          <span>{selectedDisplayValue}</span>
        )}
      </div>
    </button>
  );

  return (
    <div className="flex relative flex-col gap-2 items-center w-full max-w-md">
      <Menu
        values={selectedValues}
        onValuesChange={(values: Record<string, any>) => {
          setSelectedValues({
            endpoint: values.endpoint || '',
            model: values.model || '',
            modelSpec: values.modelSpec || '',
          });
        }}
        onSearch={(value) => setSearchValue(value)}
        combobox={<input placeholder={localize('com_endpoint_search_models')} />}
        trigger={trigger}
      >
        {searchResults ? (
          renderSearchResults(searchResults, localize, searchValue)
        ) : (
          <>
            {renderModelSpecs(modelSpecs, selectedValues.modelSpec || '')}
            {renderEndpoints(mappedEndpoints ?? [])}
          </>
        )}
      </Menu>
      <DialogManager
        keyDialogOpen={keyDialogOpen}
        onOpenChange={onOpenChange}
        endpointsConfig={endpointsConfig || {}}
        keyDialogEndpoint={keyDialogEndpoint || undefined}
      />
    </div>
  );
}

export default function ModelSelector({ startupConfig }: ModelSelectorProps) {
  return (
    <ModelSelectorChatProvider>
      <ModelSelectorProvider startupConfig={startupConfig}>
        <ModelSelectorContent />
      </ModelSelectorProvider>
    </ModelSelectorChatProvider>
  );
}
