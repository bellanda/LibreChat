import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import supersub from 'remark-supersub';
import type { PluggableList } from 'unified';
import { ArtifactProvider, CodeBlockProvider } from '~/Providers';
import { langSubset } from '~/utils';
import { a, code, codeNoExecution, img, p } from './MarkdownComponents';
import MarkdownErrorBoundary from './MarkdownErrorBoundary';

const MarkdownLite = memo(
  ({ content = '', codeExecution = true }: { content?: string; codeExecution?: boolean }) => {
    const rehypePlugins: PluggableList = [
      [rehypeKatex],
      [
        rehypeHighlight,
        {
          detect: true,
          ignoreMissing: true,
          subset: langSubset,
        },
      ],
    ];

    // Conditionally disable singleDollarTextMath if Brazilian currency is detected
    // This preserves the important Brazilian currency handling from HEAD
    const shouldDisableSingleDollar = hasBrazilianCurrency(content);

    return (
      <MarkdownErrorBoundary content={content} codeExecution={codeExecution}>
        <ArtifactProvider>
          <CodeBlockProvider>
            <ReactMarkdown
              remarkPlugins={[
                /** @ts-ignore */
                supersub,
                remarkGfm,
                [remarkMath, { singleDollarTextMath: false }],
              ]}
              /** @ts-ignore */
              rehypePlugins={rehypePlugins}
              // linkTarget="_new"
              components={
                {
                  code: codeExecution ? code : codeNoExecution,
                  a,
                  p,
                  img,
                } as {
                  [nodeType: string]: React.ElementType;
                }
              }
            >
              {content}
            </ReactMarkdown>
          </CodeBlockProvider>
        </ArtifactProvider>
      </MarkdownErrorBoundary>
    );
  },
);

export default MarkdownLite;
