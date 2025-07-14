import { FC } from 'react';

const ModelSelect: FC<{label: string; selectedModels: string[]; availableModels: string[]; onToggleModel: (model: string) => void}> = ({ label, selectedModels, availableModels, onToggleModel }) => (
    <div className="mb-4">
      <label className="block text-gray-400 text-sm mb-2">{label}</label>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {(!availableModels || availableModels.length === 0) ? (
          <div className="text-gray-500 text-sm italic">Carregando modelos...</div>
        ) : (
          availableModels.map((model) => (
            <label key={model} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => onToggleModel(model)}
                className="rounded border-gray-700 bg-[#1c1c1c] text-blue-500 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-300 text-sm">{model}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );


  export default ModelSelect;