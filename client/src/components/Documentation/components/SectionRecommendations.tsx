export default function SectionRecommendations({title, items, models}: {title: string, items: string[], models: any[]}) {
    return (
    <div className='mt-12'>
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="pl-4 pb-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-white">Modelo</th>
                <th className="px-4 py-2 text-left text-white">Custo</th>
                <th className="px-4 py-2 text-left text-white">Velocidade</th>
                <th className="px-4 py-2 text-left text-white">Capacidade</th>
            </tr>
          </thead>
          {models.map((model) => (
            <tr key={model.name} className="hover:bg-gray-700 transition-colors">
              <td className="px-4 py-2 text-gray-300 font-semibold text-green-300">{model.name}</td>
              <td className="px-4 py-2 text-gray-200">{model.cost}</td>
              <td className="px-4 py-2 text-gray-200">{model.speed}</td>
              <td className="px-4 py-2 text-gray-200">{model.capacity}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}   