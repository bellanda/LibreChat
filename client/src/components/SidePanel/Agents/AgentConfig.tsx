import { useToastContext } from '@librechat/client';
import { EModelEndpoint } from 'librechat-data-provider';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { AgentForm, AgentPanelProps, IconComponentTypes } from '~/common';
import { Panel, isEphemeralAgent } from '~/common';
import Action from '~/components/SidePanel/Builder/Action';
import { MCPToolSelectDialog, ToolSelectDialog } from '~/components/Tools';
import { useGetAgentFiles } from '~/data-provider';
import { useLocalize, useVisibleTools } from '~/hooks';
import useAgentCapabilities from '~/hooks/Agents/useAgentCapabilities';
import { icons } from '~/hooks/Endpoint/Icons';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { useAgentPanelContext, useFileMapContext } from '~/Providers';
import {
  cn,
  defaultTextProps,
  getEndpointField,
  getIconKey,
  processAgentOption,
  removeFocusOutlines,
  validateEmail,
} from '~/utils';
import AgentAvatar from './AgentAvatar';
import AgentCategorySelector from './AgentCategorySelector';
import AgentTool from './AgentTool';
import Artifacts from './Artifacts';
import CodeForm from './Code/Form';
import FileContext from './FileContext';
import FileSearch from './FileSearch';
import Instructions from './Instructions';
import MCPTools from './MCPTools';
import SearchForm from './Search/Form';

const labelClass = 'mb-2 text-token-text-primary block font-medium';
const inputClass = cn(
  defaultTextProps,
  'flex w-full px-3 py-2 border-border-light bg-surface-secondary focus-visible:ring-2 focus-visible:ring-ring-primary',
  removeFocusOutlines,
);

