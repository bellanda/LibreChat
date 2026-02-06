import { useQueryClient } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';
import {
  AgentCapabilities,
  defaultAgentCapabilities,
  EModelEndpoint,
  EToolResources,
  getEndpointFileConfig,
  inferMimeType,
  isDocumentSupportedProvider,
  mergeFileConfig,
  QueryKeys,
} from 'librechat-data-provider';
import { useCallback, useMemo } from 'react';
import type { EndpointFileConfig } from 'librechat-data-provider';
import { fileConfig } from 'librechat-data-provider';
import useLocalize from '../useLocalize';
import { useModelDescriptions } from '../useModelDescriptions';
import type { ModelDescription } from '~/types/model';

const megabyte = 1024 * 1024;

export type SmartUploadDetection = {
  validation: { valid: boolean; warning?: string; error?: string };
  reason: string;
  suggested: EToolResources | undefined;
};

/**
 * Check if a model supports multimodal files (PDF, images, etc.) via API
 * Models with multimodal=true can send non-text files directly to the provider
 */
function isMultimodalModel(modelDescription: ModelDescription | null): boolean {
  if (!modelDescription) {
    return false;
  }

  // Check if model has multimodal characteristic set to true
  return modelDescription.characteristics?.multimodal === true;
}

/**
 * Hook for "smart" upload detection: infers the best tool (file_search, execute_code, context)
 * based on file type and endpoint capabilities, and validates against config.
 */
export function useSmartUpload(
  endpointType?: EModelEndpoint | null,
  endpoint?: string | null,
  endpointFileConfigProp?: EndpointFileConfig | null,
  currentModel?: string | null,
) {
  const queryClient = useQueryClient();
  const localize = useLocalize();
  const { getModelDescription } = useModelDescriptions();

  const config = useMemo(() => {
    const cfg = queryClient.getQueryData<t.FileConfig>([QueryKeys.fileConfig]);
    const mergedCfg = mergeFileConfig(cfg);
    const endpointsConfig = queryClient.getQueryData<t.TEndpointsConfig>([QueryKeys.endpoints]);
    const agentsConfig = endpointsConfig?.[EModelEndpoint.agents];
    const capabilities = agentsConfig?.capabilities ?? defaultAgentCapabilities;
    const endpointCfg =
      endpointFileConfigProp ??
      getEndpointFileConfig({
        fileConfig: mergedCfg,
        endpoint: endpoint ?? 'default',
        endpointType: endpointType ?? undefined,
      });

    return {
      endpointCfg,
      capabilities,
      fileConfig: mergedCfg,
    };
  }, [queryClient, endpointType, endpoint, endpointFileConfigProp]);

  const detectUploadType = useCallback(
    (file: File): SmartUploadDetection => {
      const { endpointCfg, capabilities } = config;
      const { fileSizeLimit, supportedMimeTypes, disabled } = endpointCfg ?? fileConfig.endpoints.default;

      if (disabled === true) {
        return {
          validation: { valid: false, error: localize('com_ui_attach_error_disabled') },
          reason: '',
          suggested: undefined,
        };
      }

      const mimeType = inferMimeType(file.name, file.type);
      if (!mimeType) {
        return {
          validation: { valid: false, error: `Unable to determine file type for: ${file.name}` },
          reason: '',
          suggested: undefined,
        };
      }

      if (fileSizeLimit && file.size >= fileSizeLimit) {
        return {
          validation: { valid: false, error: `File size exceeds ${fileSizeLimit / megabyte} MB.` },
          reason: '',
          suggested: undefined,
        };
      }

      const isImage = mimeType.startsWith('image/');
      const isPdf = mimeType === 'application/pdf';
      const isCodeOrData =
        /\.(py|js|ts|json|csv|xlsx?|xls|ipynb|parquet|feather|pkl|pickle|h5|hdf5|sqlite|db)$/i.test(file.name) ||
        mimeType.includes('json') ||
        mimeType.includes('csv') ||
        mimeType.includes('spreadsheet') ||
        mimeType.includes('excel');

      const fileSearchEnabled = capabilities.includes(AgentCapabilities.file_search);
      const codeEnabled = capabilities.includes(AgentCapabilities.execute_code);
      const contextEnabled = capabilities.includes(AgentCapabilities.context);

      const currentProvider = endpoint ?? 'default';
      const supportsDocuments = isDocumentSupportedProvider(endpointType) || isDocumentSupportedProvider(currentProvider);

      // Check if current model is multimodal (can send non-text files directly to provider)
      const modelDescription = currentModel ? getModelDescription(currentModel) : null;
      const isMultimodal = isMultimodalModel(modelDescription);

      const defaultMimeTypes = endpointCfg?.supportedMimeTypes ?? supportedMimeTypes ?? [];
      const isSupportedType = fileConfig.checkType(mimeType, defaultMimeTypes);

      if (!isSupportedType) {
        return {
          validation: { valid: false, error: `Unsupported file type: ${mimeType}` },
          reason: '',
          suggested: undefined,
        };
      }

      if (isCodeOrData && codeEnabled) {
        return {
          validation: { valid: true },
          reason: localize('com_ui_upload_file_search') ?? 'Code/Data file → Code Interpreter',
          suggested: EToolResources.execute_code,
        };
      }

      // If PDF/image and model is multimodal, send directly to provider (don't use RAG)
      if ((isPdf || isImage) && isMultimodal && supportsDocuments) {
        return {
          validation: { valid: true },
          reason: localize('com_ui_upload_provider') ?? 'File → Provider',
          suggested: undefined,
        };
      }

      // If PDF/image and model is not multimodal, use RAG/file_search
      if ((isPdf || isImage) && fileSearchEnabled && supportsDocuments && !isMultimodal) {
        return {
          validation: { valid: true },
          reason: localize('com_ui_upload_file_search') ?? 'Document → File Search',
          suggested: EToolResources.file_search,
        };
      }

      if (contextEnabled && (isImage || isPdf)) {
        const contextMimeTypes = [
          ...(config.fileConfig?.text?.supportedMimeTypes ?? []),
          ...(config.fileConfig?.ocr?.supportedMimeTypes ?? []),
          ...(config.fileConfig?.stt?.supportedMimeTypes ?? []),
        ];
        if (fileConfig.checkType(mimeType, contextMimeTypes)) {
          return {
            validation: { valid: true },
            reason: localize('com_ui_upload_ocr_text') ?? 'Document → OCR/Context',
            suggested: EToolResources.context,
          };
        }
      }

      // Fallback: if image and provider supports documents, send to provider
      if (isImage && supportsDocuments) {
        return {
          validation: { valid: true },
          reason: localize('com_ui_upload_provider') ?? 'Image → Provider',
          suggested: undefined,
        };
      }

      return {
        validation: { valid: true },
        reason: localize('com_ui_upload_provider') ?? 'File → Provider',
        suggested: undefined,
      };
    },
    [config, localize, currentModel, getModelDescription],
  );

  return { detectUploadType };
}
