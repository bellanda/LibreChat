import { FC } from 'react';

const CostCenterInput: FC<{
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
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

export default CostCenterInput;