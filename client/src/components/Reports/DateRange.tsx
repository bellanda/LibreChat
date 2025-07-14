import { FC } from 'react';

const DateRange: FC<{label: string; startDate: string; endDate: string; onStartDateChange: (date: string) => void; onEndDateChange: (date: string) => void}> = ({ label, startDate, endDate, onStartDateChange, onEndDateChange }) => (
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

  export default DateRange;