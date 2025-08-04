
/**
 * Componente genérico para blocos de código pré-formatado.
 * Aplica classes Tailwind padronizadas conforme solicitado.
 */
const PreBlock = ({ children }) => (
  <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-100 overflow-auto whitespace-pre-wrap">
    {children}
  </pre>
);

/**
 * Componente para seções da página.
 * Recebe título, ID (para ancoragem) e conteúdo como children.
 */
const Section = ({ id, title, children }) => (
  <section id={id} className="mb-12">
    <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
    {children}
  </section>
);

export default function EngenhariaDePromptsPage() {
  return (
    <div className="mx-auto text-gray-100 text-justify">
      {/* Seção 1: Definição de Prompt */}
      <Section id="o-que-e-um-prompt" title="O que é um Prompt?">
        <p>
          Um <span className="font-semibold text-green-300">prompt</span> é uma instrução, pergunta ou qualquer texto que você fornece a um modelo de Inteligência Artificial para que ele execute uma tarefa. A qualidade do seu prompt determina diretamente a relevância e precisão da resposta gerada.
        </p>
        <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-6 mt-6">
          <p>
            <span className="font-semibold">Analogia:</span> Se a IA é um gênio poderoso, o prompt é o seu pedido. Um pedido vago pode trazer resultados inesperados, mas um pedido claro traz exatamente o que você deseja.
          </p>
        </blockquote>
        <p>
          Devido à forma como os modelos de IA são treinados, existem formatos de prompt específicos que funcionam particularmente bem e levam a saídas de modelo mais úteis. Abaixo apresentamos uma série de formatos de prompt que funcionam bem, mas sinta-se à vontade para explorar diferentes formatos, que podem se adaptar melhor à sua tarefa.
        </p>
      </Section>

      {/* Seção 2: Anatomia de um Prompt Eficaz */}
      <Section id="anatomia-prompt" title="Anatomia de um Prompt Eficaz">
        <p className="mb-6">Um prompt bem formulado combina quatro elementos essenciais:</p>

        {/* 1. Persona */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-green-300 mb-2">
            1. Persona (Quem a IA deve ser)
          </h3>
          <p>Defina o papel ou estilo que a IA deve adotar.</p>
          <PreBlock>
            Ex.: Aja como um historiador especialista no Brasil colonial...
          </PreBlock>
        </div>

        {/* 2. Contexto */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-green-300 mb-2">
            2. Contexto (O cenário)
          </h3>
          <p>Ofereça o contexto necessário para que a IA entenda propósito e público.</p>
          <PreBlock>
            Ex.: ...e prepare material de estudo para alunos do ensino médio.
          </PreBlock>
        </div>

        {/* 3. Tarefa */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-green-300 mb-2">
            3. Tarefa (A instrução clara)
          </h3>
          <p>Seja explícito sobre a ação desejada, usando verbos de ação.</p>
          <PreBlock>
            Ex.: Crie um resumo dos três principais ciclos econômicos do período.
          </PreBlock>
        </div>

        {/* 4. Formato */}
        <div className="mb-6">
          <h3 className="text-xl font-medium text-green-300 mb-2">
            4. Formato (A estrutura da resposta)
          </h3>
          <p>Especifique como quer receber a informação.</p>
          <PreBlock>
            Ex.: Apresente em lista numerada, cada ciclo com título e dois parágrafos.
          </PreBlock>
        </div>
      </Section>

      {/* Seção 3: Exemplo Completo */}
      <Section id="exemplo-completo" title="Exemplo Completo de Prompt">
        <p>Compare um prompt genérico com um bem estruturado:</p>

        {/* Prompt Fraco */}
        <blockquote className="border-l-4 border-red-500 pl-4 mb-4">
          <p><strong>Prompt Fraco:</strong></p>
          <PreBlock>
            Fale sobre a economia do Brasil antigo.
          </PreBlock>
        </blockquote>

        {/* Prompt Forte */}
        <blockquote className="border-l-4 border-green-500 pl-4 mb-6">
          <p><strong>Prompt Forte:</strong></p>
          <PreBlock>
            Aja como um historiador especialista no Brasil colonial preparando material de estudo para alunos do ensino médio. Crie um resumo dos três principais ciclos econômicos (Pau-Brasil, Cana-de-Açúcar e Ouro). Apresente em lista numerada, cada ciclo com título e dois parágrafos explicando importância e características.
          </PreBlock>
        </blockquote>
      </Section>

      {/* Seção 4: Dicas Práticas para Melhores Prompts */}
      <Section id="dicas-praticas" title="Dicas Práticas para Melhores Prompts">
        {/* Dica 1 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            1. Inicie com instruções claras e separadores visuais
          </h3>
          <div>
            <p className="italic mb-2">
              Use <code>###</code> ou <code>"""</code> para delimitar instruções e contexto.
            </p>
            <p className="text-sm font-medium text-red-400 mb-1">Menos eficaz ❌</p>
            <PreBlock>
              Resuma o texto abaixo como uma lista com marcadores dos pontos mais importantes.<br />
              `texto aqui`<br />
            </PreBlock>
          </div>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">Melhor ✅</p>
            <PreBlock>
              Resuma o texto abaixo como uma lista com marcadores dos pontos mais importantes.<br />
              Text: """{"{text input here}"}"""<br />
            </PreBlock>
          </div>
        </div>

        {/* Dica 2 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            2. Seja específico, descritivo e detalhado
          </h3>
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Menos eficaz ❌</p>
            <PreBlock>
              Escreva um poema sobre a OpenAI.
            </PreBlock>
          </div>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">Melhor ✅</p>
            <PreBlock>
              Escreva um poema inspirador sobre a OpenAI, focando no lançamento recente do produto DALL-E (DALL-E é um modelo de ML de texto para imagem) no estilo de um {'{poeta famoso}'}.
            </PreBlock>
          </div>
        </div>

        {/* Dica 3 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            3. Exemplifique o formato de saída desejado
          </h3>
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Menos eficaz ❌</p>
            <PreBlock>
              Extraia as entidades mencionadas no texto abaixo. Extraia os seguintes 4 tipos de entidade: nomes de empresas, nomes de pessoas, tópicos específicos e temas gerais.
            </PreBlock>
            </div>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">Melhor ✅</p>
            <PreBlock>
              Extraia as entidades importantes mencionadas no texto abaixo. Primeiro, extraia todos os nomes de empresas, depois extraia todos os nomes de pessoas, depois extraia tópicos específicos que se ajustem ao conteúdo e, finalmente, extraia temas gerais sobrepostos.

              Formato desejado:<br />
              - Nomes de empresas: &lt;lista&gt;<br />
              - Nomes de pessoas: &lt;lista&gt;<br />
              - Tópicos específicos: &lt;lista&gt;<br />
              - Tema geral: &lt;descrição&gt;
            </PreBlock>
          </div>
        </div>

        {/* Dica 4 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            4. Dê exemplos de entrada e saída
          </h3>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">✅ Zero-shot</p>
            <PreBlock>
              Extraia palavras-chave do texto abaixo.<br />
              Texto: `texto aqui`<br />
              Palavras-chave:
            </PreBlock>
          </div>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">✅ Few-shot</p>
            <PreBlock>
              Texto 1: Stripe provides APIs ...<br />
              Palavras-chave 1: Stripe, payment processing, APIs<br />
              ##<br />
              Texto 2: OpenAI has trained cutting-edge language models ...<br />
              Palavras-chave 2: OpenAI, language models, text processing<br />
              ##<br />
              Texto 3: {'{texto}'}<br />
              Palavras-chave 3:
            </PreBlock>
          </div>
        </div>

        {/* Dica 5 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            5. Reduza descrições vagas e imprecisas
          </h3>
          <div>
          <p className="text-sm font-medium text-red-400 mb-1">Menos eficaz ❌</p>
            <PreBlock>
              A descrição para este produto deve ser bastante curta, apenas algumas frases, e não muito mais.
            </PreBlock>
          </div>
          <div>
          <p className="text-sm font-medium text-green-400 mb-1">Melhor ✅</p>
            <PreBlock>
              Use um parágrafo de 3 a 5 frases para descrever este produto.
            </PreBlock>
          </div>
        </div>

        {/* Dica 6 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            6. Em vez de apenas dizer o que não fazer, diga o que fazer
          </h3>
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Menos eficaz ❌</p>
            <PreBlock>
              A seguir, uma conversa entre um agente e um cliente. NÃO PERGUNTE NOME DE USUÁRIO OU SENHA. NÃO REPITA.<br /><br />
              Customer: Não consigo fazer login na minha conta.<br />
              Agent:
            </PreBlock>
          </div>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">Melhor ✅</p>
            <PreBlock>
              A seguir, uma conversa entre um Agente e um Cliente. O agente tentará diagnosticar o problema e sugerir uma solução, evitando fazer perguntas relacionadas a PII. Em vez de solicitar PII, como nome de usuário ou senha, encaminhe o usuário para o artigo de ajuda em www.samplewebsite.com/help/faq<br /><br />
              Customer: Não consigo fazer login na minha conta.<br />
              Agent:
            </PreBlock>
          </div>
        </div>

        {/* Dica 7 */}
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            7. Use palavras-chave para guiar o modelo
          </h3>
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Menos eficaz ❌</p>
            <PreBlock>
              # Escreva uma função python simples que<br />
              # 1. Peça-me um número em milhas<br />
              # 2. Converta milhas para quilômetros
            </PreBlock>
          </div>
          <div>
            <p className="text-sm font-medium text-green-400 mb-1">Melhor ✅</p>
            <PreBlock>
              # keywords: input, conversion, print<br />
              # Escreva uma função python que solicite um valor em milhas e imprima o equivalente em quilômetros.<br /><br />
              import
            </PreBlock>
          </div>
        </div>
      </Section>
    </div>
  );
}
