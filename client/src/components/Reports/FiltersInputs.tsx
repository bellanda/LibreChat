import { ReportFiltersProps } from "~/store/reports";

export default function FiltersInputs({ filters, setFilter, clearFilters }: ReportFiltersProps) {
    return (
        <div className="bg-[#1c1c1c] p-4 rounded-xl border border-gray-700/50">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/hpe-ia-neural-dark-mode.png"
                alt="HPE IA Neural Logo"
                className="h-16 w-auto rounded-lg bg-white p-2"
              />
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => clearFilters()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
    )
}

