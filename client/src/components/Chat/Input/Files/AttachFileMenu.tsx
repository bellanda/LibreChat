import * as Ariakit from '@ariakit/react';
import {
  AttachmentIcon,
  DropdownPopup,
  FileUpload,
  SharePointIcon,
  TooltipAnchor,
} from '@librechat/client';
import type { EndpointFileConfig } from 'librechat-data-provider';
import {
  EModelEndpoint,
  EToolResources,
  Providers,
  defaultAgentCapabilities,
  isDocumentSupportedProvider,
} from 'librechat-data-provider';
import {
  FileImageIcon,
  FileSearch,
  FileType2Icon,
  ImageUpIcon,
  Plus,
  TerminalSquareIcon,
} from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useToastContext } from '@librechat/client';
import type { MenuItemProps } from '~/common';
import { SharePointPickerDialog } from '~/components/SharePoint';
import { useGetStartupConfig } from '~/data-provider';
import {
  useAgentCapabilities,
  useAgentToolPermissions,
  useFileHandling,
  useGetAgentsConfig,
  useLocalize,
  useSmartUpload,
} from '~/hooks';
import useSharePointFileHandling from '~/hooks/Files/useSharePointFileHandling';
import { ephemeralAgentByConvoId, autoModeByConvoId } from '~/store/agents';
import { cn } from '~/utils';
import { SmartUploadErrorModal } from './SmartUploadErrorModal';

type FileUploadType = 'image' | 'document' | 'image_document' | 'image_document_video_audio';

interface AttachFileMenuProps {
  agentId?: string | null;
  endpoint?: string | null;
  disabled?: boolean | null;
  conversationId: string;
  endpointType?: EModelEndpoint;
  endpointFileConfig?: EndpointFileConfig;
  useResponsesApi?: boolean;
  currentModel?: string | null;
}

