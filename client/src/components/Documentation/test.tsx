export default function EngenhariaDePromptsPage() {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-12 text-gray-300">
  
        {/* Introdução */}
        <section className="prose prose-invert mx-auto">
          <p>
            Devido à forma como os modelos de IA são treinados, existem formatos de prompt específicos que funcionam particularmente bem e levam a saídas de modelo mais úteis. Abaixo apresentamos uma série de formatos de prompt que funcionam bem, mas sinta-se à vontade para explorar diferentes formatos, que podem se adaptar melhor à sua tarefa.
          </p>
          <p>
            <em>Dica: <strong>Use o modelo mais recente.</strong></em>
          </p>
        </section>
  
        {/* Exemplos de formatos */}
        <section className="space-y-8">
  
          {/* 1 */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              1. Inicie com instruções claras e separadores visuais
            </h2>
            <p className="italic">Use <code>###</code> ou <code>"""</code> para delimitar instruções e contexto.</p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-400">Menos eficaz ❌</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Resuma o texto abaixo como uma lista com marcadores dos pontos mais importantes.<br />
  `texto aqui`<br />
              </pre>
              <p className="text-sm font-medium text-green-400">Melhor ✅</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Resuma o texto abaixo como uma lista com marcadores dos pontos mais importantes.<br />
  Texto: `texto aqui`<br />
              </pre>
            </div>
          </div>
  
          {/* 2 */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              2. Seja específico, descritivo e detalhado
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-400">Menos eficaz ❌</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Escreva um poema sobre a OpenAI.
              </pre>
              <p className="text-sm font-medium text-green-400">Melhor ✅</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Escreva um poema inspirador sobre a OpenAI, focando no lançamento recente do produto DALL-E (DALL-E é um modelo de ML de texto para imagem) no estilo de um {'{poeta famoso}'}.
              </pre>
            </div>
          </div>
  
          {/* 3 */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              3. Exemplifique o formato de saída desejado
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-400">Menos eficaz ❌</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Extraia as entidades mencionadas no texto abaixo. Extraia os seguintes 4 tipos de entidade: nomes de empresas, nomes de pessoas, tópicos específicos e temas gerais.
              </pre>
              <p className="text-sm font-medium text-green-400">Melhor ✅</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Extraia as entidades importantes mencionadas no texto abaixo. Primeiro, extraia todos os nomes de empresas, depois extraia todos os nomes de pessoas, depois extraia tópicos específicos que se ajustem ao conteúdo e, finalmente, extraia temas gerais sobrepostos.
  
  Formato desejado:
  - Nomes de empresas: &lt;lista&gt;
  - Nomes de pessoas: &lt;lista&gt;
  - Tópicos específicos: &lt;lista&gt;
  - Tema geral: &lt;descrição&gt;
              </pre>
            </div>
          </div>
  
          {/* 4 */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              4. Prossiga de zero-shot a few-shot antes do fine-tuning
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-400">✅ Zero-shot</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Extraia palavras-chave do texto abaixo. 
  Texto: `texto aqui`
  Palavras-chave:
              </pre>
              <p className="text-sm font-medium text-green-400">✅ Few-shot</p>
              <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto">
  Texto 1: Stripe provides APIs ...
  Palavras-chave 1: Stripe, payment processing, APIs
  ##
  Texto 2: OpenAI has trained cutting-edge language models ...
  Palavras-chave 2: OpenAI, language models, text processing
  ##
  Texto 3: {'{texto}'}
  Palavras-chave 3:
              </pre>
            </div>
          </div>
  
          {/* 5 a 7 podem ser adicionados seguindo o mesmo padrão... */}
          {/* ... */}
  
        </section>
      </div>
    );
  }
  