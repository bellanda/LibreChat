import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ReportFilters {
    user: string;
    startDate: string;
    endDate: string;
    models: string[];
}

interface ReportState {
    filters: ReportFilters;
    filteredData: any;
    availableModels: string[]; // Virá do banco de dados
    setFilter: (filterType: keyof ReportFilters, value: string | string[]) => void;
    toggleModel: (model: string) => void;
    clearFilters: () => void;
    setAvailableModels: (models: string[]) => void;
    applyFilters: (rawData: any) => void;
}

const initialFilters: ReportFilters = {
    user: '',
    startDate: '',
    endDate: '',
    models: [],
};

// Modelos de exemplo - na prática virão do banco de dados
export const defaultModels = [
    'GPT-4o',
    'GPT-3.5-Turbo',
    'Claude-3',
    'Embeddings',
    'DALL-E',
    'Whisper'
];

export const useReportStore = create<ReportState>()(
    devtools(
        (set, get) => ({
            filters: initialFilters,
            filteredData: null,
            availableModels: defaultModels,

            setFilter: (filterType, value) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        [filterType]: value,
                    },
                })),

            toggleModel: (model) =>
                set((state) => {
                    const currentModels = state.filters.models;
                    const isSelected = currentModels.includes(model);

                    let newModels: string[];
                    if (isSelected) {
                        newModels = currentModels.filter(m => m !== model);
                    } else {
                        newModels = [...currentModels, model];
                    }

                    return {
                        filters: {
                            ...state.filters,
                            models: newModels,
                        },
                    };
                }),

            clearFilters: () =>
                set(() => ({
                    filters: initialFilters,
                })),

            setAvailableModels: (models) =>
                set(() => ({
                    availableModels: models,
                })),

            applyFilters: (rawData) => {
                const { filters } = get();
                // Implementar lógica de filtragem baseada nos novos filtros
                set(() => ({ filteredData: rawData }));
            },
        }),
        {
            name: 'report-store',
        }
    )
); 