const AttachFileMenu = ({
  agentId,
  endpoint,
  disabled,
  endpointType,
  conversationId,
  endpointFileConfig,
  useResponsesApi,
  currentModel,
}: AttachFileMenuProps) => {
  const localize = useLocalize();
  const isUploadDisabled = disabled ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPopoverActive, setIsPopoverActive] = useState(false);
  const [ephemeralAgent, setEphemeralAgent] = useRecoilState(
    ephemeralAgentByConvoId(conversationId),
  );
  const [toolResource, setToolResource] = useState<EToolResources | undefined>();
  const [isAutoUpload, setIsAutoUpload] = useState(false);
  const [errorFile, setErrorFile] = useState<File | null>(null);
  const autoMode = useRecoilValue(autoModeByConvoId(conversationId));
  const { showToast } = useToastContext();
  const { handleFileChange } = useFileHandling();
  const { handleSharePointFiles, isProcessing, downloadProgress } = useSharePointFileHandling({
    toolResource,
  });

  const { agentsConfig } = useGetAgentsConfig();
  const { data: startupConfig } = useGetStartupConfig();
  const sharePointEnabled = startupConfig?.sharePointFilePickerEnabled;

  const [isSharePointDialogOpen, setIsSharePointDialogOpen] = useState(false);

  /** TODO: Ephemeral Agent Capabilities
   * Allow defining agent capabilities on a per-endpoint basis
   * Use definition for agents endpoint for ephemeral agents
   * */
  const capabilities = useAgentCapabilities(agentsConfig?.capabilities ?? defaultAgentCapabilities);

  const { fileSearchAllowedByAgent, codeAllowedByAgent, provider } = useAgentToolPermissions(
    agentId,
    ephemeralAgent,
  );

  const { detectUploadType } = useSmartUpload(
    endpointType,
    provider ?? endpoint ?? undefined,
    endpointFileConfig,
    currentModel,
  );

  const handleUploadClick = (fileType?: FileUploadType) => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = '';
    if (fileType === 'image') {
      inputRef.current.accept = 'image/*,.heif,.heic';
    } else if (fileType === 'document') {
      inputRef.current.accept = '.pdf,application/pdf';
    } else if (fileType === 'image_document') {
      inputRef.current.accept = 'image/*,.heif,.heic,.pdf,application/pdf';
    } else if (fileType === 'image_document_video_audio') {
      inputRef.current.accept = 'image/*,.heif,.heic,.pdf,application/pdf,video/*,audio/*';
    } else {
      inputRef.current.accept = '';
    }
    inputRef.current.click();
    inputRef.current.accept = '';
  };

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (autoMode && isAutoUpload && files?.length) {
        const file = files[0];
        const detection = detectUploadType(file);
        if (!detection.validation.valid) {
          setErrorFile(file);
          e.target.value = '';
          setIsAutoUpload(false);
          return;
        }
        if (detection.validation.warning) {
          showToast({
            message: detection.validation.warning,
            status: 'warning',
            duration: 5000,
          });
        }
        showToast({
          message: detection.reason,
          status: 'info',
          duration: 4000,
        });
        const suggested = detection.suggested;
        setToolResource(suggested);
        if (suggested === EToolResources.execute_code || suggested === EToolResources.file_search) {
          setEphemeralAgent((prev) => ({
            ...prev,
            [suggested]: true,
          }));
        }
        setIsAutoUpload(false);
        handleFileChange(e, suggested);
        return;
      }
      handleFileChange(e, toolResource);
    },
    [
      autoMode,
      isAutoUpload,
      detectUploadType,
      showToast,
      handleFileChange,
      toolResource,
      setEphemeralAgent,
    ],
  );

  const dropdownItems = useMemo(() => {
    const createMenuItems = (onAction: (fileType?: FileUploadType) => void) => {
      const items: MenuItemProps[] = [];

      if (autoMode) {
        items.push({
          label: localize('com_ui_upload_auto'),
          onClick: () => {
            setIsAutoUpload(true);
            setToolResource(undefined);
            onAction();
          },
          icon: <ImageUpIcon className="icon-md" />,
        });
      }

      let currentProvider = provider || endpoint;

      // This will be removed in a future PR to formally normalize Providers comparisons to be case insensitive
      if (currentProvider?.toLowerCase() === Providers.OPENROUTER) {
        currentProvider = Providers.OPENROUTER;
      }

      const isAzureWithResponsesApi =
        currentProvider === EModelEndpoint.azureOpenAI && useResponsesApi;

      if (
        isDocumentSupportedProvider(endpointType) ||
        isDocumentSupportedProvider(currentProvider) ||
        isAzureWithResponsesApi
      ) {
        items.push({
          label: localize('com_ui_upload_provider'),
          onClick: () => {
            setIsAutoUpload(false);
            setToolResource(undefined);
            let fileType: Exclude<FileUploadType, 'image' | 'document'> = 'image_document';
            if (currentProvider === Providers.GOOGLE || currentProvider === Providers.OPENROUTER) {
              fileType = 'image_document_video_audio';
            }
            onAction(fileType);
          },
          icon: <FileImageIcon className="icon-md" />,
        });
      } else {
        items.push({
          label: localize('com_ui_upload_image_input'),
          onClick: () => {
            setIsAutoUpload(false);
            setToolResource(undefined);
            onAction('image');
          },
          icon: <ImageUpIcon className="icon-md" />,
        });
      }

      if (capabilities.contextEnabled) {
        items.push({
          label: localize('com_ui_upload_ocr_text'),
          onClick: () => {
            setIsAutoUpload(false);
            setToolResource(EToolResources.context);
            onAction();
          },
          icon: <FileType2Icon className="icon-md" />,
        });
      }

      if (capabilities.fileSearchEnabled && fileSearchAllowedByAgent) {
        items.push({
          label: localize('com_ui_upload_file_search'),
          onClick: () => {
            setIsAutoUpload(false);
            setToolResource(EToolResources.file_search);
            setEphemeralAgent((prev) => ({
              ...prev,
              [EToolResources.file_search]: true,
            }));
            onAction();
          },
          icon: <FileSearch className="icon-md" />,
        });
      }

      if (capabilities.codeEnabled && codeAllowedByAgent) {
        items.push({
          label: localize('com_ui_upload_code_files'),
          onClick: () => {
            setIsAutoUpload(false);
            setToolResource(EToolResources.execute_code);
            setEphemeralAgent((prev) => ({
              ...prev,
              [EToolResources.execute_code]: true,
            }));
            onAction();
          },
          icon: <TerminalSquareIcon className="icon-md" />,
        });
      }

      return items;
    };

    const localItems = createMenuItems(handleUploadClick);

    if (sharePointEnabled) {
      const sharePointItems = createMenuItems(() => {
        setIsSharePointDialogOpen(true);
        // Note: toolResource will be set by the specific item clicked
      });
      localItems.push({
        label: localize('com_files_upload_sharepoint'),
        onClick: () => { },
        icon: <SharePointIcon className="icon-md" />,
        subItems: sharePointItems,
      });
      return localItems;
    }

    return localItems;
  }, [
    autoMode,
    localize,
    endpoint,
    provider,
    endpointType,
    capabilities,
    useResponsesApi,
    setToolResource,
    setEphemeralAgent,
    sharePointEnabled,
    codeAllowedByAgent,
    fileSearchAllowedByAgent,
    setIsSharePointDialogOpen,
    setIsAutoUpload,
  ]);

  const handleAutoUploadClick = useCallback(() => {
    if (!inputRef.current || isUploadDisabled) {
      return;
    }
    setIsAutoUpload(true);
    setToolResource(undefined);
    inputRef.current.value = '';
    inputRef.current.accept = 'image/*,.heif,.heic,.pdf,application/pdf,video/*,audio/*';
    inputRef.current.click();
    inputRef.current.accept = '';
  }, [isUploadDisabled]);

  const menuTrigger = (
    <TooltipAnchor
      render={
        <Ariakit.MenuButton
          disabled={isUploadDisabled}
          id="attach-file-menu-button"
          aria-label="Attach File Options"
          className={cn(
            'flex size-9 items-center justify-center rounded-full p-1 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50',
            isPopoverActive && 'bg-surface-hover',
          )}
        >
          <div className="flex w-full items-center justify-center gap-2">
            <AttachmentIcon />
          </div>
        </Ariakit.MenuButton>
      }
      id="attach-file-menu-button"
      description={localize('com_sidepanel_attach_files')}
      disabled={isUploadDisabled}
    />
  );

  const autoModeTrigger = (
    <TooltipAnchor
      render={
        <button
          type="button"
          disabled={isUploadDisabled}
          aria-label={localize('com_ui_upload_auto')}
          onClick={handleAutoUploadClick}
          className={cn(
            'flex size-9 items-center justify-center rounded-full p-1 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50',
          )}
        >
          <div className="flex w-full items-center justify-center gap-2">
            <Plus className="size-5" aria-hidden="true" />
          </div>
        </button>
      }
      id="attach-file-auto-button"
      description={localize('com_ui_upload_auto')}
      disabled={isUploadDisabled}
    />
  );

  const handleSharePointFilesSelected = async (sharePointFiles: any[]) => {
    try {
      await handleSharePointFiles(sharePointFiles);
      setIsSharePointDialogOpen(false);
    } catch (error) {
      console.error('SharePoint file processing error:', error);
    }
  };

  return (
    <>
      <FileUpload ref={inputRef} handleFileChange={onFileChange}>
        {autoMode ? (
          autoModeTrigger
        ) : (
          <DropdownPopup
            menuId="attach-file-menu"
            className="overflow-visible"
            isOpen={isPopoverActive}
            setIsOpen={setIsPopoverActive}
            modal={true}
            unmountOnHide={true}
            trigger={menuTrigger}
            items={dropdownItems}
            iconClassName="mr-0"
          />
        )}
      </FileUpload>
      <SharePointPickerDialog
        isOpen={isSharePointDialogOpen}
        onOpenChange={setIsSharePointDialogOpen}
        onFilesSelected={handleSharePointFilesSelected}
        isDownloading={isProcessing}
        downloadProgress={downloadProgress}
        maxSelectionCount={endpointFileConfig?.fileLimit}
      />
      {errorFile && (
        <SmartUploadErrorModal
          file={errorFile}
          errorMessage={detectUploadType(errorFile).validation.error ?? ''}
          onClose={() => setErrorFile(null)}
        />
      )}
    </>
  );
};

export default React.memo(AttachFileMenu);
