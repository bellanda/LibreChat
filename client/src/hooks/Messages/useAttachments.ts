import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import type { TAttachment } from 'librechat-data-provider';
import { useSearchResultsByTurn } from './useSearchResultsByTurn';
import store from '~/store';

export default function useAttachments({
  messageId,
  attachments,
}: {
  messageId?: string;
  attachments?: TAttachment[];
}) {
  const messageAttachmentsMap = useRecoilValue(store.messageAttachmentsMap);
  const messageAttachments = useMemo(() => {
    const fromMessage = attachments ?? [];
    const fromStream = messageAttachmentsMap[messageId ?? ''] ?? [];
    if (fromMessage.length === 0) {
      return fromStream;
    }
    if (fromStream.length === 0) {
      return fromMessage;
    }
    /* `file_id` first: one tool call can emit several files (a .pptx *and* a
     * .xlsx), and keying on `toolCallId` alone collapsed them into one — only
     * the first attachment of an execution ever rendered. Where there is no
     * file_id, the toolCallId is qualified with the filename so distinct files
     * stay distinct while a genuine duplicate still dedupes. */
    const keyOf = (a: TAttachment) =>
      a.file_id ?? (a.toolCallId != null ? `${a.toolCallId}:${a.filename ?? ''}` : JSON.stringify(a));
    const seen = new Set(fromMessage.map(keyOf));
    return [...fromMessage, ...fromStream.filter((a) => !seen.has(keyOf(a)))];
  }, [attachments, messageAttachmentsMap, messageId]);

  const searchResults = useSearchResultsByTurn(messageAttachments);

  return {
    attachments: messageAttachments,
    searchResults,
  };
}
