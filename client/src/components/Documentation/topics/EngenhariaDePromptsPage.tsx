export default function EngenhariaDePromptsPage() {
  return (
    <div className=" space-y-12 text-gray-300">

      {/* Introdução */}
      <section className="prose  mx-auto ">
        <p className="text-gray-300 whitespace-pre-wrap text-justify">
          Devido à forma como os modelos de IA são treinados, existem formatos de prompt específicos que funcionam particularmente bem e levam a saídas de modelo mais úteis. Abaixo apresentamos uma série de formatos de prompt que funcionam bem, mas sinta-se à vontade para explorar diferentes formatos, que podem se adaptar melhor à sua tarefa.
        </p>
        <p className="text-gray-300 whitespace-pre-wrap text-justify">
          <em>Use o modelo mais recente.</em>
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
              Text: """
                {"{text input here}"}
                """<br />
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
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
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
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              Extraia as entidades mencionadas no texto abaixo. Extraia os seguintes 4 tipos de entidade: nomes de empresas, nomes de pessoas, tópicos específicos e temas gerais.
            </pre>
            <p className="text-sm font-medium text-green-400">Melhor ✅</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              Extraia as entidades importantes mencionadas no texto abaixo. Primeiro, extraia todos os nomes de empresas, depois extraia todos os nomes de pessoas, depois extraia tópicos específicos que se ajustem ao conteúdo e, finalmente, extraia temas gerais sobrepostos.

              Formato desejado: <br />
              - Nomes de empresas: &lt;lista&gt; <br />
              - Nomes de pessoas: &lt;lista&gt; <br />
              - Tópicos específicos: &lt;lista&gt; <br />
              - Tema geral: &lt;descrição&gt; <br />
            </pre>
          </div>
        </div>

        {/* 4 */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
            4. Dê exemplos de entrada e saída
          </h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-400">✅ Zero-shot</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              Extraia palavras-chave do texto abaixo. <br />
              Texto: `texto aqui` <br />
              Palavras-chave:
            </pre>
            <p className="text-sm font-medium text-green-400">✅ Few-shot</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              Texto 1: Stripe provides APIs ... <br />
              Palavras-chave 1: Stripe, payment processing, APIs <br />
              ## <br />
              Texto 2: OpenAI has trained cutting-edge language models ... <br />
              Palavras-chave 2: OpenAI, language models, text processing <br />
              ## <br />
              Texto 3: {'{texto}'} <br />
              Palavras-chave 3:
            </pre>
          </div>
        </div>

        {/* 5 */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
            5. Reduza descrições vagas e imprecisas
          </h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-400">Menos eficaz ❌</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              A descrição para este produto deve ser bastante curta, apenas algumas frases, e não muito mais. <br />  
            </pre>
            <p className="text-sm font-medium text-green-400">Melhor ✅</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              Use um parágrafo de 3 a 5 frases para descrever este produto. <br />
            </pre>
          </div>
        </div>

        {/* 6 */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
            6. Em vez de apenas dizer o que não fazer, diga o que fazer
          </h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-400">Menos eficaz ❌</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              A seguir, uma conversa entre um agente e um cliente. NÃO PERGUNTE NOME DE USUÁRIO OU SENHA. NÃO REPITA.
              <br />
              <br />
              Customer: Não consigo fazer login na minha conta.
              <br />
              Agent:
            </pre>
            <p className="text-sm font-medium text-green-400">Melhor ✅</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              A seguir, uma conversa entre um Agente e um Cliente. O agente tentará diagnosticar o problema e sugerir uma solução, evitando fazer perguntas relacionadas a PII. Em vez de solicitar PII, como nome de usuário ou senha, encaminhe o usuário para o artigo de ajuda em www.samplewebsite.com/help/faq <br />
              <br />
              Customer: Não consigo fazer login na minha conta.
              <br />
              Agent:
            </pre>
          </div>
        </div>

        {/* 7 */}
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
            7. Use palavras-chave para guiar o modelo
          </h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-400">Menos eficaz ❌</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              # Escreva uma função python simples que <br />
              # 1. Peça-me um número em milhas <br />
              # 2. Converta milhas para quilômetros <br />
            </pre>
            <p className="text-sm font-medium text-green-400">Melhor ✅</p>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 whitespace-pre-wrap">
              # keywords: input, conversion, print <br />
              # Escreva uma função python que solicite um valor em milhas e imprima o equivalente em quilômetros.
              <br />
              <br />
              import
            </pre>
          </div>
        </div>

      </section>
    </div>
  );
}
