import { useToastContext } from '@librechat/client';
import { PermissionTypes, Permissions, apiBaseUrl } from 'librechat-data-provider';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import CodeBlock from '~/components/Messages/Content/CodeBlock';
import { useCodeOutputDownload, useFileDownload } from '~/data-provider';
import { useLocalize } from '~/hooks';
import useHasAccess from '~/hooks/Roles/useHasAccess';
import { useCodeBlockContext } from '~/Providers';
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

export const a: React.ElementType = memo(({ href, children }: TAnchorProps) => {
  const user = useRecoilValue(store.user);
  const messageAttachmentsMap = useRecoilValue(store.messageAttachmentsMap);
  const { showToast } = useToastContext();
  const localize = useLocalize();

  const resolvedHref = useMemo(() => {
    // 1) Handle AI generating raw sandbox paths like /mnt/data/filename.ext
    const mntDataMatch = href.match(/^\/?mnt\/data\/(.+)$/);
    if (mntDataMatch && mntDataMatch[1]) {
      const filenameMatch = mntDataMatch[1];
      for (const key in messageAttachmentsMap) {
        const attachments = messageAttachmentsMap[key];
        if (!attachments) continue;
        const file = attachments.find(
          (a) => a.filename === filenameMatch || a.filename?.includes(filenameMatch)
        );
        if (file && file.filepath) {
          return file.filepath;
        }
      }
    }

    // 2) Caso o modelo gere apenas o nome do arquivo (ex.: "Dashboard_Vendas_2026_02_03.pptx"
    //    ou sem extensão), tentamos resolver pelo mapa de anexos para transformar isso
    //    em um link de download.
    const isRelative = !href.startsWith('http') && !href.startsWith('/');
    if (isRelative) {
      for (const key in messageAttachmentsMap) {
        const attachments = messageAttachmentsMap[key];
        if (!attachments) continue;
        // Tenta match exato com filename
        let file =
          attachments.find(
            (a) => a.filename === href || a.filename?.toLowerCase() === href.toLowerCase(),
          ) ?? null;

        // Se não achou e o href não tem extensão, procura um attachment cujo filename
        // comece igual e termine com alguma extensão conhecida (ex.: .pptx)
        if (!file && !href.includes('.')) {
          file =
            attachments.find((a) =>
              (a.filename ?? '').toLowerCase().startsWith(href.toLowerCase()),
            ) ?? null;
        }

        if (file && file.filepath) {
          return file.filepath;
        }
      }
    }
    return href;
  }, [href, messageAttachmentsMap]);

  const isCodeDownloadLink = useMemo(
    () => resolvedHref.includes('/api/files/code/download/'),
    [resolvedHref],
  );

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
        const downloadName = resolvedHref.split('/').pop() || 'download';
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
