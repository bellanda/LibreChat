import type { EndpointFileConfig, TConversation } from 'librechat-data-provider';
import {
  Constants,
  fileConfig as defaultFileConfig,
  isAgentsEndpoint,
  isAssistantsEndpoint,
  mergeFileConfig,
  supportsFiles,
} from 'librechat-data-provider';
import { memo, useMemo } from 'react';
import { useGetFileConfig } from '~/data-provider';
import AttachFile from './AttachFile';
import AttachFileMenu from './AttachFileMenu';

function AttachFileChat({
  disableInputs,
  conversation,
}: {
  disableInputs: boolean;
  conversation: TConversation | null;
}) {
  const conversationId = conversation?.conversationId ?? Constants.NEW_CONVO;
  const { endpoint, endpointType } = conversation ?? { endpoint: null };
  const isAgents = useMemo(() => isAgentsEndpoint(endpoint), [endpoint]);
  const isAssistants = useMemo(() => isAssistantsEndpoint(endpoint), [endpoint]);

  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });

  const endpointFileConfig = fileConfig.endpoints[endpoint ?? ''] as EndpointFileConfig | undefined;
  const endpointSupportsFiles: boolean = supportsFiles[endpointType ?? endpoint ?? ''] ?? false;
  const isUploadDisabled = (disableInputs || endpointFileConfig?.disabled) ?? false;

  if (isAssistants && endpointSupportsFiles && !isUploadDisabled) {
    return <AttachFile disabled={disableInputs} />;
  } else if (isAgents || (endpointSupportsFiles && !isUploadDisabled)) {
    return (
      <AttachFileMenu
        disabled={disableInputs}
        conversationId={conversationId}
        endpointFileConfig={endpointFileConfig}
      />
    );
  }
  return null;
}

export default memo(AttachFileChat);
