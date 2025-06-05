import { useEffect, useState } from 'react';

export interface ModelDescription {
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
        // Fetch the JSON file from the public directory or API
        const response = await fetch('/models-descriptions.json');
        if (response.ok) {
          const data = await response.json();
          setDescriptions(data);
        } else {
          console.warn('Could not load models-descriptions.json, using fallback');
          // Fallback to local descriptions if JSON file is not available
          setDescriptions({});
        }
      } catch (error) {
        console.warn('Error loading model descriptions:', error);
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
