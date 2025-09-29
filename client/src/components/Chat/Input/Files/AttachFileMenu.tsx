import * as Ariakit from '@ariakit/react';
import {
  AttachmentIcon,
  DropdownPopup,
  FileUpload,
  SharePointIcon,
  TooltipAnchor,
} from '@librechat/client';
import type { EndpointFileConfig } from 'librechat-data-provider';
import { EModelEndpoint, EToolResources, defaultAgentCapabilities } from 'librechat-data-provider';
import { FileSearch, FileType2Icon, ImageUpIcon, TerminalSquareIcon } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import type { MenuItemProps } from '~/common';
import { SharePointPickerDialog } from '~/components/SharePoint';
import { useGetStartupConfig } from '~/data-provider';
import {
  useAgentCapabilities,
  useAgentToolPermissions,
  useFileHandling,
  useGetAgentsConfig,
  useLocalize,
} from '~/hooks';
import useSharePointFileHandling from '~/hooks/Files/useSharePointFileHandling';
import { useChatContext } from '~/Providers';
import { ephemeralAgentByConvoId } from '~/store';
import { cn } from '~/utils';

interface AttachFileMenuProps {
  conversationId: string;
  agentId?: string | null;
  disabled?: boolean | null;
  endpointFileConfig?: EndpointFileConfig;
}

const AttachFileMenu = ({
  agentId,
  disabled,
  conversationId,
  endpointFileConfig,
}: AttachFileMenuProps) => {
  const localize = useLocalize();
  const { conversation } = useChatContext();
  const isUploadDisabled = disabled ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPopoverActive, setIsPopoverActive] = useState(false);
  const [ephemeralAgent, setEphemeralAgent] = useRecoilState(
    ephemeralAgentByConvoId(conversationId),
  );
  const [toolResource, setToolResource] = useState<EToolResources | undefined>();
  const { handleFileChange } = useFileHandling({
    overrideEndpoint: EModelEndpoint.agents,
    overrideEndpointFileConfig: endpointFileConfig,
  });
  const { handleSharePointFiles, isProcessing, downloadProgress } = useSharePointFileHandling({
    overrideEndpoint: EModelEndpoint.agents,
    overrideEndpointFileConfig: endpointFileConfig,
    toolResource,
  });
  const { data: startupConfig } = useGetStartupConfig();
  const sharePointEnabled = startupConfig?.sharePointFilePickerEnabled;

  const [isSharePointDialogOpen, setIsSharePointDialogOpen] = useState(false);
  const { agentsConfig } = useGetAgentsConfig();
  /** TODO: Ephemeral Agent Capabilities
   * Allow defining agent capabilities on a per-endpoint basis
   * Use definition for agents endpoint for ephemeral agents
   * */
  const capabilities = useAgentCapabilities(agentsConfig?.capabilities ?? defaultAgentCapabilities);

  const { fileSearchAllowedByAgent, codeAllowedByAgent } = useAgentToolPermissions(
    agentId,
    ephemeralAgent,
  );

  const handleUploadClick = (isImage?: boolean) => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = '';
    inputRef.current.accept = isImage === true ? 'image/*' : '';
    inputRef.current.click();
    inputRef.current.accept = '';
  };

  const dropdownItems = useMemo(() => {
    const createMenuItems = (onAction: (isImage?: boolean) => void) => {
      const items: MenuItemProps[] = [
        {
          label: localize('com_ui_upload_image_input'),
          onClick: () => {
            setToolResource(undefined);
            onAction(true);
          },
          icon: <ImageUpIcon className="icon-md" />,
        },
      ];

      if (capabilities.contextEnabled) {
        items.push({
          label: localize('com_ui_upload_ocr_text'),
          onClick: () => {
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
        onClick: () => {},
        icon: <SharePointIcon className="icon-md" />,
        subItems: sharePointItems,
      });
      return localItems;
    }

    return localItems;
  }, [
    capabilities,
    localize,
    setToolResource,
    setEphemeralAgent,
    sharePointEnabled,
    codeAllowedByAgent,
    fileSearchAllowedByAgent,
    setIsSharePointDialogOpen,
  ]);

  const menuTrigger = (
    <TooltipAnchor
      render={
        <Ariakit.MenuButton
          disabled={isUploadDisabled}
          id="attach-file-menu-button"
          aria-label="Attach File Options"
          className={cn(
            'flex justify-center items-center p-1 rounded-full transition-colors size-9 hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
          )}
        >
          <div className="flex gap-2 justify-center items-center w-full">
            <AttachmentIcon />
          </div>
        </Ariakit.MenuButton>
      }
      id="attach-file-menu-button"
      description={localize('com_sidepanel_attach_files')}
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
      <FileUpload
        ref={inputRef}
        handleFileChange={(e) => {
          handleFileChange(e, toolResource);
        }}
      >
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
      </FileUpload>
      <SharePointPickerDialog
        isOpen={isSharePointDialogOpen}
        onOpenChange={setIsSharePointDialogOpen}
        onFilesSelected={handleSharePointFilesSelected}
        isDownloading={isProcessing}
        downloadProgress={downloadProgress}
        maxSelectionCount={endpointFileConfig?.fileLimit}
      />
    </>
  );
};

export default React.memo(AttachFileMenu);
