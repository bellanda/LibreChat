import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import supersub from 'remark-supersub';
import type { Pluggable } from 'unified';
import { Artifact, artifactPlugin } from '~/components/Artifacts/Artifact';
import {
  MCPUIResource,
  MCPUIResourceCarousel,
  mcpUIResourcePlugin,
} from '~/components/MCPUIResource';
import { unicodeCitation } from '~/components/Web';
import { Citation, CompositeCitation, HighlightedText } from '~/components/Web/Citation';
import { ArtifactProvider, CodeBlockProvider, useMessageContext } from '~/Providers';
import store from '~/store';
import { hasBrazilianCurrency, langSubset, preprocessLaTeX } from '~/utils';
import { a, code, img, p } from './MarkdownComponents';
import MarkdownErrorBoundary from './MarkdownErrorBoundary';

type TContentProps = {
  content: string;
  isLatestMessage: boolean;
};

const Markdown = memo(({ content = '', isLatestMessage }: TContentProps) => {
  const LaTeXParsing = useRecoilValue<boolean>(store.LaTeXParsing);
  const { hideThinkingIndicator = false } = useMessageContext();
  const isInitializing = content === '';

  const currentContent = useMemo(() => {
    if (isInitializing) {
      return '';
    }
    return LaTeXParsing ? preprocessLaTeX(content) : content;
  }, [content, LaTeXParsing, isInitializing]);

  const rehypePlugins = useMemo(
    () => [
      [rehypeKatex],
      [
        rehypeHighlight,
        {
          detect: true,
          ignoreMissing: true,
          subset: langSubset,
        },
      ],
    ],
    [],
  );

  // Conditionally disable singleDollarTextMath if Brazilian currency is detected
  const shouldDisableSingleDollar = hasBrazilianCurrency(content);

  const remarkPlugins: Pluggable[] = [
    supersub,
    remarkGfm,
    remarkDirective,
    artifactPlugin,
    [remarkMath, { singleDollarTextMath: false }],
    unicodeCitation,
    mcpUIResourcePlugin,
  ];

  if (isInitializing) {
    if (hideThinkingIndicator) {
      return null;
    }
    return (
      <div className="absolute">
        <p className="relative">
          <span className={isLatestMessage ? 'result-thinking' : ''} />
        </p>
      </div>
    );
  }

  return (
    <MarkdownErrorBoundary content={content} codeExecution={true}>
      <ArtifactProvider>
        <CodeBlockProvider>
          <ReactMarkdown
            /** @ts-ignore */
            remarkPlugins={remarkPlugins}
            /* @ts-ignore */
            rehypePlugins={rehypePlugins}
            components={
              {
                code,
                a,
                p,
                img,
                artifact: Artifact,
                citation: Citation,
                'highlighted-text': HighlightedText,
                'composite-citation': CompositeCitation,
                'mcp-ui-resource': MCPUIResource,
                'mcp-ui-carousel': MCPUIResourceCarousel,
              } as {
                [nodeType: string]: React.ElementType;
              }
            }
          >
            {currentContent}
          </ReactMarkdown>
        </CodeBlockProvider>
      </ArtifactProvider>
    </MarkdownErrorBoundary>
  );
});

export default Markdown;
