
export default function PrimeiroPromptPage() {
  return (
    <div className="mx-auto p-2 text-gray-100 ">

      {/* Seção 1 */}
      <h2 className="text-2xl font-semibold text-white mt-8 mb-3">O que é um Prompt?</h2>
      <p className="mb-4">
        Um <span className="font-semibold text-green-300">prompt</span> é uma instrução, pergunta ou qualquer texto que você fornece a um modelo de Inteligência Artificial para que ele execute uma tarefa.
        A qualidade do seu prompt determina diretamente a relevância e precisão da resposta gerada.
      </p>
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-200 mb-6">
        <p>
          <span className="font-semibold">Analogia:</span> Se a IA é um gênio poderoso, o prompt é o seu pedido. Um pedido vago pode trazer resultados inesperados, mas um pedido claro traz exatamente o que você deseja.
        </p>
      </blockquote>

      {/* Seção 2 */}
      <h2 className="text-2xl font-semibold text-white mt-8 mb-3">Anatomia de um Prompt Eficaz</h2>
      <p className="mb-4">Um prompt bem formulado combina quatro elementos essenciais:</p>

      <h3 className="text-xl font-medium text-green-300 mt-4">1. Persona (Quem a IA deve ser)</h3>
      <p className="mb-3">
        Defina o papel ou estilo que a IA deve adotar. <br />
        {/* <span className="bg-gray-800 px-2 py-1 rounded font-mono">Ex.: "Aja como um historiador especialista no Brasil colonial..."</span> */}
        <pre className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
            Ex.: Aja como um historiador especialista no Brasil colonial...
          </pre>
      </p>

      <h3 className="text-xl font-medium text-green-300 mt-4">2. Contexto (O cenário)</h3>
      <p className="mb-3">
        Ofereça o contexto necessário para que a IA entenda propósito e público. <br />
        <pre className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
            Ex.: "...e prepare material de estudo para alunos do ensino médio."
          </pre>
      </p>

      <h3 className="text-xl font-medium text-green-300 mt-4">3. Tarefa (A instrução clara)</h3>
      <p className="mb-3">
        Seja explícito sobre a ação desejada, usando verbos de ação. <br />
        <pre className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
            Ex.: Crie um resumo dos três principais ciclos econômicos do período.
          </pre>
      </p>

      <h3 className="text-xl font-medium text-green-300 mt-4">4. Formato (A estrutura da resposta)</h3>
      <p className="mb-6">
        Especifique como quer receber a informação. <br />
        <pre className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
            Ex.: Apresente em lista numerada, cada ciclo com título e dois parágrafos.
          </pre>
      </p>

      {/* Seção 3 */}
      <h2 className="text-2xl font-semibold text-white mt-8 mb-3">Exemplo Completo de Prompt</h2>
      <p className="mb-4">Compare um prompt genérico com um bem estruturado:</p>
      <blockquote className="border-l-4 border-red-500 pl-4 text-gray-200 mb-4">
        <p><strong>Prompt Fraco:</strong></p>
        <pre className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
          Fale sobre a economia do Brasil antigo.
        </pre>
      </blockquote>
      <blockquote className="border-l-4 border-green-500 pl-4 text-gray-200 mb-6">
        <p>
          <strong>Prompt Forte:</strong>
        </p>
        <pre className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
          Aja como um historiador especialista no Brasil colonial preparando material de estudo para alunos do ensino médio. Crie um resumo dos três principais ciclos econômicos (Pau-Brasil, Cana-de-Açúcar e Ouro). Apresente em lista numerada, cada ciclo com título e dois parágrafos explicando importância e características.
        </pre>
      </blockquote>

      {/* Seção 4 */}
      <h2 className="text-2xl font-semibold text-white mt-8 mb-3">Dicas Práticas para Melhores Prompts</h2>
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Seja específico e detalhado:</strong> Evite ambiguidades; forneça todos os dados relevantes.</li>
        <li><strong>Use exemplos (few-shot):</strong> Mostre à IA o padrão de resposta esperado.</li>
        <li><strong>Itere e refine:</strong> Ajuste seu prompt a partir do feedback gerado.</li>
        <li><strong>Prefira afirmações claras:</strong> Em vez de negações complexas use instruções positivas.</li>
        <li><strong>Divida tarefas complexas:</strong> Quebre pedidos grandes em subtarefas menores.</li>
      </ul>
    </div>
  );
}
