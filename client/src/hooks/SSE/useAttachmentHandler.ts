import { useSetRecoilState } from 'recoil';
import type { QueryClient } from '@tanstack/react-query';
import { QueryKeys, Tools } from 'librechat-data-provider';
import type { TAttachment, EventSubmission, MemoriesResponse } from 'librechat-data-provider';
import { handleMemoryArtifact } from '~/utils/memory';
import store from '~/store';

export default function useAttachmentHandler(queryClient?: QueryClient) {
  const setAttachmentsMap = useSetRecoilState(store.messageAttachmentsMap);

  return ({ data }: { data: TAttachment; submission: EventSubmission }) => {
    const { messageId } = data;

    if (queryClient && data?.filepath && !data.filepath.includes('/api/files')) {
      queryClient.setQueryData([QueryKeys.files], (oldData: TAttachment[] | undefined) => {
        return [data, ...(oldData || [])];
      });
    }

    if (queryClient && data.type === Tools.memory && data[Tools.memory]) {
      const memoryArtifact = data[Tools.memory];

      queryClient.setQueryData([QueryKeys.memories], (oldData: MemoriesResponse | undefined) => {
        if (!oldData) {
          return oldData;
        }

        return handleMemoryArtifact({ memoryArtifact, currentData: oldData }) || oldData;
      });
    }

    setAttachmentsMap((prevMap) => {
      const messageAttachments =
        (prevMap as Record<string, TAttachment[] | undefined>)[messageId] || [];
      console.debug('[useAttachmentHandler] Adding attachment:', {
        filename: data.filename,
        toolCallId: data.toolCallId,
        messageId: data.messageId,
        filepath: data.filepath,
        existingAttachmentsCount: messageAttachments.length,
      });
      
      // Store attachment by both messageId and toolCallId (if available)
      // This ensures attachments can be found by either key
      const updatedMap: Record<string, TAttachment[] | undefined> = {
        ...prevMap,
        [messageId]: [...messageAttachments, data],
      };
      
      // Also store by toolCallId if available for easier lookup
      if (data.toolCallId) {
        const toolCallAttachments =
          (prevMap as Record<string, TAttachment[] | undefined>)[data.toolCallId] || [];
        updatedMap[data.toolCallId] = [...toolCallAttachments, data];
      }
      
      return updatedMap;
    });
  };
}
