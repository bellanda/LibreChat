import { useToastContext } from '@librechat/client';
import { useQueryClient } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';
import {
  AgentCapabilities,
  Constants,
  defaultAgentCapabilities,
  EModelEndpoint,
  EToolResources,
  getEndpointFileConfig,
  inferMimeType,
  isAssistantsEndpoint,
  mergeFileConfig,
  QueryKeys,
  Tools,
} from 'librechat-data-provider';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isEphemeralAgent } from '~/common';
import store, { ephemeralAgentByConvoId } from '~/store';
import useLocalize from '../useLocalize';
import useFileHandling from './useFileHandling';
import { useSmartUpload } from './useSmartUpload';

export default function useDragHelpers() {
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const localize = useLocalize();
  const [showModal, setShowModal] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;
  const setEphemeralAgent = useSetRecoilState(
    ephemeralAgentByConvoId(conversation?.conversationId ?? Constants.NEW_CONVO),
  );

  const isAssistants = useMemo(
    () => isAssistantsEndpoint(conversation?.endpoint),
    [conversation?.endpoint],
  );

  const { handleFiles } = useFileHandling();

  // Use smartUpload to detect file types and suggest tools
  const { detectUploadType } = useSmartUpload(
    conversation?.endpointType,
    conversation?.endpoint,
    undefined,
    conversation?.model,
  );

  /** Use refs to avoid re-creating the drop handler */
  const handleFilesRef = useRef(handleFiles);
  const conversationRef = useRef(conversation);
  const detectUploadTypeRef = useRef(detectUploadType);

  handleFilesRef.current = handleFiles;
  conversationRef.current = conversation;
  detectUploadTypeRef.current = detectUploadType;

  const handleOptionSelect = useCallback(
    (toolResource: EToolResources | undefined) => {
      /** File search is not automatically enabled to simulate legacy behavior */
      if (toolResource && toolResource !== EToolResources.file_search) {
        setEphemeralAgent((prev) => ({
          ...prev,
          [toolResource]: true,
        }));
      }
      handleFiles(draggedFiles, toolResource);
      setShowModal(false);
      setDraggedFiles([]);
    },
    [draggedFiles, handleFiles, setEphemeralAgent],
  );

  const handleDrop = useCallback(
    (item: { files: File[] }) => {
      /** Early block: leverage endpoint file config to prevent drag/drop on disabled endpoints */
      const currentEndpoint = conversationRef.current?.endpoint ?? 'default';
      const currentEndpointType = conversationRef.current?.endpointType ?? undefined;
      const cfg = queryClient.getQueryData<t.FileConfig>([QueryKeys.fileConfig]);
      if (cfg) {
        const mergedCfg = mergeFileConfig(cfg);
        const endpointCfg = getEndpointFileConfig({
          fileConfig: mergedCfg,
          endpoint: currentEndpoint,
          endpointType: currentEndpointType,
        });
        if (endpointCfg?.disabled === true) {
          showToast({
            message: localize('com_ui_attach_error_disabled'),
            status: 'error',
          });
          return;
        }
      }

      if (isAssistants) {
        handleFilesRef.current(item.files);
        return;
      }

      // Use smartUpload to detect file types and get suggested tool
      const firstFile = item.files[0];
      if (firstFile) {
        const detection = detectUploadTypeRef.current(firstFile);

        // If validation fails, show error
        if (!detection.validation.valid) {
          showToast({
            message: detection.validation.error || localize('com_ui_attach_error'),
            status: 'error',
          });
          return;
        }

        // If there's a clear suggestion and only one file, use it automatically
        // For multiple files, show modal to let user choose
        if (item.files.length === 1 && detection.suggested !== undefined) {
          // Set tool resource and handle files directly
          if (detection.suggested !== EToolResources.file_search) {
            setEphemeralAgent((prev) => ({
              ...prev,
              [detection.suggested!]: true,
            }));
          }
          handleFilesRef.current(item.files, detection.suggested);
          return;
        }

        // If no tool suggested (goes directly to provider), handle immediately
        if (detection.suggested === undefined) {
          handleFilesRef.current(item.files);
          return;
        }
      }

      // Show modal for multiple files or when user needs to choose
      const endpointsConfig = queryClient.getQueryData<t.TEndpointsConfig>([QueryKeys.endpoints]);
      const agentsConfig = endpointsConfig?.[EModelEndpoint.agents];
      const capabilities = agentsConfig?.capabilities ?? defaultAgentCapabilities;
      const fileSearchEnabled = capabilities.includes(AgentCapabilities.file_search) === true;
      const codeEnabled = capabilities.includes(AgentCapabilities.execute_code) === true;
      const contextEnabled = capabilities.includes(AgentCapabilities.context) === true;

      /** Get agent permissions at drop time */
      const agentId = conversationRef.current?.agent_id;
      let fileSearchAllowedByAgent = true;
      let codeAllowedByAgent = true;

      if (agentId && !isEphemeralAgent(agentId)) {
        /** Agent data from cache */
        const agent = queryClient.getQueryData<t.Agent>([QueryKeys.agent, agentId]);
        if (agent) {
          const agentTools = agent.tools as string[] | undefined;
          fileSearchAllowedByAgent = agentTools?.includes(Tools.file_search) ?? false;
          codeAllowedByAgent = agentTools?.includes(Tools.execute_code) ?? false;
        } else {
          /** If agent exists but not found, disallow */
          fileSearchAllowedByAgent = false;
          codeAllowedByAgent = false;
        }
      }

      /** Determine if dragged files are all images (enables the base image option) */
      const allImages = item.files.every((f) =>
        inferMimeType(f.name, f.type)?.startsWith('image/'),
      );

      const shouldShowModal =
        allImages ||
        (fileSearchEnabled && fileSearchAllowedByAgent) ||
        (codeEnabled && codeAllowedByAgent) ||
        contextEnabled;

      if (!shouldShowModal) {
        // Fallback: directly handle files without showing modal
        handleFilesRef.current(item.files);
        return;
      }
      setDraggedFiles(item.files);
      setShowModal(true);
    },
    [isAssistants, queryClient, showToast, localize, setEphemeralAgent],
  );

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop: handleDrop,
      canDrop: () => true,
      collect: (monitor: DropTargetMonitor) => {
        /** Optimize collect to reduce re-renders */
        const isOver = monitor.isOver();
        const canDrop = monitor.canDrop();
        return { isOver, canDrop };
      },
    }),
    [handleDrop],
  );

  return {
    canDrop,
    isOver,
    drop,
    showModal,
    setShowModal,
    draggedFiles,
    handleOptionSelect,
  };
}
