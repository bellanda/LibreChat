import React, { useMemo } from 'react';
import { TooltipAnchor } from '@librechat/client';
import { getConfigDefaults } from 'librechat-data-provider';
import type { ModelSelectorProps } from '~/common';
import { useLocalize } from '~/hooks';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { CustomMenu as Menu } from './CustomMenu';
import DialogManager from './DialogManager';
import { ModelSelectorChatProvider } from './ModelSelectorChatContext';
import { ModelSelectorProvider, useModelSelectorContext } from './ModelSelectorContext';
import {
  renderCustomGroups,
  renderEndpoints,
  renderModelSpecs,
  renderSearchResults,
} from './components';
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
    <TooltipAnchor
      aria-label={localize('com_ui_select_model')}
      description={localize('com_ui_select_model')}
      render={
        <button
          className="my-1 flex h-10 w-full max-w-[70vw] items-center justify-center gap-2 rounded-xl border border-border-light bg-presentation px-3 py-2 text-sm text-text-primary hover:bg-surface-active-alt"
          aria-label={localize('com_ui_select_model')}
        >
          {selectedIcon && React.isValidElement(selectedIcon) && (
            <div className="flex flex-shrink-0 items-center justify-center overflow-hidden">
              {selectedIcon}
            </div>
          )}
          <div className="flex-grow truncate text-left">
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
      }
    />
  );

  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-2">
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
        combobox={<input id="model-search" placeholder=" " />}
        comboboxLabel={localize('com_endpoint_search_models')}
        trigger={trigger}
      >
        {searchResults ? (
          renderSearchResults(searchResults, localize, searchValue)
        ) : (
          <>
            {/* Render ungrouped modelSpecs (no group field) */}
            {renderModelSpecs(
              modelSpecs?.filter((spec) => !spec.group) || [],
              selectedValues.modelSpec || '',
            )}
            {/* Render endpoints (will include grouped specs matching endpoint names) */}
            {renderEndpoints(mappedEndpoints ?? [])}
            {/* Render custom groups (specs with group field not matching any endpoint) */}
            {renderCustomGroups(modelSpecs || [], mappedEndpoints ?? [])}
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
  const interfaceConfig = startupConfig?.interface ?? getConfigDefaults().interface;
  const modelSpecs = startupConfig?.modelSpecs?.list ?? [];

  // Hide the selector when modelSelect is false and there are no model specs to show
  if (interfaceConfig.modelSelect === false && modelSpecs.length === 0) {
    return null;
  }

  return (
    <ModelSelectorChatProvider>
      <ModelSelectorProvider startupConfig={startupConfig}>
        <ModelSelectorContent />
      </ModelSelectorProvider>
    </ModelSelectorChatProvider>
  );
}
