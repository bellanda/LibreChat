import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

//==============================================================================
// 1. DEFINIÇÃO DE TIPOS (TYPESCRIPT)
//==============================================================================

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType?: 'positive' | 'negative';
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

interface TableCardProps {
  title: string;
  headers: string[];
  data: Record<string, string | number>[];
}

type VisitorData = {
  date: string;
  total: number;
  mobile: number;
};

type ReportData = {
  kpis: {
    totalRevenue: Omit<KPICardProps, 'title'>;
    newCustomers: Omit<KPICardProps, 'title'>;
    activeAccounts: Omit<KPICardProps, 'title'>;
    growthRate: Omit<KPICardProps, 'title'>;
  };
  totalVisitors: {
    last3months: VisitorData[];
    last30days: VisitorData[];
    last7days: VisitorData[];
  };
  topLists: {
    usersByMessages: { '#': number; 'Usuário': string; 'Volume': string }[];
    usersByCost: { '#': number; 'Usuário': string; 'Custo': string }[];
    usersByFiles: { '#': number; 'Usuário': string; 'Arquivos': number }[];
    largestFiles: { '#': number; 'Arquivo': string; 'Tamanho': string; 'Usuário': string }[];
  };
  modelUsage: { name: string; value: number; fill: string }[];
};


//==============================================================================
// 2. DADOS DE EXEMPLO (MOCK DATA)
//==============================================================================

const reportData: ReportData = {
  kpis: {
    totalRevenue: {
      value: '$1,250.00',
      change: '+12.5%',
      changeType: 'positive',
    },
    newCustomers: {
      value: '1,234',
      change: '-20%',
      changeType: 'negative',
    },
    activeAccounts: {
      value: '45,678',
      change: '+12.5%',
      changeType: 'positive',
    },
    growthRate: {
      value: '4.5%',
      change: '+4.5%',
      changeType: 'positive',
    },
  },
  totalVisitors: {
    last3months: [
      { date: 'Apr 5', total: 65, mobile: 40 },
      { date: 'Apr 11', total: 150, mobile: 90 },
      { date: 'Apr 17', total: 100, mobile: 60 },
      { date: 'Apr 23', total: 200, mobile: 120 },
      { date: 'Apr 29', total: 280, mobile: 180 },
      { date: 'May 5', total: 250, mobile: 150 },
      { date: 'May 11', total: 180, mobile: 110 },
      { date: 'May 17', total: 350, mobile: 220 },
      { date: 'May 23', total: 220, mobile: 140 },
      { date: 'May 29', total: 180, mobile: 100 },
      { date: 'Jun 4', total: 300, mobile: 190 },
      { date: 'Jun 10', total: 220, mobile: 150 },
      { date: 'Jun 16', total: 400, mobile: 280 },
      { date: 'Jun 22', total: 350, mobile: 240 },
      { date: 'Jun 29', total: 280, mobile: 190 },
    ],
    last30days: [ // Dados de exemplo para 30 dias
      { date: 'Day 1', total: 220, mobile: 140 },
      { date: 'Day 5', total: 250, mobile: 160 },
      { date: 'Day 10', total: 300, mobile: 200 },
      { date: 'Day 15', total: 280, mobile: 180 },
      { date: 'Day 20', total: 350, mobile: 250 },
      { date: 'Day 25', total: 400, mobile: 280 },
      { date: 'Day 30', total: 380, mobile: 260 },
    ],
    last7days: [ // Dados de exemplo para 7 dias
      { date: 'Mon', total: 50, mobile: 30 },
      { date: 'Tue', total: 60, mobile: 40 },
      { date: 'Wed', total: 80, mobile: 50 },
      { date: 'Thu', total: 70, mobile: 45 },
      { date: 'Fri', total: 90, mobile: 60 },
      { date: 'Sat', total: 120, mobile: 80 },
      { date: 'Sun', total: 110, mobile: 70 },
    ],
  },
  topLists: {
    usersByMessages: [
      { '#': 1, 'Usuário': 'ana.silva@example.com', 'Volume': '12,450' },
      { '#': 2, 'Usuário': 'bruno.costa@example.com', 'Volume': '11,980' },
      { '#': 3, 'Usuário': 'carla.dias@example.com', 'Volume': '10,500' },
      { '#': 4, 'Usuário': 'diego.fernandes@example.com', 'Volume': '9,800' },
      { '#': 5, 'Usuário': 'elisa.gomes@example.com', 'Volume': '9,540' },
    ],
    usersByCost: [
      { '#': 1, 'Usuário': 'bruno.costa@example.com', 'Custo': '$ 150.20' },
      { '#': 2, 'Usuário': 'ana.silva@example.com', 'Custo': '$ 145.80' },
      { '#': 3, 'Usuário': 'fernanda.lima@example.com', 'Custo': '$ 130.00' },
      { '#': 4, 'Usuário': 'carla.dias@example.com', 'Custo': '$ 121.10' },
      { '#': 5, 'Usuário': 'hugo.martins@example.com', 'Custo': '$ 115.50' },
    ],
    usersByFiles: [
      { '#': 1, 'Usuário': 'gabriel.rocha@example.com', 'Arquivos': 250 },
      { '#': 2, 'Usuário': 'elisa.gomes@example.com', 'Arquivos': 231 },
      { '#': 3, 'Usuário': 'diego.fernandes@example.com', 'Arquivos': 210 },
      { '#': 4, 'Usuário': 'ana.silva@example.com', 'Arquivos': 198 },
      { '#': 5, 'Usuário': 'bruno.costa@example.com', 'Arquivos': 180 },
    ],
    largestFiles: [
        { '#': 1, 'Arquivo': 'relatorio_anual_2024.pdf', 'Tamanho': '150 MB', 'Usuário': 'ana.silva' },
        { '#': 2, 'Arquivo': 'dataset_vendas_q2.csv', 'Tamanho': '120 MB', 'Usuário': 'bruno.costa' },
        { '#': 3, 'Arquivo': 'apresentacao_clientes.pptx', 'Tamanho': '95 MB', 'Usuário': 'carla.dias' },
        { '#': 4, 'Arquivo': 'video_treinamento.mp4', 'Tamanho': '80 MB', 'Usuário': 'diego.fernandes' },
        { '#': 5, 'Arquivo': 'backup_sistema.zip', 'Tamanho': '75 MB', 'Usuário': 'elisa.gomes' },
    ],
  },
  modelUsage: [
    { name: 'GPT-4o', value: 45, fill: '#60a5fa' },
    { name: 'GPT-3.5-Turbo', value: 30, fill: '#a78bfa' },
    { name: 'Embeddings', value: 15, fill: '#f472b6' },
    { name: 'Outros', value: 10, fill: '#4ade80' },
  ],
};

