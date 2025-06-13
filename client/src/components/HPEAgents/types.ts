export interface HPEMarkup {
  type: HPEMarkupType;
  content: string;
  metadata?: Record<string, any>;
  originalText: string;
}

export enum HPEMarkupType {
  PROGRESS = 'PROGRESS',
  TOOL_START = 'TOOL_START',
  TOOL_END = 'TOOL_END',
  STATUS = 'STATUS',
  THINKING = 'THINKING',
  RESULT = 'RESULT',
  HIGHLIGHT = 'HIGHLIGHT',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CODE = 'CODE',
  STEP = 'STEP',
}

export interface ProgressMarkup {
  percentage: number;
  message: string;
}

export interface ToolMarkup {
  toolName: string;
  message: string;
  success?: boolean;
}

export interface StatusMarkup {
  status: 'processing' | 'completed' | 'error' | 'waiting' | 'analyzing';
  message: string;
}

export interface ResultMarkup {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface CodeMarkup {
  language: string;
  code: string;
}

export interface StepMarkup {
  stepNumber: number;
  message: string;
}

export interface ProcessedText {
  segments: Array<{
    type: 'text' | 'markup';
    content: string;
    markup?: HPEMarkup;
  }>;
}

export interface HPEAgentsProcessorProps {
  children: React.ReactNode;
  text: string;
  className?: string;
}