export default function AgentConfig({ createMutation }: Pick<AgentPanelProps, 'createMutation'>) {
  const localize = useLocalize();
  const fileMap = useFileMapContext();
  const { showToast } = useToastContext();
  const methods = useFormContext<AgentForm>();
  const [showToolDialog, setShowToolDialog] = useState(false);
  const [showMCPToolDialog, setShowMCPToolDialog] = useState(false);
  const {
    actions,
    setAction,
    regularTools,
    agentsConfig,
    startupConfig,
    mcpServersMap,
    setActivePanel,
    endpointsConfig,
  } = useAgentPanelContext();

  const {
    control,
    formState: { errors },
  } = methods;
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const agent = useWatch({ control, name: 'agent' });
  const tools = useWatch({ control, name: 'tools' });
  const agent_id = useWatch({ control, name: 'id' });

  const { data: agentFiles = [] } = useGetAgentFiles(agent_id);
  const { getModelDescription } = useModelDescriptions();

  const mergedFileMap = useMemo(() => {
    const newFileMap = { ...fileMap };
    agentFiles.forEach((file) => {
      if (file.file_id) {
        newFileMap[file.file_id] = file;
      }
    });
    return newFileMap;
  }, [fileMap, agentFiles]);

  const {
    codeEnabled,
    toolsEnabled,
    contextEnabled,
    actionsEnabled,
    artifactsEnabled,
    webSearchEnabled,
    fileSearchEnabled,
  } = useAgentCapabilities(agentsConfig?.capabilities);

  const context_files = useMemo(() => {
    if (typeof agent === 'string') {
      return [];
    }

    if (agent?.id !== agent_id) {
      return [];
    }

    if (agent.context_files) {
      return agent.context_files;
    }

    const _agent = processAgentOption({
      agent,
      fileMap: mergedFileMap,
    });
    return _agent.context_files ?? [];
  }, [agent, agent_id, mergedFileMap]);

  const knowledge_files = useMemo(() => {
    if (typeof agent === 'string') {
      return [];
    }

    if (agent?.id !== agent_id) {
      return [];
    }

    if (agent.knowledge_files) {
      return agent.knowledge_files;
    }

    const _agent = processAgentOption({
      agent,
      fileMap: mergedFileMap,
    });
    return _agent.knowledge_files ?? [];
  }, [agent, agent_id, mergedFileMap]);

  const code_files = useMemo(() => {
    if (typeof agent === 'string') {
      return [];
    }

    if (agent?.id !== agent_id) {
      return [];
    }

    if (agent.code_files) {
      return agent.code_files;
    }

    const _agent = processAgentOption({
      agent,
      fileMap: mergedFileMap,
    });
    return _agent.code_files ?? [];
  }, [agent, agent_id, mergedFileMap]);

  const handleAddActions = useCallback(() => {
    if (isEphemeralAgent(agent_id)) {
      showToast({
        message: localize('com_assistants_actions_disabled'),
        status: 'warning',
      });
      return;
    }
    setActivePanel(Panel.actions);
  }, [agent_id, setActivePanel, showToast, localize]);

  const providerValue = typeof provider === 'string' ? provider : provider?.value;
  let Icon: IconComponentTypes | null | undefined;
  let endpointType: EModelEndpoint | undefined;
  let endpointIconURL: string | undefined;
  let iconKey: string | undefined;

  if (providerValue !== undefined) {
    endpointType = getEndpointField(endpointsConfig, providerValue as string, 'type');
    endpointIconURL = getEndpointField(endpointsConfig, providerValue as string, 'iconURL');
    iconKey = getIconKey({
      endpoint: providerValue as string,
      endpointsConfig,
      endpointType,
      endpointIconURL,
    });
    Icon = icons[iconKey];
  }

  const { toolIds, mcpServerNames } = useVisibleTools(tools, regularTools, mcpServersMap);

  return (
    <>
      <div className="px-4 pt-3 h-auto bg-white dark:bg-transparent">
        {/* Avatar & Name */}
        <div className="mb-4">
          <AgentAvatar
            agent_id={agent_id}
            createMutation={createMutation}
            avatar={agent?.['avatar'] ?? null}
          />
          <label className={labelClass} htmlFor="name">
            {localize('com_ui_name')}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="name"
            rules={{ required: localize('com_ui_agent_name_is_required') }}
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  value={field.value ?? ''}
                  maxLength={256}
                  className={inputClass}
                  id="name"
                  type="text"
                  placeholder={localize('com_agents_name_placeholder')}
                  aria-label="Agent name"
                />
                <div
                  className={cn(
                    'mt-1 w-56 text-sm text-red-500',
                    errors.name ? 'visible h-auto' : 'invisible h-0',
                  )}
                >
                  {errors.name ? errors.name.message : ' '}
                </div>
              </>
            )}
          />
          <Controller
            name="id"
            control={control}
            render={({ field }) => (
              <p className="h-3 text-xs italic text-text-secondary" aria-live="polite">
                {field.value}
              </p>
            )}
          />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="description">
            {localize('com_ui_description')}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                value={field.value ?? ''}
                maxLength={512}
                className={inputClass}
                id="description"
                type="text"
                placeholder={localize('com_agents_description_placeholder')}
                aria-label="Agent description"
              />
            )}
          />
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="category-selector">
            {localize('com_ui_category')} <span className="text-red-500">*</span>
          </label>
          <AgentCategorySelector className="w-full" />
        </div>
        {/* Instructions */}
        <Instructions />
        {/* Model and Provider */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="provider">
            {localize('com_ui_model')} <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setActivePanel(Panel.model)}
            className="relative w-full h-10 font-medium rounded-lg btn btn-neutral border-token-border-light"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <div className="flex gap-2 items-center w-full">
              {Icon && (
                <div className="flex relative flex-shrink-0 justify-center items-center w-6 h-6 text-black bg-white rounded-full shadow-stroke dark:bg-white">
                  <Icon
                    className="w-2/3 h-2/3"
                    endpoint={providerValue as string}
                    endpointType={endpointType}
                    iconURL={endpointIconURL}
                  />
                </div>
              )}
              <span>
                {model != null && model
                  ? getModelDescription(model)?.name || model
                  : localize('com_ui_select_model')}
              </span>
            </div>
          </button>
        </div>
        {(codeEnabled ||
          fileSearchEnabled ||
          artifactsEnabled ||
          contextEnabled ||
          webSearchEnabled) && (
          <div className="flex flex-col gap-3 items-start mb-4 w-full">
            <label className="block font-medium text-token-text-primary">
              {localize('com_assistants_capabilities')}
            </label>
            {/* Code Execution */}
            {codeEnabled && <CodeForm agent_id={agent_id} files={code_files} />}
            {/* Web Search */}
            {webSearchEnabled && <SearchForm />}
            {/* File Context */}
            {contextEnabled && <FileContext agent_id={agent_id} files={context_files} />}
            {/* Artifacts */}
            {artifactsEnabled && <Artifacts />}
            {/* File Search */}
            {fileSearchEnabled && <FileSearch agent_id={agent_id} files={knowledge_files} />}
          </div>
        )}
        {/* MCP Section */}
        {startupConfig?.mcpServers != null && (
          <MCPTools
            agentId={agent_id}
            mcpServerNames={mcpServerNames}
            setShowMCPToolDialog={setShowMCPToolDialog}
          />
        )}
        {/* Agent Tools & Actions */}
        <div className="mb-4">
          <label className={labelClass}>
            {`${toolsEnabled === true ? localize('com_ui_tools') : ''}
              ${toolsEnabled === true && actionsEnabled === true ? ' + ' : ''}
              ${actionsEnabled === true ? localize('com_assistants_actions') : ''}`}
          </label>
          <div>
            <div className="mb-1">
              {/* Render all visible IDs */}
              {toolIds.map((toolId, i) => {
                const tool = regularTools?.find((t) => t.pluginKey === toolId);
                if (!tool) return null;
                return (
                  <AgentTool
                    key={`${toolId}-${i}-${agent_id}`}
                    tool={toolId}
                    regularTools={regularTools}
                    agent_id={agent_id}
                  />
                );
              })}
            </div>
            <div className="flex flex-col gap-1">
              {(actions ?? [])
                .filter((action) => action.agent_id === agent_id)
                .map((action, i) => (
                  <Action
                    key={i}
                    action={action}
                    onClick={() => {
                      setAction(action);
                      setActivePanel(Panel.actions);
                    }}
                  />
                ))}
            </div>
            <div className="flex mt-2 space-x-2">
              {(toolsEnabled ?? false) && (
                <button
                  type="button"
                  onClick={() => setShowToolDialog(true)}
                  className="relative w-full h-9 font-medium rounded-lg btn btn-neutral border-token-border-light"
                  aria-haspopup="dialog"
                >
                  <div className="flex gap-2 justify-center items-center w-full">
                    {localize('com_assistants_add_tools')}
                  </div>
                </button>
              )}
              {(actionsEnabled ?? false) && (
                <button
                  type="button"
                  disabled={isEphemeralAgent(agent_id)}
                  onClick={handleAddActions}
                  className="relative w-full h-9 font-medium rounded-lg btn btn-neutral border-token-border-light"
                  aria-haspopup="dialog"
                >
                  <div className="flex gap-2 justify-center items-center w-full">
                    {localize('com_assistants_add_actions')}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Support Contact (Optional) */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span>
              <label className="block font-medium text-token-text-primary">
                {localize('com_ui_support_contact')}
              </label>
            </span>
          </div>
          <div className="space-y-3">
            {/* Support Contact Name */}
            <div className="flex flex-col">
              <label
                className="flex justify-between items-center mb-1"
                htmlFor="support-contact-name"
              >
                <span className="text-sm">{localize('com_ui_support_contact_name')}</span>
              </label>
              <Controller
                name="support_contact.name"
                control={control}
                rules={{
                  minLength: {
                    value: 3,
                    message: localize('com_ui_support_contact_name_min_length', { minLength: 3 }),
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <input
                      {...field}
                      value={field.value ?? ''}
                      className={cn(inputClass, error ? 'border-2 border-red-500' : '')}
                      id="support-contact-name"
                      type="text"
                      placeholder={localize('com_ui_support_contact_name_placeholder')}
                      aria-label="Support contact name"
                    />
                    {error && (
                      <span className="text-sm text-red-500 transition duration-300 ease-in-out">
                        {error.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            {/* Support Contact Email */}
            <div className="flex flex-col">
              <label
                className="flex justify-between items-center mb-1"
                htmlFor="support-contact-email"
              >
                <span className="text-sm">{localize('com_ui_support_contact_email')}</span>
              </label>
              <Controller
                name="support_contact.email"
                control={control}
                rules={{
                  validate: (value) =>
                    validateEmail(value ?? '', localize('com_ui_support_contact_email_invalid')),
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <input
                      {...field}
                      value={field.value ?? ''}
                      className={cn(inputClass, error ? 'border-2 border-red-500' : '')}
                      id="support-contact-email"
                      type="email"
                      placeholder={localize('com_ui_support_contact_email_placeholder')}
                      aria-label="Support contact email"
                    />
                    {error && (
                      <span className="text-sm text-red-500 transition duration-300 ease-in-out">
                        {error.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>
      <ToolSelectDialog
        isOpen={showToolDialog}
        setIsOpen={setShowToolDialog}
        endpoint={EModelEndpoint.agents}
      />
      {startupConfig?.mcpServers != null && (
        <MCPToolSelectDialog
          agentId={agent_id}
          isOpen={showMCPToolDialog}
          mcpServerNames={mcpServerNames}
          setIsOpen={setShowMCPToolDialog}
          endpoint={EModelEndpoint.agents}
        />
      )}
    </>
  );
}
