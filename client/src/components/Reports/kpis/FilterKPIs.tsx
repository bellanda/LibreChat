import { ReportFilters } from "~/store/reports";

interface FilterKPIsProps {
    filters: ReportFilters;
    setFilter: (filterType: keyof ReportFilters, value: string) => void;
    clearFilters: () => void;
}

export default function FilterKPIs({ filters, setFilter, clearFilters }: FilterKPIsProps) {
    return (
        <div className="bg-[#1c1c1c] p-6 rounded-xl border border-gray-700/50 mb-6">
            <div className="flex items-center gap-8">
                {/* Logo HPE */}
                <div className="flex-shrink-0">
                    <img
                        src="/assets/hpe-ia-neural-dark-mode.png"
                        alt="HPE IA Neural Logo"
                        className="h-14 w-auto rounded-lg bg-white p-2"
                    />
                </div>

                {/* Filtros de Data */}
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">De:</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilter('startDate', e.target.value)}
                            className="bg-gray-800/50 text-white border border-gray-600/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-40"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Até:</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilter('endDate', e.target.value)}
                            className="bg-gray-800/50 text-white border border-gray-600/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-40"
                        />
                    </div>
                </div>

                {/* Filtro Centro de Custo */}
                <div className="flex-1">
                    <label className="block text-gray-400 text-xs mb-1">Centro de Custo:</label>
                    <input
                        type="text"
                        value={filters.costCenter}
                        onChange={(e) => setFilter('costCenter', e.target.value)}
                        placeholder="Digite o código do centro de custo..."
                        className="w-full bg-gray-800/50 text-white border border-gray-600/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-400"
                    />
                </div>

                {/* Status do Centro de Custo */}
                <div className="flex-shrink-0 text-xs">
                    {filters.costCenter ? (
                        <span className="text-green-400">✓ {filters.costCenter}</span>
                    ) : (
                        <span className="text-gray-500">Todos</span>
                    )}
                </div>

                {/* Botão Limpar Filtros */}
                <div className="flex-shrink-0">
                    <button
                        onClick={() => clearFilters()}
                        className="bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}