import type { CodeEditorRef, SandpackPreviewRef } from '@codesandbox/sandpack-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useRef } from 'react';
import type { Artifact } from '~/common';
import { useGetStartupConfig } from '~/data-provider';
import useArtifactProps from '~/hooks/Artifacts/useArtifactProps';
import { useAutoScroll } from '~/hooks/Artifacts/useAutoScroll';
import { useArtifactsContext, useEditorContext } from '~/Providers';
import { cn } from '~/utils';
import { ArtifactCodeEditor } from './ArtifactCodeEditor';
import { ArtifactPreview } from './ArtifactPreview';

export default function ArtifactTabs({
  artifact,
  editorRef,
  previewRef,
}: {
  artifact: Artifact;
  editorRef: React.MutableRefObject<CodeEditorRef>;
  previewRef: React.MutableRefObject<SandpackPreviewRef>;
}) {
  const { isSubmitting } = useArtifactsContext();
  const { currentCode, setCurrentCode } = useEditorContext();
  const { data: startupConfig } = useGetStartupConfig();
  const lastIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (artifact.id !== lastIdRef.current) {
      setCurrentCode(undefined);
    }
    lastIdRef.current = artifact.id;
  }, [setCurrentCode, artifact.id]);

  const content = artifact.content ?? '';
  const contentRef = useRef<HTMLDivElement>(null);
  useAutoScroll({ ref: contentRef, content, isSubmitting });
  const { files, fileKey, template, sharedProps } = useArtifactProps({ artifact });
  return (
    <>
      <Tabs.Content
        ref={contentRef}
        value="code"
        id="artifacts-code"
        className={cn('flex-grow overflow-auto')}
        tabIndex={-1}
      >
        <ArtifactCodeEditor
          files={files}
          fileKey={fileKey}
          template={template}
          artifact={artifact}
          editorRef={editorRef}
          sharedProps={sharedProps}
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="flex-grow overflow-auto" tabIndex={-1}>
        <ArtifactPreview
          files={files}
          fileKey={fileKey}
          template={template}
          previewRef={previewRef}
          sharedProps={sharedProps}
          currentCode={currentCode}
          startupConfig={startupConfig}
        />
      </Tabs.Content>
    </>
  );
}
