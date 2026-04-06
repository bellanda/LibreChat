import { useToastContext } from '@librechat/client';
import { PermissionTypes, Permissions, apiBaseUrl } from 'librechat-data-provider';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import CodeBlock from '~/components/Messages/Content/CodeBlock';
import { useCodeOutputDownload, useFileDownload } from '~/data-provider';
import { useLocalize } from '~/hooks';
import useHasAccess from '~/hooks/Roles/useHasAccess';
import { useCodeBlockContext, useMessageContext } from '~/Providers';
import store from '~/store';
import { handleDoubleClick } from '~/utils';

type TCodeProps = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const code: React.ElementType = memo(({ className, children }: TCodeProps) => {
  const canRunCode = useHasAccess({
    permissionType: PermissionTypes.RUN_CODE,
    permission: Permissions.USE,
  });
  const match = /language-(\w+)/.exec(className ?? '');
  const lang = match && match[1];
  const isMath = lang === 'math';
  const isMermaid = lang === 'mermaid';
  const isSingleLine = typeof children === 'string' && children.split('\n').length === 1;

  const { getNextIndex, resetCounter } = useCodeBlockContext();
  const blockIndex = useRef(getNextIndex(isMath || isMermaid || isSingleLine)).current;

  useEffect(() => {
    resetCounter();
  }, [children, resetCounter]);

  if (isMath) {
    return <>{children}</>;
  } else if (isMermaid) {
    const content = typeof children === 'string' ? children : String(children);
    return (
      <MermaidErrorBoundary code={content}>
        <Mermaid id={`mermaid-${blockIndex}`}>{content}</Mermaid>
      </MermaidErrorBoundary>
    );
  } else if (isSingleLine) {
    return (
      <code onDoubleClick={handleDoubleClick} className={className}>
        {children}
      </code>
    );
  } else {
    return (
      <CodeBlock
        lang={lang ?? 'text'}
        codeChildren={children}
        blockIndex={blockIndex}
        allowExecution={canRunCode}
      />
    );
  }
});

export const codeNoExecution: React.ElementType = memo(({ className, children }: TCodeProps) => {
  const match = /language-(\w+)/.exec(className ?? '');
  const lang = match && match[1];

  if (lang === 'math') {
    return children;
  } else if (lang === 'mermaid') {
    const content = typeof children === 'string' ? children : String(children);
    return <Mermaid>{content}</Mermaid>;
  } else if (typeof children === 'string' && children.split('\n').length === 1) {
    return (
      <code onDoubleClick={handleDoubleClick} className={className}>
        {children}
      </code>
    );
  } else {
    return <CodeBlock lang={lang ?? 'text'} codeChildren={children} allowExecution={false} />;
  }
});

type TAnchorProps = {
  href: string;
  children: React.ReactNode;
};

type AttachmentCandidate = {
  filename?: string | null;
  filepath?: string | null;
  expiresAt?: number;
};

function hasExtension(value: string) {
  return /\.[a-z0-9]{2,8}$/i.test(value);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isImageFilename(filename: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);
}

function isLikelyHomeLink(href: string) {
  if (!href) {
    return false;
  }

  try {
    const parsed = new URL(href, typeof window !== 'undefined' ? window.location.origin : undefined);
    if (!parsed.pathname || parsed.pathname === '/') {
      return !parsed.search && !parsed.hash;
    }
    return false;
  } catch {
    return false;
  }
}

function isLikelyInternalChatLink(href: string) {
  if (!href) {
    return false;
  }
  try {
    const parsed = new URL(href, typeof window !== 'undefined' ? window.location.origin : undefined);
    const pathname = parsed.pathname || '';
    return /^\/(c|chat|conversations)(\/|$)/i.test(pathname);
  } catch {
    return /^\/(c|chat|conversations)(\/|$)/i.test(href);
  }
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map((c) => extractTextFromChildren(c)).join(' ');
  }
  if (React.isValidElement(children)) {
    return extractTextFromChildren(children.props?.children);
  }
  return '';
}

function looksLikeDownloadAnchorText(text: string) {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  if (normalized.includes('baixar') || normalized.includes('download')) {
    return true;
  }
  return /\.(pptx|ppt|xlsx|xls|pdf|docx|doc|zip|csv)\b/i.test(normalized);
}

function isLikelyDownloadHref(href: string) {
  if (!href) {
    return false;
  }

  const raw = href.trim().toLowerCase();
  if (
    raw.startsWith('/mnt/data/') ||
    raw.includes('/api/files/code/download/') ||
    isLikelyHomeLink(raw) ||
    isLikelyInternalChatLink(raw)
  ) {
    return true;
  }

  try {
    const parsed = new URL(href, typeof window !== 'undefined' ? window.location.origin : undefined);
    const pathname = (parsed.pathname || '').toLowerCase();
    return (
      pathname.includes('/download/') ||
      /\.(pptx|ppt|xlsx|xls|pdf|docx|doc|zip|csv)$/i.test(pathname)
    );
  } catch {
    return /\.(pptx|ppt|xlsx|xls|pdf|docx|doc|zip|csv)$/i.test(raw);
  }
}

