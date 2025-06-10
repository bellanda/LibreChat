import * as Ariakit from '@ariakit/react';
import { EModelEndpoint, EToolResources } from 'librechat-data-provider';
import { FileSearch, FileType2Icon, ImageUpIcon, TerminalSquareIcon } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import type { MenuItemProps } from '~/common';
import { AttachmentIcon, DropdownPopup, FileUpload, TooltipAnchor } from '~/components';
import { useGetEndpointsQuery } from '~/data-provider';
import { useFileHandling, useLocalize } from '~/hooks';
import { useModelDescriptions } from '~/hooks/useModelDescriptions';
import { useChatContext } from '~/Providers';
import { cn } from '~/utils';

interface AttachFileProps {
  disabled?: boolean | null;
}

const AttachFile = ({ disabled }: AttachFileProps) => {
  const localize = useLocalize();
  const { conversation } = useChatContext();
  const { getModelDescription } = useModelDescriptions();
  const isUploadDisabled = disabled ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPopoverActive, setIsPopoverActive] = useState(false);
  const [toolResource, setToolResource] = useState<EToolResources | undefined>();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { handleFileChange } = useFileHandling({
    overrideEndpoint: EModelEndpoint.agents,
  });

  /** TODO: Ephemeral Agent Capabilities
   * Allow defining agent capabilities on a per-endpoint basis
   * Use definition for agents endpoint for ephemeral agents
   * */
  const capabilities = useMemo(
    () => endpointsConfig?.[EModelEndpoint.agents]?.capabilities ?? [],
    [endpointsConfig],
  );

  // Check if current model supports image attachments
  const currentModel = conversation?.model ?? null;
  const modelDescription = getModelDescription(currentModel);
  const supportsImageAttachment = modelDescription?.supportsImageAttachment ?? true;

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
    const items: MenuItemProps[] = [];

    // Only show image upload option if model supports it
    if (supportsImageAttachment) {
      items.push({
        label: localize('com_ui_upload_image_input'),
        onClick: () => {
          setToolResource(undefined);
          handleUploadClick(true);
        },
        icon: <ImageUpIcon className="icon-md" />,
      });
    }

    // Always show basic file upload for RAG/file search, even if not explicitly in capabilities
    // This ensures file upload works independently of web search being active
    items.push({
      label: localize('com_ui_upload_file_search'),
      onClick: () => {
        setToolResource(EToolResources.file_search);
        handleUploadClick();
      },
      icon: <FileSearch className="icon-md" />,
    });

    if (capabilities.includes(EToolResources.ocr)) {
      items.push({
        label: localize('com_ui_upload_ocr_text'),
        onClick: () => {
          setToolResource(EToolResources.ocr);
          handleUploadClick();
        },
        icon: <FileType2Icon className="icon-md" />,
      });
    }

    if (capabilities.includes(EToolResources.execute_code)) {
      items.push({
        label: localize('com_ui_upload_code_files'),
        onClick: () => {
          setToolResource(EToolResources.execute_code);
          handleUploadClick();
        },
        icon: <TerminalSquareIcon className="icon-md" />,
      });
    }

    return items;
  }, [capabilities, localize, setToolResource, supportsImageAttachment]);

  const menuTrigger = (
    <TooltipAnchor
      render={
        <Ariakit.MenuButton
          disabled={isUploadDisabled}
          id="attach-file-menu-button"
          aria-label="Attach File Options"
          className={cn(
            'flex size-9 items-center justify-center rounded-full p-1 transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
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

  return (
    <FileUpload
      ref={inputRef}
      handleFileChange={(e) => {
        handleFileChange(e, toolResource);
      }}
    >
      <DropdownPopup
        menuId="attach-file-menu"
        isOpen={isPopoverActive}
        setIsOpen={setIsPopoverActive}
        modal={true}
        unmountOnHide={true}
        trigger={menuTrigger}
        items={dropdownItems}
        iconClassName="mr-0"
      />
    </FileUpload>
  );
};

export default React.memo(AttachFile);
