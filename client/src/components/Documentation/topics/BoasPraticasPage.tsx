export default function BoasPraticasPage() {
    return (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold text-green-800 mb-4">✅ Melhores Práticas</h3>
            <p className="text-green-700">
              Siga estas diretrizes para obter os melhores resultados e usar a plataforma de forma eficiente e segura.
            </p>
          </div>
    
          <div className="grid gap-6">
            {[
              {
                title: "Seja Claro e Específico",
                description: "Dê contexto, exemplos e defina o formato da resposta desejada para obter melhores resultados.",
                tips: [
                  "Inclua o público-alvo da resposta",
                  "Especifique o tom desejado (formal, informal, técnico)",
                  "Defina o formato (lista, parágrafo, tabela)",
                  "Mencione o nível de detalhamento esperado"
                ],
                icon: "🎯"
              },
              {
                title: "Monitore o Limite de Tokens",
                description: "Se precisar de uma resposta mais longa, ajuste o limite de tokens nas configurações antes de executar.",
                tips: [
                  "Verifique o tamanho do seu prompt",
                  "Ajuste o limite conforme necessário",
                  "Considere dividir solicitações muito grandes",
                  "Use o contador de tokens quando disponível"
                ],
                icon: "📏"
              },
              {
                title: "Proteja Informações Sensíveis",
                description: "Nunca inclua dados pessoais, senhas, informações de clientes ou qualquer outra informação confidencial nos prompts.",
                tips: [
                  "Não inclua CPF, RG ou dados pessoais",
                  "Evite informações de contratos ou acordos",
                  "Não compartilhe credenciais de acesso",
                  "Use dados fictícios para exemplos"
                ],
                icon: "🔒"
              },
              {
                title: "Revise e Refine",
                description: "As respostas da IA são um ponto de partida. Sempre revise, edite e personalize o conteúdo gerado.",
                tips: [
                  "Verifique a precisão das informações",
                  "Adapte o tom para seu contexto",
                  "Adicione exemplos específicos da sua área",
                  "Teste diferentes abordagens se necessário"
                ],
                icon: "✏️"
              }
            ].map((practice, index) => (
              <div key={index} className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{practice.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{practice.title}</h3>
                    <p className="text-gray-300">{practice.description}</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">💡 Dicas Práticas:</h4>
                  <ul className="space-y-2">
                    {practice.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{tip}</span>
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