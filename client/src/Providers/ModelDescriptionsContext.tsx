import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { ModelDescription } from '~/types/model';

export interface ModelDescriptionsContextType {
  descriptions: Record<string, ModelDescription>;
  loading: boolean;
  getModelDescription: (modelId: string | null) => ModelDescription | null;
}

const ModelDescriptionsContext = createContext<ModelDescriptionsContextType | undefined>(undefined);

export const useModelDescriptionsContext = () => {
  const context = useContext(ModelDescriptionsContext);
  if (!context) {
    throw new Error('useModelDescriptionsContext must be used within a ModelDescriptionsProvider');
  }
  return context;
};

interface ModelDescriptionsProviderProps {
  children: ReactNode;
}

export const ModelDescriptionsProvider = ({ children }: ModelDescriptionsProviderProps) => {
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

  const value = {
    descriptions,
    loading,
    getModelDescription,
  };

  return (
    <ModelDescriptionsContext.Provider value={value}>{children}</ModelDescriptionsContext.Provider>
  );
};
