import { memo, useEffect, useRef } from 'react';
import { cleanHtmlForRendering } from '~/utils/cleanHtml';

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

    // Clean HTML to prevent SRI validation errors and CORS issues
    htmlContent = cleanHtmlForRendering(htmlContent);

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
