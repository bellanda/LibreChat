import { updates } from "../utils";

export default function AtualizacoesPage() {
    return (
        <div className="space-y-6">
          {/* <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">🔄 Histórico de Atualizações</h3>
            <p className="text-indigo-700">
              Acompanhe as principais mudanças e melhorias implementadas na plataforma.
            </p>
          </div> */}
    
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div key={index} className="bg-gray-850 p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                      {update.type}
                    </span>
                    <span className="text-sm text-gray-400">{update.version}</span>
                  </div>
                  <span className="text-sm text-gray-400">{update.date}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{update.title}</h3>
                <p className="text-gray-300 mb-4">{update.description}</p>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">📋 Principais Mudanças:</h4>
                  <ul className="space-y-1">
                    {update.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-gray-300">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
    
          
        </div>
      );
    }