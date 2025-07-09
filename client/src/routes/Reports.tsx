import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis, YAxis
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useReportStore } from '../store/reports';

//==============================================================================
// 1. DEFINIÇÃO DE TIPOS (TYPESCRIPT)
//==============================================================================



interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType?: 'positive' | 'negative';
}

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

type VisitorData = {
  date: string;
  Custo: number;
  Mensagens: number;
};

type UserActivity = {
  name: string;
  username?: string;
  Volume: number;
  Custo: number;
  Arquivos?: number;
  CostPerMessage?: number;
};

type ModelUsage = {
  name: string;
  value: number;
  fill: string;
};



//==============================================================================
// 2. DADOS DE EXEMPLO (MOCK DATA)
//==============================================================================



const kpiData = {
  totalRevenue: { value: '$1,250.00', change: '+12.5%', changeType: 'positive' as const },
  newCustomers: { value: '1,234', change: '-20%', changeType: 'negative' as const },
  activeAccounts: { value: '45,678', change: '+12.5%', changeType: 'positive' as const },
  growthRate: { value: '4.5%', change: '+4.5%', changeType: 'positive' as const },
};

const usageOverTime: VisitorData[] = [
  { date: '05/07', Custo: 65, Mensagens: 4000 }, { date: 'Apr 11', Custo: 150, Mensagens: 9000 },
  { date: 'Apr 17', Custo: 100, Mensagens: 6000 }, { date: 'Apr 23', Custo: 200, Mensagens: 12000 },
  { date: 'Apr 29', Custo: 280, Mensagens: 18000 }, { date: 'May 5', Custo: 250, Mensagens: 15000 },
  { date: 'May 11', Custo: 180, Mensagens: 11000 }, { date: 'May 17', Custo: 350, Mensagens: 22000 },
  { date: 'May 23', Custo: 220, Mensagens: 14000 }, { date: 'May 29', Custo: 180, Mensagens: 10000 },
  { date: 'Jun 4', Custo: 300, Mensagens: 19000 }, { date: 'Jun 10', Custo: 220, Mensagens: 15000 },
  { date: 'Jun 16', Custo: 400, Mensagens: 28000 }, { date: 'Jun 22', Custo: 350, Mensagens: 24000 },
  { date: 'Jun 29', Custo: 280, Mensagens: 19000 },
];

const topUsers: UserActivity[] = [
  { name: 'Ana Silva', username: 'as123456', Volume: 12450, Custo: 145.80, Arquivos: 198 },
  { name: 'Bruno Costa', username: 'bc234567', Volume: 11980, Custo: 150.20, Arquivos: 180 },
  { name: 'Carla Duarte', username: 'cd345678', Volume: 10500, Custo: 121.10, Arquivos: 150 },
  { name: 'Diego Ferreira', username: 'df456789', Volume: 9800, Custo: 105.00, Arquivos: 210 },
  { name: 'Elisa Gomes', username: 'eg567890', Volume: 9540, Custo: 99.50, Arquivos: 231 },
  { name: 'Gabriel Rodrigues', username: 'gr678901', Volume: 8300, Custo: 92.00, Arquivos: 250 },
].sort((a, b) => b.Volume - a.Volume); // Ordena por volume para o gráfico

const modelUsageDistribution: ModelUsage[] = [
  { name: 'GPT-4o', value: 45, fill: '#60a5fa' },
  { name: 'GPT-3.5-Turbo', value: 30, fill: '#a78bfa' },
  { name: 'Embeddings', value: 15, fill: '#f472b6' },
  { name: 'Outros', value: 10, fill: '#4ade80' },
];



//==============================================================================
// 3. COMPONENTES REUTILIZÁVEIS
//==============================================================================

const UserInput: React.FC<{label: string; value: string; onChange: (value: string) => void; placeholder?: string}> = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="block text-gray-400 text-sm mb-2">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#1c1c1c] text-white border border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
    />
  </div>
);

