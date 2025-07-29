
export default function GlossarioPage() {
  return (
        <div className="space-y-6">
          <div >
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
    
    
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-white mb-2">⚙️ Modelo</h4>
                <p className="text-gray-300">
                  O "cérebro" da IA que processa suas solicitações. Diferentes modelos têm diferentes capacidades, velocidades e custos.
                </p>
                <div className="p-3 bg-gray-800 rounded text-sm">
                  
                <strong>Exemplo:</strong> GPT-4.1, Gemini 2.5 Pro, Claude 3.5 Sonnet, etc.
                  

                    
                </div>

              </div>

              </div>
            </div>
          </div>
      );
}