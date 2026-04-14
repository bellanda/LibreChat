import type { TMessage } from 'librechat-data-provider';
import { useMemo } from 'react';

export default function useContentMetadata(message?: TMessage | null) {
    const hasParallelContent = useMemo(() => {
        if (!message?.content || !Array.isArray(message.content)) {
            return false;
        }
        // Check if any content part has groupId (parallel execution indicator)
        return message.content.some((part) => part?.groupId != null);
    }, [message?.content]);

    return { hasParallelContent };
}
