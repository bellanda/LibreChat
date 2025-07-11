import { FC } from 'react';
import { KPICardProps } from './interfaces';

const KPICard: FC<KPICardProps> = ({ title, value, change, changeType = 'positive' }) => {
    const isPositive = changeType === 'positive';
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
    return (
      <div className="bg-[#1c1c1c] p-2 rounded-xl border border-gray-700/50">
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <span>{title}</span>
          
        </div>
        <h2 className="text-white text-3xl font-bold my-1">{value}</h2>
        <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
            <span>{change}</span>
          </div>
      </div>
    );
  };

  export default KPICard;