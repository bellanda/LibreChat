export interface ModelDescription {
  name: string;
  provider: string;
  shortUseCase: string;
  creator: string;
  title: string;
  description: string;
  image?: string;
  useCases?: string[];
  prompt?: number;
  completion?: number;
  characteristics?: {
    reasoning?: boolean;
    speed?: 'very-fast' | 'fast' | 'medium' | 'slow';
    intelligence?: 'medium' | 'high' | 'very-high';
    coding?: boolean;
    math?: boolean;
    multimodal?: boolean;
  };
  supportsWebSearch?: boolean;
  supportsCodeExecution?: boolean;
  supportsImageAttachment?: boolean;
}
