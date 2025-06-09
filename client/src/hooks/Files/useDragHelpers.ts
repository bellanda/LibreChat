import { useQueryClient } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';
import {
  AgentCapabilities,
  Constants,
  EModelEndpoint,
  isAgentsEndpoint,
  isEphemeralAgent,
  QueryKeys,
} from 'librechat-data-provider';
import { useMemo, useState } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useRecoilValue } from 'recoil';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { useToastContext } from '~/Providers/ToastContext';
import store, { ephemeralAgentByConvoId } from '~/store';
import useFileHandling from './useFileHandling';

export default function useDragHelpers() {
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { getModelDescription } = useModelDescriptions();
  const [showModal, setShowModal] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;
  const key = useMemo(
    () => conversation?.conversationId ?? Constants.NEW_CONVO,
    [conversation?.conversationId],
  );
  const ephemeralAgent = useRecoilValue(ephemeralAgentByConvoId(key));

  // Check if current model supports image attachments
  const currentModel = conversation?.model ?? null;
  const modelDescription = getModelDescription(currentModel);
  const supportsImageAttachment = modelDescription?.supportsImageAttachment ?? true;

  const handleOptionSelect = (toolResource: string | undefined) => {
    handleFiles(draggedFiles, toolResource);
    setShowModal(false);
    setDraggedFiles([]);
  };

  const isAgents = useMemo(
    () =>
      isAgentsEndpoint(conversation?.endpoint) ||
      isEphemeralAgent(conversation?.endpoint, ephemeralAgent),
    [conversation?.endpoint, ephemeralAgent],
  );

  const { handleFiles } = useFileHandling({
    overrideEndpoint: isAgents ? EModelEndpoint.agents : undefined,
  });

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        console.log('drop', item.files);

        // Check for image files when model doesn't support images
        if (!supportsImageAttachment) {
          const imageFiles = Array.from(item.files).filter((file) =>
            file.type.startsWith('image/'),
          );
          if (imageFiles.length > 0) {
            showToast({
              message:
                'Este modelo não suporta anexos de imagem. Por favor, selecione apenas arquivos de texto ou documentos.',
              status: 'error',
              duration: 5000,
            });
            return;
          }
        }

        if (!isAgents) {
          handleFiles(item.files);
          return;
        }

        const endpointsConfig = queryClient.getQueryData<t.TEndpointsConfig>([QueryKeys.endpoints]);
        const agentsConfig = endpointsConfig?.[EModelEndpoint.agents];
        const codeEnabled =
          agentsConfig?.capabilities?.includes(AgentCapabilities.execute_code) === true;
        const fileSearchEnabled =
          agentsConfig?.capabilities?.includes(AgentCapabilities.file_search) === true;
        if (!codeEnabled && !fileSearchEnabled) {
          handleFiles(item.files);
          return;
        }
        setDraggedFiles(item.files);
        setShowModal(true);
      },
      canDrop: () => true,
      collect: (monitor: DropTargetMonitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [handleFiles, supportsImageAttachment, showToast],
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
