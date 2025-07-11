import { FC } from 'react';
import { ModelData } from "~/store/reports";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import ChartContainer from "../ChartContainer";

const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-3 rounded-lg text-white text-sm shadow-lg">
          <p className="label font-bold mb-2">{data?.name || label}</p>
          <p className="text-gray-300 text-xs mb-1">Centro de Custo {data?.code}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {`${p.name}: $${p.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

interface GraphCCcostProps {
    filteredTopCostCenters: ModelData[];
}

export default function GraphCCcost({ filteredTopCostCenters }: GraphCCcostProps) {
    // Filtra apenas centros de custo que têm dados de custo e ordena por custo decrescente
    const costCentersWithCost = filteredTopCostCenters
        .filter(cc => cc.Custo && cc.Custo > 0)
        .sort((a, b) => (b.Custo || 0) - (a.Custo || 0))
        .slice(0, 10); // Top 10 centros de custo mais caros

    return (    
        <ChartContainer title="Custo por Centro de Custo">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costCentersWithCost} layout="vertical" margin={{ top: 5, right: 60, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                    type="number" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickFormatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
                />
                <YAxis type="category" dataKey="code" stroke="#9ca3af" fontSize={12} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                <Bar 
                    dataKey="Custo" 
                    radius={[0, 4, 4, 0]}
                    label={{ position: 'right', fill: '#ffffff', fontSize: 12, formatter: (value) => `$${typeof value === 'number' ? value.toFixed(2) : value}` }}
                >
                    {costCentersWithCost.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
