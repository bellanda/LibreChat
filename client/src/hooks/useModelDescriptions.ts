import { useModelDescriptionsContext } from '~/Providers/ModelDescriptionsContext';
export type { ModelDescription } from '~/types/model';

export const useModelDescriptions = () => {
  return useModelDescriptionsContext();
};
