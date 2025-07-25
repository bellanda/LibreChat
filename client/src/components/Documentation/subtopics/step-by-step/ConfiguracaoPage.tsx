export default function ConfiguracaoInicialPage() {
  return (
    <div className="space-y-6">

      <div className="space-y-4">
        {/* Configuração 1 */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Perfil
                </span>
                <h3 className="text-lg font-semibold text-white">Configurar Perfil de Usuário</h3>
              </div>
              <p className="text-gray-300 mb-2">Defina suas informações básicas e preferências de uso.</p>
              <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                <strong>💡 Dica:</strong> Configure seu nome completo e departamento para melhor identificação.
              </div>
            </div>
          </div>
        </div>

        {/* Configuração 2 */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Tema
                </span>
                <h3 className="text-lg font-semibold text-white">Escolher Tema Visual</h3>
              </div>
              <p className="text-gray-300 mb-2">Selecione entre tema claro, escuro ou automático baseado no sistema.</p>
              <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                <strong>💡 Dica:</strong> O tema escuro é recomendado para uso prolongado e economiza bateria.
              </div>
            </div>
          </div>
        </div>

        {/* Configuração 3 */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Notificações
                </span>
                <h3 className="text-lg font-semibold text-white">Configurar Notificações</h3>
              </div>
              <p className="text-gray-300 mb-2">Defina quando e como receber notificações sobre atualizações e novidades.</p>
              <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                <strong>💡 Dica:</strong> Ative notificações para ficar por dentro das novas funcionalidades.
              </div>
            </div>
          </div>
        </div>

        {/* Configuração 4 */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Segurança
                </span>
                <h3 className="text-lg font-semibold text-white">Configurações de Segurança</h3>
              </div>
              <p className="text-gray-300 mb-2">Configure autenticação de dois fatores e outras medidas de segurança.</p>
              <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                <strong>💡 Dica:</strong> Recomendamos ativar a autenticação de dois fatores para maior segurança.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}