export default function PoliticaUsoPage() {
    return (
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-xl font-semibold text-red-800 mb-4">⚠️ Política de Uso e Segurança</h3>
            <p className="text-red-700">
              Informações importantes sobre as regras de uso da plataforma e proteção de dados.
            </p>
          </div>
    
          <div className="space-y-6">
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">🔒 Proteção de Dados</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-white mb-2">Dados Proibidos</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Informações pessoais (CPF, RG, endereços)</li>
                    <li>Credenciais de acesso (senhas, tokens)</li>
                    <li>Dados de clientes ou fornecedores</li>
                    <li>Informações estratégicas da empresa</li>
                    <li>Contratos, acordos ou documentos confidenciais</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-white mb-2">Dados Permitidos</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Conteúdo público e informações gerais</li>
                    <li>Exemplos fictícios para demonstração</li>
                    <li>Dados anonimizados ou agregados</li>
                    <li>Informações já publicadas pela empresa</li>
                  </ul>
                </div>
              </div>
            </div>
    
            <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">📋 Regras de Uso</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">✅ O que é Permitido</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Uso para tarefas profissionais</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Geração de conteúdo criativo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Análise de dados públicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Automação de tarefas repetitivas</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">❌ O que é Proibido</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Uso para fins pessoais não relacionados ao trabalho</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Compartilhamento de credenciais</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Geração de conteúdo inadequado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Uso excessivo que impacte outros usuários</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
    
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h3 className="text-xl font-semibold text-amber-800 mb-4">⚠️ Monitoramento e Consequências</h3>
              <div className="space-y-3 text-amber-700">
                <p>
                  <strong>Monitoramento:</strong> O uso da plataforma é monitorado para garantir conformidade com as políticas de segurança.
                </p>
                <p>
                  <strong>Violations:</strong> Violações das políticas podem resultar em suspensão temporária ou permanente do acesso.
                </p>
                <p>
                  <strong>Suporte:</strong> Em caso de dúvidas sobre o que é permitido, entre em contato com o suporte de TI.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }