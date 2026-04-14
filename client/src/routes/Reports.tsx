import { useEffect, useMemo } from 'react';

// COMPONENTS

import GraphMessagesCost from '~/components/Reports/graphs/GraphMessagesCost';
import GraphModelsMessage from '~/components/Reports/graphs/GraphModelsMessage';
import GraphUserCost from '~/components/Reports/graphs/GraphUserCost';
import GraphUserEfficiency from '~/components/Reports/graphs/GraphUserEfficiency';
import GraphUserMessages from '~/components/Reports/graphs/GraphUserMessages';

// Importar as tabelas
import GraphCCcost from '~/components/Reports/graphs/GraphCCcost';
import GraphCCmessages from '~/components/Reports/graphs/GraphCCmessages';
import GraphModelsCost from '~/components/Reports/graphs/GraphModelsCost';

import MainKpis from '~/components/Reports/kpis/main';
import { ReportUtils, useReportStore } from '../store/reports';

// Importar as tabelas
import CostCentersTable from '~/components/Reports/tables/CostCentersTable';
import ModelsTable from '~/components/Reports/tables/ModelsTable';
import UserMessagesTable from '~/components/Reports/tables/UserMessagesCostTable';

//=============================================================================
// COMPONENTE PRINCIPAL DO DASHBOARD
//==============================================================================

export default function Reports() {
  const {
    filters,
    usageCostData,
    topUsersVolumeData,
    topUsersCostData,
    topModelsData,
    topCostCentersVolumeData,
    topCostCentersCostData,
    userEfficiencyData,
    kpiData,

    // Dados das tabelas (sem limit)
    allTopUsersVolumeData,
    allTopUsersCostData,
    allTopModelsData,
    allUserEfficiencyData,
    allTopCostCentersVolumeData,
    allTopCostCentersCostData,

    isLoadingUsageCost,
    isLoadingKPIs,
    isLoadingTopUsers,
    isLoadingTopModels,
    isLoadingEfficiency,
    isLoadingCostCenters,

    // Obs: Loading states são os mesmos para gráficos e tabelas agora

    setFilter,
    clearFilters,
    fetchAllData,
  } = useReportStore();

  // Loading global - true se qualquer uma das chamadas estiver carregando
  const loading =
    isLoadingUsageCost ||
    isLoadingKPIs ||
    isLoadingTopUsers ||
    isLoadingTopModels ||
    isLoadingEfficiency ||
    isLoadingCostCenters;

  // Busca todos os dados quando os filtros mudam
  useEffect(() => {
    fetchAllData(); // Agora já busca todos os dados (gráficos + tabelas)
  }, [fetchAllData, filters.startDate, filters.endDate, filters.costCenter]);

  // Dados de usuários ordenados por volume COM CORES ESPECÍFICAS
  const filteredTopUsersVolume = useMemo(() => {
    const sortedUsers = [...topUsersVolumeData].sort((a, b) => b.Volume - a.Volume);
    return ReportUtils.addColorsToUsersVolume(sortedUsers);
  }, [topUsersVolumeData]);

  const filteredTopUsersCost = useMemo(() => {
    const sortedUsers = [...topUsersCostData].sort((a, b) => b.Custo - a.Custo);
    return ReportUtils.addColorsToUsersCost(sortedUsers);
  }, [topUsersCostData]);

  const filteredTopModels = useMemo(() => {
    // Aplicar cores específicas aos modelos usando a nova função
    return ReportUtils.addColorsToModelsSpecific([...topModelsData]);
  }, [topModelsData]);

  // Dados de centros de custo COM CORES ESPECÍFICAS
  const filteredTopCostCentersVolume = useMemo(() => {
    const sortedCCs = [...topCostCentersVolumeData].sort((a, b) => b.Volume - a.Volume);
    return ReportUtils.addColorsToCostCentersVolume(sortedCCs);
  }, [topCostCentersVolumeData]);

  const filteredTopCostCentersCost = useMemo(() => {
    const sortedCCs = [...topCostCentersCostData].sort((a, b) => (b.Custo || 0) - (a.Custo || 0));
    return ReportUtils.addColorsToCostCentersCost(sortedCCs);
  }, [topCostCentersCostData]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 font-sans text-white sm:p-6 lg:p-8">
      <div className="w-full">
        {/* --- KPIs COM FILTROS INTEGRADOS --- */}
        <MainKpis
          kpiData={
            kpiData || {
              totalCost: 0,
              newUsers: 0,
              activeAccounts: 0,
            }
          }
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
        />

        {/* --- Gráfico Principal de Uso e Custo ao Longo do Tempo --- */}
        <div className="mb-4 rounded-xl border border-gray-700/50 bg-[#1c1c1c] p-5">
          <GraphMessagesCost usageCostData={usageCostData} loading={loading} />
        </div>

        {/* --- Análise de Centros de Custo --- */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GraphCCmessages filteredTopCostCenters={filteredTopCostCentersVolume} />
          <GraphCCcost filteredTopCostCenters={filteredTopCostCentersCost} />
        </div>

        {/* --- Análise de Usuários --- */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GraphUserMessages filteredTopUsersVolume={filteredTopUsersVolume} />
          <GraphUserCost filteredTopUsersCost={filteredTopUsersCost} />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GraphModelsMessage filteredTopModels={filteredTopModels} />

          {/*CUSTO POR MODELO*/}
          <GraphModelsCost filteredTopModels={filteredTopModels} />
        </div>

        {/* --- Análise de Modelos --- */}
        <div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <GraphUserEfficiency
              userEfficiencyData={ReportUtils.addColorsToUsersEfficiency(userEfficiencyData)}
            />
          </div>
        </div>

        {/* --- TABELAS DETALHADAS --- */}
        <div className="mt-8">
          <h2 className="mb-6 text-2xl font-bold text-white">📊 Tabelas Detalhadas</h2>

          {/* Tabela de Centros de Custo */}
          <div className="mb-6">
            <CostCentersTable data={allTopCostCentersVolumeData} isLoading={isLoadingCostCenters} />
          </div>

          {/* Tabelas de Usuários */}
          <div className="mb-6 grid grid-cols-1 gap-6">
            <UserMessagesTable data={allTopUsersVolumeData} isLoading={isLoadingTopUsers} />
          </div>

          {/* Tabela de Modelos */}
          <div className="mb-6">
            <ModelsTable data={allTopModelsData} isLoading={isLoadingTopModels} />
          </div>
        </div>
      </div>
    </div>
  );
}
