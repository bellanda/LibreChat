import {
  Constants,
  EndpointFileConfig,
  fileConfig as defaultFileConfig,
  isAgentsEndpoint,
  isEphemeralAgent,
  mergeFileConfig,
  supportsFiles,
} from 'librechat-data-provider';
import { memo, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useChatContext } from '~/Providers';
import { useGetFileConfig } from '~/data-provider';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { ephemeralAgentByConvoId } from '~/store';
import AttachFile from './AttachFile';
import AttachFileMenu from './AttachFileMenu';

function AttachFileChat({ disableInputs }: { disableInputs: boolean }) {
  const { conversation } = useChatContext();
  const { getModelDescription } = useModelDescriptions();

  const { endpoint: _endpoint, endpointType } = conversation ?? { endpoint: null };

  const key = conversation?.conversationId ?? Constants.NEW_CONVO;
  const ephemeralAgent = useRecoilValue(ephemeralAgentByConvoId(key));
  const isAgents = useMemo(
    () => isAgentsEndpoint(_endpoint) || isEphemeralAgent(_endpoint, ephemeralAgent),
    [_endpoint, ephemeralAgent],
  );

  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });

  const endpointFileConfig = fileConfig.endpoints[_endpoint ?? ''] as
    | EndpointFileConfig
    | undefined;

  const endpointSupportsFiles: boolean = supportsFiles[endpointType ?? _endpoint ?? ''] ?? false;

  // Check if current model supports image attachments
  const currentModel = conversation?.model ?? null;
  const modelDescription = getModelDescription(currentModel);
  const supportsImageAttachment = modelDescription?.supportsImageAttachment ?? true;

  const isUploadDisabled = (disableInputs || endpointFileConfig?.disabled) ?? false;

  if (isAgents) {
    return <AttachFileMenu disabled={disableInputs} />;
  }
  if (endpointSupportsFiles && !isUploadDisabled) {
    return <AttachFile disabled={isUploadDisabled} />;
  }

  return null;
}

export default memo(AttachFileChat);