function filenameWithoutExtension(value: string) {
  const trimmed = value.trim();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot <= 0) {
    return trimmed;
  }
  return trimmed.slice(0, lastDot);
}

function findBestAttachmentByRef(
  ref: string,
  attachments: AttachmentCandidate[],
): AttachmentCandidate | null {
  if (!ref) {
    return null;
  }

  const target = normalize(ref);
  const mntDataMatch = target.match(/^\/?mnt\/data\/(.+)$/);
  const mntFilename = mntDataMatch?.[1] ?? '';

  let best: AttachmentCandidate | null = null;
  let bestScore = -1;

  for (const attachment of attachments) {
    const filename = normalize(String(attachment.filename ?? ''));
    const filepath = normalize(String(attachment.filepath ?? ''));
    if (!filename && !filepath) {
      continue;
    }

    let score = 0;
    if (filepath && filepath === target) {
      score = 100;
    } else if (filename && filename === target) {
      score = 95;
    } else if (mntFilename && filename && filename === mntFilename) {
      score = 90;
    } else if (!hasExtension(target) && filename && filenameWithoutExtension(filename) === target) {
      score = 80;
    }

    if (score === 0) {
      continue;
    }

    if (!best || score > bestScore) {
      best = attachment;
      bestScore = score;
      continue;
    }

    if (score === bestScore) {
      const bestExpires = typeof best.expiresAt === 'number' ? best.expiresAt : 0;
      const currentExpires = typeof attachment.expiresAt === 'number' ? attachment.expiresAt : 0;
      if (currentExpires > bestExpires) {
        best = attachment;
      }
    }
  }

  return best;
}

