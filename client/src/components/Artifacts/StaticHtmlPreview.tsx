import { memo, useEffect, useRef } from 'react';

/**
 * Simple static HTML preview using a sandboxed iframe
 * No external bundler needed - renders HTML directly
 */
export const StaticHtmlPreview = memo(function StaticHtmlPreview({
  files,
  fileKey,
}: {
  files: Record<string, string | { code: string } | undefined>;
  fileKey: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    // Get the HTML content from the artifact files
    const fileContent = files[fileKey];
    let htmlContent = typeof fileContent === 'string' ? fileContent : fileContent?.code || '';

    // Remove integrity attributes from script/link tags to prevent SRI validation errors
    // LLMs sometimes generate incorrect/outdated integrity hashes that block external resources
    htmlContent = htmlContent.replace(/\s+integrity=["'][^"']*["']/gi, '');
    htmlContent = htmlContent.replace(/\s+crossorigin=["'][^"']*["']/gi, '');

    // Create a blob URL for the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    // Set the iframe src to the blob URL
    iframe.src = blobUrl;

    // Cleanup: revoke the blob URL when component unmounts or content changes
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [files, fileKey]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: 'white',
      }}
      title="HTML Preview"
    />
  );
});
