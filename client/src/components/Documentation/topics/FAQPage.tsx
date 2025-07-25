export default function FAQPage() {
    return (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-semibold text-yellow-800 mb-4">❓ Perguntas Frequentes</h3>
            <p className="text-yellow-700">
              Respostas para as dúvidas mais comuns sobre o uso da plataforma de IA.
            </p>
          </div>
    
          <div className="space-y-4">
            {[
              {
                question: "Por que minha resposta veio cortada?",
                answer: "Provavelmente a resposta excedeu o limite de tokens definido.",
                solution: "Aumente o 'Limite de Tokens' nas configurações da ferramenta e execute o prompt novamente.",
                category: "Técnico"
              },
              {
                question: "Por que a execução está demorando muito?",
                answer: "A plataforma pode estar com uma alta demanda ou o prompt pode ser muito complexo.",
                solution: "Verifique o status da fila de execução no painel principal. Se o problema persistir, tente novamente em alguns minutos ou simplifique seu prompt.",
                category: "Performance"
              },
              {
                question: "Posso usar dados confidenciais da empresa?",
                answer: "Não, nunca inclua informações sensíveis, dados de clientes ou informações estratégicas nos prompts.",
                solution: "Use dados fictícios para exemplos ou consulte a política de segurança da empresa para casos específicos.",
                category: "Segurança"
              },
              {
                question: "Como posso melhorar a qualidade das respostas?",
                answer: "A qualidade depende muito de como você formula o prompt.",
                solution: "Seja específico, forneça contexto, use exemplos e defina claramente o formato desejado para a resposta.",
                category: "Uso"
              },
              {
                question: "Posso salvar meus prompts favoritos?",
                answer: "Atualmente não há funcionalidade de salvamento, mas você pode copiar e colar prompts que funcionaram bem.",
                solution: "Mantenha um arquivo de texto com seus prompts mais úteis para reutilização futura.",
                category: "Funcionalidade"
              },
              {
                question: "Qual a diferença entre os modelos disponíveis?",
                answer: "Diferentes modelos têm diferentes capacidades, velocidades e custos.",
                solution: "Para uso geral, o GPT-4o oferece bom equilíbrio. Para tarefas simples, modelos mais rápidos podem ser suficientes.",
                category: "Técnico"
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <span className="bg-indigo-900 text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold">
                    {faq.category}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-300 mb-1">Resposta:</h4>
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                  
                  <div className="bg-blue-900 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-200 mb-1">💡 Solução:</h4>
                    <p className="text-blue-200">{faq.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }