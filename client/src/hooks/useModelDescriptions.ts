import { useEffect, useState } from 'react';

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

export const useModelDescriptions = () => {
  const [descriptions, setDescriptions] = useState<Record<string, ModelDescription>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDescriptions = async () => {
      try {
        // Fetch from API instead of static JSON file
        const response = await fetch('/api/models-descriptions', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        console.log('📡 Response status:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log(
            '✅ Model descriptions loaded successfully:',
            Object.keys(data).length,
            'models',
          );
          setDescriptions(data);
        } else {
          console.warn('❌ Could not load models descriptions from API, status:', response.status);
          console.warn('Response headers:', [...response.headers.entries()]);
          // Fallback to empty descriptions if API is not available
          setDescriptions({});
        }
      } catch (error) {
        console.error('💥 Error loading model descriptions:', error);
        setDescriptions({});
      } finally {
        setLoading(false);
      }
    };

    loadDescriptions();
  }, []);

  const getModelDescription = (modelId: string | null): ModelDescription | null => {
    if (!modelId || loading) return null;
    return descriptions[modelId] || null;
  };

  return {
    descriptions,
    loading,
    getModelDescription,
  };
};