//==============================================================================
// 3. COMPONENTES REUTILIZÁVEIS
//==============================================================================

const ArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType = 'positive' }) => {
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-[#1c1c1c] p-3 rounded-lg border border-gray-700 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-gray-400">
          <span>{title}</span>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
              <span>{change}</span>
            </div>
          )}
        </div>
        <h2 className="text-white text-2xl font-bold my-1">{value}</h2>
      </div>
    </div>
  );
};

const ChartCard: React.FC<ChartCardProps> = ({ title, children, action }) => (
  <div className="bg-[#1c1c1c] p-5 rounded-lg border border-gray-700">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white font-bold text-lg">{title}</h3>
      {action && <div>{action}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const TableCard: React.FC<TableCardProps> = ({ title, headers, data }) => (
  <div className="bg-[#1c1c1c] p-5 rounded-lg border border-gray-700">
    <h3 className="text-white font-bold text-lg mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-white text-sm">
        <thead>
          <tr className="text-left border-b border-gray-700 text-gray-400">
            {headers.map((header) => (
              <th key={header} className="p-2 font-semibold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-700/50 hover:bg-gray-800/50">
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CustomChartTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-2 rounded-lg text-white text-sm">
        <p className="label font-bold">{`${label}`}</p>
        <p style={{ color: payload[0].color }}>{`Total: ${payload[0].value}`}</p>
        <p style={{ color: payload[1].color }}>{`Mobile: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};


//==============================================================================
// 4. COMPONENTE PRINCIPAL DO DASHBOARD
//==============================================================================

export default function Reports() {
  const [timeframe, setTimeframe] = React.useState<keyof ReportData['totalVisitors']>('last3months');

  const { kpis, totalVisitors, topLists, modelUsage } = reportData;

  const renderTimeframeButton = (key: keyof ReportData['totalVisitors'], label: string) => (
    <button
      onClick={() => setTimeframe(key)}
      className={`px-4 py-1 text-sm rounded-md transition-colors ${
        timeframe === key ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">IA HPE</h1>
        <button className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Quick Create
        </button>
      </header>

      {/* Seção de KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Gastos" {...kpis.totalRevenue} />
        <KPICard title="Novos Usuários" {...kpis.newCustomers} />
        <KPICard title="Usuários Ativos" {...kpis.activeAccounts} />
        <KPICard title="Growth Rate" {...kpis.growthRate} />
      </div>

      {/* Gráfico Principal de Visitantes */}
      <ChartCard
        title="Total Visitors"
        action={
          <div className="flex space-x-2 mb-2">
            {renderTimeframeButton('last3months', 'Last 3 months')}
            {renderTimeframeButton('last30days', 'Last 30 days')}
            {renderTimeframeButton('last7days', 'Last 7 days')}
          </div>
        }
      >
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <AreaChart data={totalVisitors[timeframe]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              <Area type="monotone" dataKey="mobile" stroke="#82ca9d" strokeWidth={2} fillOpacity={1} fill="url(#colorMobile)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Seção de Tabelas e Gráfico de Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
        <div className="lg:col-span-2">
            <TableCard 
                title="TOP 5 Pessoas que Mais Enviam Arquivos"
                headers={['#', 'Usuário', 'Arquivos Enviados']}
                data={topLists.usersByFiles}
            />
        </div>
        <ChartCard title="Modelos Mais Utilizados">
            <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={modelUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5}>
                            {modelUsage.map((entry) => <Cell key={entry.name} fill={entry.fill} stroke={entry.fill} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        <TableCard 
            title="TOP 5 Usuários por Volume de Mensagens"
            headers={['#', 'Usuário', 'Volume']}
            data={topLists.usersByMessages}
        />
        <TableCard 
            title="TOP 5 Usuários por Gasto"
            headers={['#', 'Usuário', 'Custo']}
            data={topLists.usersByCost}
        />
      </div>
       <div className="grid grid-cols-1 gap-6 my-8">
        <TableCard 
            title="TOP 5 Maiores Arquivos"
            headers={['#', 'Arquivo', 'Tamanho', 'Usuário']}
            data={topLists.largestFiles}
        />
       </div>
    </div>
  );
}