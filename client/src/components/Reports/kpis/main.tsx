import { KPIData, REPORT_LABELS } from "~/store/reports";
import KPICard from "./KPICard";

import { ReportFilters } from "~/store/reports";

interface MainKpisProps {
    kpiData: KPIData;
    filters: ReportFilters;
    setFilter: (filterType: keyof ReportFilters, value: string) => void;
    clearFilters: () => void;
}

export default function MainKpis({ kpiData, filters, setFilter, clearFilters }: MainKpisProps) {
    return (
        <div>
            <div className="bg-[#1c1c1c] p-3 sm:p-4 rounded-xl border border-gray-700/50 mb-4">
                <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 xl:gap-4">
                    {/* Logo HPE */}
                    <div className="flex-shrink-0">
                        <img
                            src="/assets/hpe-ia-neural-dark-mode.png"
                            alt="HPE IA Neural Logo"
                            className="h-14 w-auto rounded-lg bg-white p-2"
                        />
                    </div>

                    

                    {/* Filtros de Data */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">De:</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilter('startDate', e.target.value)}
                                className="bg-gray-800/50 text-white border border-gray-600/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-36 sm:w-40"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Até:</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilter('endDate', e.target.value)}
                                className="bg-gray-800/50 text-white border border-gray-600/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-36 sm:w-40"
                            />
                        </div>
                    </div>

                    
                    {/* Botão Limpar Filtros */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <button
                            onClick={() => clearFilters()}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>


                    {/* KPIs */}
                    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                        <div className="flex-1 min-w-[200px]">
                            <KPICard 
                              title={REPORT_LABELS.KPIS.TOTAL_REVENUE} 
                              value={`$${(kpiData?.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              change="Período selecionado"
                              changeType="positive"
                            />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <KPICard 
                              title={REPORT_LABELS.KPIS.NEW_USERS} 
                              value={(kpiData?.newUsers || 0).toString()}
                              change="Período selecionado"
                              changeType="positive"
                            />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <KPICard 
                              title={REPORT_LABELS.KPIS.ACTIVE_USERS} 
                              value={(kpiData?.activeAccounts || 0).toString()}
                              change="Cadastrados no sistema"
                              changeType="positive"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}