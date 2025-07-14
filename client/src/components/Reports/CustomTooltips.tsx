import { FC } from "react";


const CustomTooltip: FC<any> = ({ active, payload, label }) => {
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

  export default CustomTooltip;