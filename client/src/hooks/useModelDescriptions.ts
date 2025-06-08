import { useEffect, useState } from 'react';

export interface ModelDescription {
  name: string;
  shortUseCase: string;
  title: string;
  description: string;
  image?: string | null;
  useCases?: string[];
  characteristics?: {
    reasoning?: boolean;
    speed?: 'very-fast' | 'fast' | 'medium' | 'slow';
    intelligence?: 'medium' | 'high' | 'very-high';
    coding?: boolean;
    math?: boolean;
    multimodal?: boolean;
  };
}

export const useModelDescriptions = () => {
  const [descriptions, setDescriptions] = useState<Record<string, ModelDescription>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDescriptions = async () => {
      try {
        console.log('🔍 Loading model descriptions from /models-descriptions.json');
        // Fetch the JSON file from the public directory or API
        const response = await fetch('/models-descriptions.json');
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
          console.warn('❌ Could not load models-descriptions.json, status:', response.status);
          console.warn('Response headers:', [...response.headers.entries()]);
          // Fallback to local descriptions if JSON file is not available
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
