
export default function GlossarioPage() {
  const models = [
    {
      company: "Google",
      models: [
        {
          name: "Gemini 2.5 Flash",
          description: "Modelo otimizado para velocidade, ideal para tarefas rápidas e respostas curtas com boa coerência.",
          tip: "Use em chatbots ou resumos rápidos."
        },
        {
          name: "Gemini 2.5 Flash Lite",
          description: "Versão mais leve do Flash, ainda mais rápida, com custo menor.",
          tip: "Bom para aplicações em larga escala e perguntas simples."
        },
        {
          name: "Gemini 2.5 Pro",
          description: "Foca na qualidade de respostas, ótimo para textos longos ou análises.",
          tip: "Ideal para redações, e-mails e conteúdos mais elaborados."
        }
      ]
    },
    {
      company: "OpenAI",
      models: [
        {
          name: "GPT-o3",
          description: "Modelo básico, rápido e eficiente.",
          tip: "Use para tarefas cotidianas, como resumos, traduções e respostas simples."
        },
        {
          name: "GPT-o4-mini",
          description: "Compacto, com desempenho surpreendente.",
          tip: "Equilibra bem custo e qualidade. Ótimo para projetos contínuos."
        },
        {
          name: "GPT-4.1",
          description: "Modelo avançado com excelente compreensão de contexto e geração de texto.",
          tip: "Perfeito para uso jurídico, técnico ou criativo de alto nível."
        },
        {
          name: "GPT-4.1-mini",
          description: "Versão compacta do 4.1, com ótimo desempenho e custo reduzido.",
          tip: "Use quando quiser qualidade próxima do 4.1, mas mais barato."
        },
        {
          name: "GPT-4.1-nano",
          description: "Modelo ultra leve, para tarefas rápidas e de baixa complexidade.",
          tip: "Ideal para assistentes embarcados e dispositivos com pouca memória."
        }
      ]
    },
    {
      company: "Anthropic",
      models: [
        {
          name: "Claude Sonnet 4",
          description: "Modelo de linguagem com ótimo raciocínio e ética.",
          tip: "Indicado para uso institucional, educacional e com foco em segurança."
        }
      ]
    },
    {
      company: "Groq",
      models: [
        {
          name: "Llama 4 Maverick",
          description: "Foco em velocidade extrema, ótimo para tempo real.",
          tip: "Use em interfaces onde a resposta instantânea é prioridade."
        },
        {
          name: "Llama 4 Scout",
          description: "Variante rápida e robusta para tarefas variadas.",
          tip: "Boa escolha para fluxos mistos com leitura, análise e geração de texto."
        },
        {
          name: "Kimi K2",
          description: "Modelo versátil da Groq, com boa fluidez e entendimento.",
          tip: "Útil para diálogos mais naturais e interações complexas."
        }
      ]
    }
  ];
  

  
  return (
        <div className="space-y-6">
          <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-sm border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Termos Técnicos Essenciais</h3>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-white mb-2">🤖 O que é um prompt?</h4>
                <p className="text-gray-300">
                Um prompt é a pergunta, comando ou instrução que você envia para a inteligência artificial. Quanto mais claro e específico for o seu prompt, melhor será a resposta da IA.
                </p>
                <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
                  <strong>Exemplo:</strong> "Escreva um resumo de 3 parágrafos sobre inteligência artificial"
                </div>
              </div>
    
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-white mb-2">🔤 O que é um token?</h4>
                <p className="text-gray-300">
                  A IA processa texto em pedaços chamados tokens. Um token pode ser uma palavra, parte de uma palavra ou um caractere de pontuação.
                </p>
                <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
                  <strong>Exemplo:</strong> "Olá, mundo!" = 3 tokens (Olá, vírgula, mundo!)
                </div>
              </div>
    
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-white mb-2">📏 Limite de Uso</h4>
                <p className="text-gray-300">
                  A quantidade máxima de tokens que pode ser usada em uma única requisição (prompt + resposta). Controla custos e evita respostas excessivamente longas.
                </p>
                <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
                  <strong>Padrão:</strong> 8.000 tokens por requisição
                </div>
              </div>
    
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-white mb-2">⚙️ Modelo</h4>
                <p className="text-gray-300">
                  O "cérebro" da IA que processa suas solicitações. Diferentes modelos têm diferentes capacidades, velocidades e custos.
                </p>
                <div className="p-3 bg-gray-800 rounded text-sm">
                  <div className="p-2 bg-gray-800 rounded ">
                    {models[0].models.map((model) => (
                      <p key={model.name}><strong>{model.name}:</strong>  {model.description}  <br /> </p>
                    ))}
                  </div>
                      
                  <div className="bg-gray-800 p-1 rounded-lg">
                    {models[1].models.map((model) => (
                        <p key={model.name}><strong>{model.name}:</strong>  {model.description}  <br /> </p>
                      ))}
                  </div>
                    
                  <div className="bg-gray-800 p-1 rounded-lg">
                    {models[2].models.map((model) => (
                        <p key={model.name}><strong>{model.name}:</strong>  {model.description}  <br /> </p>
                      ))}
                  </div>
                    
                </div>

              </div>

              </div>
            </div>
          </div>
      );
}