const DateRange: React.FC<{label: string; startDate: string; endDate: string; onStartDateChange: (date: string) => void; onEndDateChange: (date: string) => void}> = ({ label, startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div className="mb-4">
    <label className="block text-gray-400 text-sm mb-2">{label}</label>
    <div className="space-y-2">
      <div>
        <label className="block text-gray-500 text-xs mb-1">De:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full bg-[#1c1c1c] text-white border border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-gray-500 text-xs mb-1">Até:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full bg-[#1c1c1c] text-white border border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

const ModelSelect: React.FC<{label: string; selectedModels: string[]; availableModels: string[]; onToggleModel: (model: string) => void}> = ({ label, selectedModels, availableModels, onToggleModel }) => (
  <div className="mb-4">
    <label className="block text-gray-400 text-sm mb-2">{label}</label>
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {availableModels.map((model) => (
        <label key={model} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedModels.includes(model)}
            onChange={() => onToggleModel(model)}
            className="rounded border-gray-700 bg-[#1c1c1c] text-blue-500 focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-gray-300 text-sm">{model}</span>
        </label>
      ))}
    </div>
  </div>
);

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType = 'positive' }) => {
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  return (
    <div className="bg-[#1c1c1c] p-2 rounded-xl border border-gray-700/50">
      <div className="flex items-center justify-between text-gray-400 text-sm">
        <span>{title}</span>
        <div className={`flex items-center gap-1 font-semibold ${changeColor}`}>
          <span>{change}</span>
        </div>
      </div>
      <h2 className="text-white text-3xl font-bold my-1">{value}</h2>
    </div>
  );
};

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => (
  <div className="bg-[#1c1c1c] p-5 rounded-xl border border-gray-700/50">
    <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
    <div className="h-[300px] w-full">{children}</div>
  </div>
);

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg text-white text-sm shadow-lg">
        <p className="label font-bold mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {`${p.name}: ${p.name === 'Custo' ? 
              `$${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
              p.value?.toLocaleString('pt-BR')
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};



//==============================================================================
// 4. FUNÇÕES DE API
//==============================================================================

// Função para testar conectividade com a API
const testApiConnection = async () => {
  try {
    console.log('[DEBUG] Iniciando teste de conectividade...');
    const response = await fetch('/api/python-tools/reports/test');
    console.log('[DEBUG] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] Erro na resposta:', errorText);
      return { status: 'ERROR', message: `HTTP ${response.status}: ${errorText}` };
    }
    
    const contentType = response.headers.get('content-type');
    console.log('[DEBUG] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('[DEBUG] Resposta não é JSON:', responseText);
      return { status: 'ERROR', message: 'Resposta não é JSON válido' };
    }
    
    const data = await response.json();
    console.log('[DEBUG] Teste de conectividade:', data);
    return data;
  } catch (error) {
    console.error('[DEBUG] Erro no teste de conectividade:', error);
    return { status: 'ERROR', message: 'Falha na comunicação' };
  }
};

const fetchUsageCostData = async (filters: any) => {
  try {
    const params = new URLSearchParams();
    
    // Adiciona filtros como parâmetros da URL
    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username'); // ou 'name' dependendo do que você quer buscar
    }
    
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    
    if (filters.models && filters.models.length > 0) {
      params.append('models', filters.models.join(','));
    }

    const url = `/api/python-tools/reports/usage-cost${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para:', url);
    
    // Primeiro testa se a rota existe
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      
      // Se for 404, significa que a rota não existe
      if (response.status === 404) {
        console.warn('[DEBUG] Rota não encontrada - verificar se API Python está rodando');
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('[DEBUG] Resposta não é JSON:', responseText);
      throw new Error('Resposta da API não é JSON válido');
    }
    
    const data = await response.json();
    console.log('[DEBUG] Dados recebidos da API:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de uso e custo:', error);
    
    // Se for erro de rede, mostrar mensagem específica
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.warn('[DEBUG] Erro de rede - API pode estar offline');
    }
    
    // Retorna dados mock como fallback
    return [];
  }
};

const fetchTopUsersVolumeData = async (filters: any) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }
    
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    
    params.append('limit', '10');

    const url = `/api/python-tools/reports/top-users-volume${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Users Volume:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Dados Top Users Volume recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar top users volume:', error);
    return [];
  }
};

const fetchTopUsersCostData = async (filters: any) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }
    
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    
    params.append('limit', '10');

    const url = `/api/python-tools/reports/top-users-cost${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Users Cost:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Dados Top Users Cost recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar top users cost:', error);
    return [];
  }
};

