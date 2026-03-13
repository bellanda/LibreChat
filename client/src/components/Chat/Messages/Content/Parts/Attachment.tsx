import { memo, useState, useEffect } from 'react';
import { imageExtRegex, Tools } from 'librechat-data-provider';
import type { TAttachment, TFile, TAttachmentMetadata } from 'librechat-data-provider';
import FileContainer from '~/components/Chat/Input/Files/FileContainer';
import Image from '~/components/Chat/Messages/Content/Image';
import { useAttachmentLink } from './LogLink';
import { cn } from '~/utils';

const FileAttachment = memo(({ attachment }: { attachment: Partial<TAttachment> }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { handleDownload } = useAttachmentLink({
    href: attachment.filepath ?? '',
    filename: attachment.filename ?? '',
  });
  const extension = attachment.filename?.split('.').pop();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!attachment.filepath) {
    return null;
  }
  return (
    <div
      className={cn(
        'file-attachment-container',
        'transition-all duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
      style={{
        transformOrigin: 'center top',
        willChange: 'opacity, transform',
        WebkitFontSmoothing: 'subpixel-antialiased',
      }}
    >
      <FileContainer
        file={attachment}
        onClick={handleDownload}
        overrideType={extension}
        containerClassName="max-w-fit"
        buttonClassName="bg-surface-secondary hover:cursor-pointer hover:bg-surface-hover active:bg-surface-secondary focus:bg-surface-hover hover:border-border-heavy active:border-border-heavy"
      />
    </div>
  );
});

const ImageAttachment = memo(({ attachment }: { attachment: TAttachment }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { width, height, filepath = null } = attachment as TFile & TAttachmentMetadata;

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [attachment]);

  return (
    <div
      className={cn(
        'image-attachment-container',
        'transition-all duration-500 ease-out',
        isLoaded ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0',
      )}
      style={{
        transformOrigin: 'center top',
        willChange: 'opacity, transform',
        WebkitFontSmoothing: 'subpixel-antialiased',
      }}
    >
      <Image
        altText={attachment.filename || 'attachment image'}
        imagePath={filepath ?? ''}
        height={height ?? 0}
        width={width ?? 0}
        className="mb-4"
      />
    </div>
  );
});

export default function Attachment({ attachment }: { attachment?: TAttachment }) {
  if (!attachment) {
    return null;
  }
  if (attachment.type === Tools.web_search) {
    return null;
  }

  const { width, height, filepath = null } = attachment as TFile & TAttachmentMetadata;
  const isImage = attachment.filename
    ? imageExtRegex.test(attachment.filename) && width != null && height != null && filepath != null
    : false;

  if (isImage) {
    return <ImageAttachment attachment={attachment} />;
  } else if (!attachment.filepath) {
    return null;
  }
  return <FileAttachment attachment={attachment} />;
}

export function AttachmentGroup({ attachments }: { attachments?: TAttachment[] }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const fileAttachments: TAttachment[] = [];
  const imageAttachments: TAttachment[] = [];

  // Regra simples:
  // - Se houver pelo menos um PPTX nesta lista de anexos, priorizamos o PPTX
  //   e escondemos as imagens geradas na mesma execução, para não poluir a UI.
  const hasPresentation = attachments.some((attachment) =>
    (attachment.filename ?? '').toLowerCase().endsWith('.pptx'),
  );

  const seen = new Set<string>();

  attachments.forEach((attachment) => {
    const key = `${attachment.filepath ?? ''}:${attachment.filename ?? ''}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    const { width, height, filepath = null } = attachment as TFile & TAttachmentMetadata;
    const isImage = attachment.filename
      ? imageExtRegex.test(attachment.filename) &&
        width != null &&
        height != null &&
        filepath != null
      : false;

    // Quando há PPTX, ignoramos imagens geradas nessa execução e deixamos
    // apenas arquivos de documento (como a apresentação final).
    if (hasPresentation && isImage) {
      return;
    }

    if (isImage) {
      imageAttachments.push(attachment);
    } else if (attachment.type !== Tools.web_search) {
      fileAttachments.push(attachment);
    }
  });

  // Normalização simples de nome de arquivo:
  // - Caso especial: se existir uma apresentação (hasPresentation) e houver
  //   exatamente um arquivo "genérico" sem extensão visível, adicionamos ".pptx"
  //   para evitar que o usuário receba um arquivo sem extensão.
  const normalizedFileAttachments: TAttachment[] = (() => {
    if (!hasPresentation) {
      return fileAttachments;
    }

    // Quando há apresentação, pode vir duplicada:
    // - uma entrada "genérica" (sem extensão ou com nome simples)
    // - outra com o nome final correto (ex.: Dashboard_Vendas_2026_02_03.pptx)
    // Mantemos apenas 1 PPTX por nome e priorizamos o que já estiver com extensão.
    const byName = new Map<string, TAttachment>();

    for (const attachment of fileAttachments) {
      const rawName = attachment.filename ?? '';
      const lower = rawName.toLowerCase();
      const isPptx = lower.endsWith('.pptx');

      if (!isPptx) {
        // Arquivos não-PPTX seguem intactos
        byName.set(`${rawName}:${attachment.filepath ?? ''}`, attachment);
        continue;
      }

      // Para PPTX, deduplicamos apenas por filename (case-insensitive)
      const key = lower;
      if (!byName.has(key)) {
        byName.set(key, attachment);
        continue;
      }

      const existing = byName.get(key);
      // Se o existente não tem extensão (caso extremo) e o novo tem, preferimos o novo
      if (existing && !(existing.filename ?? '').includes('.') && rawName.includes('.')) {
        byName.set(key, attachment);
      }
    }

    return Array.from(byName.values());
  })();

  return (
    <>
      {normalizedFileAttachments.length > 0 && (
        <div className="my-2 flex flex-wrap items-center gap-2.5">
          {normalizedFileAttachments.map((attachment, index) =>
            attachment.filepath ? (
              <FileAttachment attachment={attachment} key={`file-${index}`} />
            ) : null,
          )}
        </div>
      )}
      {imageAttachments.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center">
          {imageAttachments.map((attachment, index) => (
            <ImageAttachment attachment={attachment} key={`image-${index}`} />
          ))}
        </div>
      )}
    </>
  );
}
