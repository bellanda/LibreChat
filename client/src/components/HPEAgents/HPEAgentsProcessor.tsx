import React from 'react';
import { cn } from '~/utils';
import CodeComponent from './components/CodeComponent';
import ErrorComponent from './components/ErrorComponent';
import HighlightComponent from './components/HighlightComponent';
import ProgressComponent from './components/ProgressComponent';
import ResultComponent from './components/ResultComponent';
import StatusComponent from './components/StatusComponent';
import StepComponent from './components/StepComponent';
import ThinkingComponent from './components/ThinkingComponent';
import ToolEndComponent from './components/ToolEndComponent';
import ToolStartComponent from './components/ToolStartComponent';
import WarningComponent from './components/WarningComponent';
import './styles.css';
import { HPEMarkupType } from './types';
import { processText } from './utils';

interface HPEAgentsProcessorProps {
  text: string;
  className?: string;
}

const HPEAgentsProcessor: React.FC<HPEAgentsProcessorProps> = ({ text, className }) => {
  const { segments } = processText(text);

  const renderMarkupComponent = (markup: any) => {
    switch (markup.type) {
      case HPEMarkupType.PROGRESS:
        return (
          <ProgressComponent
            key={`progress-${Math.random()}`}
            data={{
              percentage: markup.metadata?.percentage || 0,
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.TOOL_START:
        return (
          <ToolStartComponent
            key={`tool-start-${Math.random()}`}
            data={{
              toolName: markup.metadata?.toolName || 'unknown',
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.TOOL_END:
        return (
          <ToolEndComponent
            key={`tool-end-${Math.random()}`}
            data={{
              toolName: markup.metadata?.toolName || 'unknown',
              message: markup.content,
              success: true,
            }}
          />
        );

      case HPEMarkupType.STATUS:
        return (
          <StatusComponent
            key={`status-${Math.random()}`}
            data={{
              status: markup.metadata?.status || 'processing',
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.THINKING:
        return (
          <ThinkingComponent
            key={`thinking-${Math.random()}`}
            data={{
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.RESULT:
        return (
          <ResultComponent
            key={`result-${Math.random()}`}
            data={{
              type: markup.metadata?.status || 'info',
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.HIGHLIGHT:
        return (
          <HighlightComponent
            key={`highlight-${Math.random()}`}
            data={{
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.WARNING:
        return (
          <WarningComponent
            key={`warning-${Math.random()}`}
            data={{
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.ERROR:
        return (
          <ErrorComponent
            key={`error-${Math.random()}`}
            data={{
              message: markup.content,
            }}
          />
        );

      case HPEMarkupType.CODE:
        return (
          <CodeComponent
            key={`code-${Math.random()}`}
            data={{
              language: markup.metadata?.language || 'text',
              code: markup.content,
            }}
          />
        );

      case HPEMarkupType.STEP:
        return (
          <StepComponent
            key={`step-${Math.random()}`}
            data={{
              stepNumber: markup.metadata?.stepNumber || 1,
              message: markup.content,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('hpe-agents-processor', className)}>
      {segments.map((segment, index) => {
        if (segment.type === 'markup' && segment.markup) {
          return renderMarkupComponent(segment.markup);
        }

        // Renderizar texto normal
        if (segment.content.trim()) {
          return (
            <div key={`text-${index}`} className="text-content whitespace-pre-wrap break-words">
              {segment.content}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default HPEAgentsProcessor;