const fetchTopModelsData = async (filters: any) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }
    
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    
    params.append('limit', '10');

    const url = `/api/python-tools/reports/top-models${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Models:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Dados Top Models recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar top models:', error);
    return [];
  }
};

const fetchAvailableModels = async () => {
  try {
    const url = `/api/python-tools/reports/available-models`;
    console.log('[DEBUG] Fazendo requisição para Available Models:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Modelos disponíveis recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar modelos disponíveis:', error);
    return [];
  }
};

const fetchKPIsData = async (filters: any) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }

    const url = `/api/python-tools/reports/kpis${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para KPIs:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Dados KPIs recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    return {
      totalCost: 0,
      newUsers: 0,
      activeAccounts: 0
    };
  }
};

const fetchUserEfficiencyData = async (filters: any) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }
    
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    
    params.append('limit', '10');

    const url = `/api/python-tools/reports/user-efficiency${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para User Efficiency:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DEBUG] Dados User Efficiency recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar user efficiency:', error);
    return [];
  }
};

//==============================================================================
// 5. COMPONENTE PRINCIPAL DO DASHBOARD
//==============================================================================

export default function Reports() {
  const { filters, availableModels, setFilter, toggleModel, clearFilters, setAvailableModels } = useReportStore();
  const [usageData, setUsageData] = React.useState<VisitorData[]>(usageOverTime);
  const [topUsersVolumeData, setTopUsersVolumeData] = React.useState<UserActivity[]>(topUsers);
  const [topUsersCostData, setTopUsersCostData] = React.useState<UserActivity[]>(topUsers);
  const [topModelsData, setTopModelsData] = React.useState<ModelUsage[]>(modelUsageDistribution);
  const [userEfficiencyData, setUserEfficiencyData] = React.useState<UserActivity[]>([]);
  const [kpisData, setKpisData] = React.useState({
    totalCost: 0,
    newUsers: 0,
    activeAccounts: 0
  });
  const [loading, setLoading] = React.useState(false);

  // Carrega modelos disponíveis uma vez no início
  React.useEffect(() => {
    const loadAvailableModels = async () => {
      const models = await fetchAvailableModels();
      if (models && models.length > 0) {
        setAvailableModels(models);
        console.log('[DEBUG] Modelos carregados:', models);
      }
    };

    loadAvailableModels();
  }, [setAvailableModels]);

  // Busca dados da API quando os filtros mudam
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Primeiro testa a conectividade
        const connectivityTest = await testApiConnection();
        if (connectivityTest.status === 'ERROR') {
          console.warn('[DEBUG] API offline - usando dados mock');
        }
        
        // Busca todos os dados em paralelo
        const [usageCostData, topVolumeData, topCostData, modelsData, kpisResult, efficiencyData] = await Promise.all([
          fetchUsageCostData(filters),
          fetchTopUsersVolumeData(filters),
          fetchTopUsersCostData(filters),
          fetchTopModelsData(filters),
          fetchKPIsData(filters),
          fetchUserEfficiencyData(filters)
        ]);
        
        // Atualiza dados de uso e custo
        if (usageCostData && usageCostData.length > 0) {
          setUsageData(usageCostData);
          console.log('[DEBUG] Usando dados de uso/custo da API:', usageCostData);
        } else {
          // Fallback para dados mock filtrados
          let filtered = [...usageOverTime];
          
          if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            filtered = filtered.filter(item => {
              const itemDate = new Date(item.date);
              return itemDate >= start && itemDate <= end;
            });
          }
          
          setUsageData(filtered);
          console.log('[DEBUG] Usando dados mock de uso/custo filtrados:', filtered);
        }

        // Atualiza dados de top users por volume
        if (topVolumeData && topVolumeData.length > 0) {
          setTopUsersVolumeData(topVolumeData);
          console.log('[DEBUG] Usando dados de top users volume da API:', topVolumeData);
        } else {
          setTopUsersVolumeData(topUsers);
        }

        // Atualiza dados de top users por custo
        if (topCostData && topCostData.length > 0) {
          setTopUsersCostData(topCostData);
          console.log('[DEBUG] Usando dados de top users cost da API:', topCostData);
        } else {
          setTopUsersCostData(topUsers);
        }

        // Atualiza dados de top models
        if (modelsData && modelsData.length > 0) {
          // Adiciona cores para os gráficos
          const modelsWithColors = modelsData.map((model, index) => ({
            ...model,
            fill: ['#60a5fa', '#a78bfa', '#f472b6', '#4ade80', '#fbbf24', '#ef4444'][index % 6]
          }));
          setTopModelsData(modelsWithColors);
          console.log('[DEBUG] Usando dados de top models da API:', modelsWithColors);
        } else {
          setTopModelsData(modelUsageDistribution);
        }

        // Atualiza dados de KPIs
        if (kpisResult) {
          setKpisData(kpisResult);
          console.log('[DEBUG] Usando dados de KPIs da API:', kpisResult);
        }

        // Atualiza dados de eficiência dos usuários
        if (efficiencyData && efficiencyData.length > 0) {
          setUserEfficiencyData(efficiencyData);
          console.log('[DEBUG] Usando dados de eficiência da API:', efficiencyData);
        } else {
          setUserEfficiencyData([]);
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Em caso de erro, usa dados mock
        setUsageData(usageOverTime);
        setTopUsersVolumeData(topUsers);
        setTopUsersCostData(topUsers);
        setTopModelsData(modelUsageDistribution);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters.user, filters.startDate, filters.endDate, filters.models]); // Recarrega quando os filtros principais mudam

  // Para compatibilidade, mantém a variável filteredUsageData
  const filteredUsageData = usageData;

  // Aplica filtros locais se necessário (quando não há filtro de usuário específico na API)
  const filteredTopUsersVolume = React.useMemo(() => {
    let filtered = [...topUsersVolumeData];
    
    // Se não está filtrando por usuário específico na API, filtra localmente
    if (!filters.user.trim() && filters.models.length > 0) {
      const modelMultiplier = filters.models.length / availableModels.length;
      filtered = filtered.map(user => ({
        ...user,
        Volume: Math.round(user.Volume * modelMultiplier),
        Custo: parseFloat((user.Custo * modelMultiplier).toFixed(2))
      }));
    }
    
    return filtered.sort((a, b) => b.Volume - a.Volume);
  }, [topUsersVolumeData, filters, availableModels]);

  const filteredTopUsersCost = React.useMemo(() => {
    let filtered = [...topUsersCostData];
    
    // Se não está filtrando por usuário específico na API, filtra localmente
    if (!filters.user.trim() && filters.models.length > 0) {
      const modelMultiplier = filters.models.length / availableModels.length;
      filtered = filtered.map(user => ({
        ...user,
        Volume: Math.round(user.Volume * modelMultiplier),
        Custo: parseFloat((user.Custo * modelMultiplier).toFixed(2))
      }));
    }
    
    return filtered.sort((a, b) => b.Custo - a.Custo);
  }, [topUsersCostData, filters, availableModels]);

  const filteredTopModels = React.useMemo(() => {
    let filtered = [...topModelsData];
    
    // Filtra por modelos selecionados se especificado
    if (filters.models.length > 0 && filters.models.length < availableModels.length) {
      filtered = filtered.filter(model => 
        filters.models.some(selectedModel => 
          model.name.toLowerCase().includes(selectedModel.toLowerCase())
        )
      );
    }
    
    return filtered;
  }, [topModelsData, filters, availableModels]);

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      

      <div className="flex gap-6">
        {/* Barra Lateral de Filtros */}
        <div className="w-64 shrink-0">
          <div className="bg-[#1c1c1c] p-4 rounded-xl border border-gray-700/50">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/hpe-ia-neural-dark-mode.png"
                alt="HPE IA Neural Logo"
                className="h-16 w-auto rounded-lg bg-white p-2"
              />
            </div>
            <h2 className="text-lg font-semibold mb-3">Filtros</h2>
            
            <UserInput
              label="Usuário"
              value={filters.user}
              onChange={(value) => setFilter('user', value)}
              placeholder="Digite a matricula..."
            />

            <DateRange
              label="Data"
              startDate={filters.startDate}
              endDate={filters.endDate}
              onStartDateChange={(date) => setFilter('startDate', date)}
              onEndDateChange={(date) => setFilter('endDate', date)}
            />

            <ModelSelect
              label="Modelo"
              selectedModels={filters.models}
              availableModels={availableModels}
              onToggleModel={toggleModel}
            />

            <div className="mt-6">
              <button
                onClick={() => clearFilters()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        
        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* --- KPIs --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            <KPICard 
              title="Custo Total (Período)" 
              value={`$${kpisData.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              change="Período selecionado"
              changeType="positive"
            />
            <KPICard 
              title="Novos Usuários" 
              value={kpisData.newUsers.toString()}
              change="Período selecionado"
              changeType="positive"
            />
            <KPICard 
              title="Total de Usuários" 
              value={kpisData.activeAccounts.toString()}
              change="Cadastrados no sistema"
              changeType="positive"
            />
          </div>
          {/* --- Gráfico Principal de Uso e Custo ao Longo do Tempo --- */}
          <div className="bg-[#1c1c1c] p-5 rounded-xl border border-gray-700/50 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Uso e Custo</h3>
              {loading && (
                <div className="text-blue-400 text-sm flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  Carregando...
                </div>
              )}
            </div>
            <div className="h-[250px] w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Carregando dados...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Mensagens', angle: -90, position: 'insideLeft', fill: '#8884d8', style: {textAnchor: 'middle'} }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Custo (USD)', angle: -90, position: 'insideRight', fill: '#82ca9d', style: {textAnchor: 'middle'} }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="Mensagens" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                    <Area yAxisId="right" type="monotone" dataKey="Custo" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* --- Análise de Usuários --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <ChartContainer title="Top Usuários por Volume de Mensagens">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTopUsersVolume} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="username" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    width={80}
                    tickFormatter={(value, index) => {
                      const item = filteredTopUsersVolume[index];
                      return item?.username || value;
                    }}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        return (
                          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg text-white text-sm shadow-lg">
                            <p className="label font-bold mb-2">{data?.name || label}</p>
                            <p className="text-gray-300 text-xs mb-1">@{data?.username}</p>
                            {payload.map((p, i) => (
                              <p key={i} style={{ color: p.color }}>
                                {`${p.name}: ${p.name === 'Custo' ? 
                                  `$${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                                  p.value?.toLocaleString('pt-BR')
                                }`}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: '#ffffff10' }} 
                  />
                  <Bar dataKey="Volume" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartContainer title="Top Custo uso">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTopUsersCost} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <YAxis 
                    type="category" 
                    dataKey="username" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    width={80}
                    tickFormatter={(value, index) => {
                      const item = filteredTopUsersCost[index];
                      return item?.username || value;
                    }}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        return (
                          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg text-white text-sm shadow-lg">
                            <p className="label font-bold mb-2">{data?.name || label}</p>
                            <p className="text-gray-300 text-xs mb-1">@{data?.username}</p>
                            {payload.map((p, i) => (
                              <p key={i} style={{ color: p.color }}>
                                {`${p.name}: ${p.name === 'Custo' ? 
                                  `$${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                                  p.value?.toLocaleString('pt-BR')
                                }`}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: '#ffffff10' }} 
                  />
                  <Bar dataKey="Custo" fill="#f472b6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartContainer title="Top Modelos">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTopModels} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value} usos`} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                  <Bar dataKey="Volume" fill="#4ade80" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          

          {/* --- Análise de Modelos --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
            <div className="lg:col-span-1">
                 <ChartContainer title="Distribuição Geral de Modelos">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="30%" outerRadius="100%" data={filteredTopModels} startAngle={180} endAngle={-180}>
                            <RadialBar background dataKey='value' />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                            <Tooltip />
                        </RadialBarChart>
                     </ResponsiveContainer>
                 </ChartContainer>
            </div>
            <div className="lg:col-span-2">
                <ChartContainer title="Eficiência de Usuários - Custo por Mensagem">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userEfficiencyData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value.toFixed(3)}`} />
                            <YAxis 
                              type="category" 
                              dataKey="username" 
                              stroke="#9ca3af" 
                              fontSize={12} 
                              width={80}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0]?.payload;
                                  return (
                                    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg text-white text-sm shadow-lg">
                                      <p className="label font-bold mb-2">{data?.name || label}</p>
                                      <p className="text-gray-300 text-xs mb-1">@{data?.username}</p>
                                      <p className="text-blue-400">Volume: {data?.Volume} mensagens</p>
                                      <p className="text-green-400">Custo Total: ${data?.Custo?.toFixed(2)}</p>
                                      <p className="text-yellow-400">Custo/Mensagem: ${data?.CostPerMessage?.toFixed(4)}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              cursor={{ fill: '#ffffff10' }} 
                            />
                            <Bar dataKey="CostPerMessage" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}