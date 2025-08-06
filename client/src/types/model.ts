export interface ModelDescription {
  name: string;
  shortUseCase: string;
  title: string;
  description: string;
  image?: string | null;
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
