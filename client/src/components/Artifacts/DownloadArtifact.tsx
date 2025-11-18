import { Button } from '@librechat/client';
import { CircleCheckBig, Download } from 'lucide-react';
import { useState } from 'react';
import type { Artifact } from '~/common';
import { useLocalize } from '~/hooks';
import useArtifactProps from '~/hooks/Artifacts/useArtifactProps';
import { useCodeState } from '~/Providers/EditorContext';
import { cleanHtmlForRendering } from '~/utils/cleanHtml';

const DownloadArtifact = ({ artifact }: { artifact: Artifact }) => {
  const localize = useLocalize();
  const { currentCode } = useCodeState();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { fileKey: fileName } = useArtifactProps({ artifact });

  const handleDownload = () => {
    try {
      let content = currentCode ?? artifact.content ?? '';
      if (!content) {
        return;
      }

      // Clean HTML files to remove problematic integrity/crossorigin attributes
      if (fileName.endsWith('.html')) {
        content = cleanHtmlForRendering(content);
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleDownload}
      aria-label={localize('com_ui_download_artifact')}
    >
      {isDownloaded ? <CircleCheckBig size={16} /> : <Download size={16} />}
    </Button>
  );
};

export default DownloadArtifact;
