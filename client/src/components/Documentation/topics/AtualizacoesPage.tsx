export default function AtualizacoesPage() {
    return (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">🔄 Histórico de Atualizações</h3>
            <p className="text-indigo-700">
              Acompanhe as principais mudanças e melhorias implementadas na plataforma.
            </p>
          </div>
    
          <div className="space-y-4">
            {[
              {
                date: "2024-06-01",
                version: "v2.1.0",
                type: "NOVO",
                title: "Modelo GPT-4o Disponível",
                description: "Adicionado suporte ao modelo GPT-4o da OpenAI, oferecendo melhor performance e capacidades expandidas.",
                details: [
                  "Suporte a até 15.000 tokens por requisição",
                  "Melhor compreensão de contexto",
                  "Respostas mais precisas e detalhadas",
                  "Compatibilidade com arquivos de imagem"
                ]
              },
              {
                date: "2024-05-15",
                version: "v2.0.5",
                type: "MELHORIA",
                title: "Limite de Tokens Aumentado",
                description: "O limite padrão de tokens foi aumentado para 8.000, permitindo respostas mais longas e detalhadas.",
                details: [
                  "Limite padrão: 8.000 tokens (era 4.000)",
                  "Configuração personalizável por usuário",
                  "Melhor controle de custos",
                  "Interface mais intuitiva para ajustes"
                ]
              },
              {
                date: "2024-05-01",
                version: "v2.0.0",
                type: "MAJOR",
                title: "Nova Interface de Usuário",
                description: "Redesign completo da interface para melhorar a experiência do usuário e facilitar o uso da plataforma.",
                details: [
                  "Interface mais limpa e moderna",
                  "Navegação simplificada",
                  "Templates organizados por categoria",
                  "Histórico de conversas melhorado"
                ]
              },
              {
                date: "2024-04-15",
                version: "v1.9.2",
                type: "CORREÇÃO",
                title: "Correções de Bugs",
                description: "Correções de problemas menores e melhorias de estabilidade.",
                details: [
                  "Corrigido problema de timeout em requisições longas",
                  "Melhorada a precisão do contador de tokens",
                  "Correção na exportação de arquivos",
                  "Otimização de performance geral"
                ]
              }
            ].map((update, index) => (
              <div key={index} className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
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
    
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">📞 Suporte e Feedback</h3>
            <p className="text-gray-300">
              Para reportar bugs, sugerir melhorias ou obter suporte, entre em contato com a equipe de TI através dos canais oficiais da empresa.
            </p>
          </div>
        </div>
      );
    }