export const a: React.ElementType = memo(({ href, children }: TAnchorProps) => {
  const user = useRecoilValue(store.user);
  const messageAttachmentsMap = useRecoilValue(store.messageAttachmentsMap);
  const { messageId, attachments: contextAttachments } = useMessageContext();
  const { showToast } = useToastContext();
  const localize = useLocalize();

  const scopedAttachments = useMemo(() => {
    const contextCandidates = (contextAttachments ?? []).filter((a) => a?.filepath || a?.filename);
    if (contextCandidates.length > 0) {
      return contextCandidates.map((attachment) => ({
        filename: attachment.filename,
        filepath: attachment.filepath,
        expiresAt:
          'expiresAt' in attachment && typeof attachment.expiresAt === 'number'
            ? attachment.expiresAt
            : 0,
      }));
    }

    const currentMessageAttachments = messageAttachmentsMap[messageId ?? ''] ?? [];
    const source = currentMessageAttachments.length
      ? currentMessageAttachments
      : Object.values(messageAttachmentsMap ?? {}).flatMap((attachments) => attachments ?? []);

    return source.map((attachment) => ({
      filename: attachment.filename,
      filepath: attachment.filepath,
      expiresAt:
        'expiresAt' in attachment && typeof attachment.expiresAt === 'number'
          ? attachment.expiresAt
          : 0,
    }));
  }, [contextAttachments, messageAttachmentsMap, messageId]);

  const preferredDownloadAttachment = useMemo(() => {
    const withFilepath = scopedAttachments.filter((a) => !!a.filepath);
    const nonImageFiles = withFilepath.filter((a) => !isImageFilename(String(a.filename ?? '')));
    const source = nonImageFiles.length > 0 ? nonImageFiles : withFilepath;
    if (source.length === 0) {
      return null;
    }

    return source.reduce((latest, current) => {
      const latestTs = typeof latest.expiresAt === 'number' ? latest.expiresAt : 0;
      const currentTs = typeof current.expiresAt === 'number' ? current.expiresAt : 0;
      return currentTs > latestTs ? current : latest;
    });
  }, [scopedAttachments]);
  const anchorText = useMemo(() => extractTextFromChildren(children), [children]);
  const hasDownloadableAttachment = useMemo(
    () => scopedAttachments.some((a) => !isImageFilename(String(a.filename ?? ''))),
    [scopedAttachments],
  );

  const resolvedHref = useMemo(() => {
    // 1) Handle AI generating raw sandbox paths like /mnt/data/filename.ext
    const mntDataMatch = href.match(/^\/?mnt\/data\/(.+)$/);
    if (mntDataMatch?.[1]) {
      const file = findBestAttachmentByRef(href, scopedAttachments);
      if (file?.filepath) {
        return file.filepath;
      }
    }

    // 2) Caso o modelo gere apenas o nome do arquivo (ex.: "Dashboard_Vendas_2026_02_03.pptx"
    //    ou sem extensão), tentamos resolver pelo mapa de anexos para transformar isso
    //    em um link de download.
    const isRelative = !href.startsWith('http') && !href.startsWith('/');
    if (isRelative) {
      const file = findBestAttachmentByRef(href, scopedAttachments);
      if (file?.filepath) {
        return file.filepath;
      }
    }

    // Some models output a placeholder link to platform home (e.g. localhost root)
    // instead of the real artifact URL. If we have a generated attachment in this
    // same message, prefer it over opening the home page.
    if (isLikelyHomeLink(href) && preferredDownloadAttachment?.filepath) {
      return preferredDownloadAttachment.filepath;
    }

    // Prevent model hallucinated links to old chats when this message already
    // contains a generated file attachment for download.
    if (
      isLikelyInternalChatLink(href) &&
      preferredDownloadAttachment?.filepath &&
      looksLikeDownloadAnchorText(anchorText)
    ) {
      return preferredDownloadAttachment.filepath;
    }
    return href;
  }, [href, scopedAttachments, preferredDownloadAttachment, anchorText]);
  const shouldDisableUnsafeLink = useMemo(
    () =>
      (isLikelyHomeLink(href) || isLikelyInternalChatLink(href)) &&
      looksLikeDownloadAnchorText(anchorText) &&
      !preferredDownloadAttachment?.filepath,
    [href, anchorText, preferredDownloadAttachment],
  );
  const shouldDisableModelDownloadLink = useMemo(
    () =>
      hasDownloadableAttachment &&
      (looksLikeDownloadAnchorText(anchorText) || isLikelyDownloadHref(href)),
    [hasDownloadableAttachment, anchorText, href],
  );

  const isCodeDownloadLink = useMemo(
    () => resolvedHref.includes('/api/files/code/download/'),
    [resolvedHref],
  );
  const codeOutputFilename = useMemo(() => {
    if (!isCodeDownloadLink) {
      return '';
    }
    const matched = findBestAttachmentByRef(resolvedHref, scopedAttachments);
    return matched?.filename ? String(matched.filename) : '';
  }, [isCodeDownloadLink, scopedAttachments, resolvedHref]);

  const {
    file_id = '',
    filename = '',
    filepath,
  } = useMemo(() => {
    const pattern = new RegExp(`(?:files|outputs)/${user?.id}/([^\\s]+)`);
    const match = resolvedHref.match(pattern);
    if (match && match[0]) {
      const path = match[0];
      const parts = path.split('/');
      const name = parts.pop();
      const file_id = parts.pop();
      return { file_id, filename: name, filepath: path };
    }
    return { file_id: '', filename: '', filepath: '' };
  }, [user?.id, resolvedHref]);

  const { refetch: downloadFile } = useFileDownload(user?.id ?? '', file_id);
  const { refetch: downloadCodeOutput } = useCodeOutputDownload(isCodeDownloadLink ? resolvedHref : '');
  const linkClasses =
    'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150 underline-offset-2 hover:underline';

  if (!file_id || !filename) {
    // Canonical download flow for generated files must be the attachment card,
    // not markdown links authored by the model.
    if (shouldDisableModelDownloadLink) {
      return <span>{children}</span>;
    }
    if (shouldDisableUnsafeLink) {
      return <span>{children}</span>;
    }
    if (!isCodeDownloadLink) {
      return (
        <a href={resolvedHref} className={linkClasses} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }

    const handleCodeDownload = async (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      try {
        const stream = await downloadCodeOutput();
        if (stream.data == null || stream.data === '') {
          console.error('Error downloading file: No data found');
          showToast({
            status: 'error',
            message: localize('com_ui_download_error'),
          });
          return;
        }
        const downloadName = codeOutputFilename || resolvedHref.split('/').pop() || 'download';
        const link = document.createElement('a');
        link.href = stream.data;
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(stream.data);
      } catch (error) {
        console.error('Error downloading code output file:', error);
      }
    };

    return (
      <a
        href={resolvedHref}
        onClick={handleCodeDownload}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  const handleDownload = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      const stream = await downloadFile();
      if (stream.data == null || stream.data === '') {
        console.error('Error downloading file: No data found');
        showToast({
          status: 'error',
          message: localize('com_ui_download_error'),
        });
        return;
      }
      const link = document.createElement('a');
      link.href = stream.data;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(stream.data);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const domainServerBaseUrl = `${apiBaseUrl()}/api`;

  return (
    <a
      href={
        filepath?.startsWith('files/')
          ? `${domainServerBaseUrl}/${filepath}`
          : `${domainServerBaseUrl}/files/${filepath}`
      }
      onClick={handleDownload}
      className={linkClasses}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
});

type TParagraphProps = {
  children: React.ReactNode;
};

export const p: React.ElementType = memo(({ children }: TParagraphProps) => {
  return <p className="mb-4 leading-7 whitespace-pre-wrap">{children}</p>;
});

type TImageProps = {
  src?: string;
  alt?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const img: React.ElementType = memo(({ src, alt, title, className, style }: TImageProps) => {
  // Get the base URL from the API endpoints
  const baseURL = apiBaseUrl();

  // If src starts with /images/, prepend the base URL
  const fixedSrc = useMemo(() => {
    if (!src) return src;

    // If it's already an absolute URL or doesn't start with /images/, return as is
    if (src.startsWith('http') || src.startsWith('data:') || !src.startsWith('/images/')) {
      return src;
    }

    // Prepend base URL to the image path
    return `${baseURL}${src}`;
  }, [src, baseURL]);

  return <img src={fixedSrc} alt={alt} title={title} className={className} style={style} />;
});
