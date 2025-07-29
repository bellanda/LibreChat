export default function AgentePage() {
  return (
    <div className="mx-auto space-y-8">
      {/* Capítulo: O que é um Agente */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          Capítulo: O que é um Agente?
        </h2>
        <p className="text-gray-200">
          Um agente é uma instância de IA pré-configurada com um conjunto de instruções (system prompt), 
          modelo e capacidades adicionais. Ele age de forma autônoma para executar tarefas específicas — 
          como responder perguntas, processar arquivos ou disparar APIs — seguindo sempre as regras e limites 
          definidos pelo usuário na configuração.
        </p>
      </div>


      {/* Passo 1 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 1: Acesse a seção de Agentes
        </h2>
        <p className="text-gray-200">
          No menu lateral da plataforma, clique em “Agentes” para abrir a lista de agentes existentes.
        </p>
        <img
          src="/assets/documentation/agenteStepByStep/passo1.png"
          alt="Passo 1"
          className="w-full h-auto rounded"
        />
      </div>

      {/* Passo 2 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 2: Clique em “Criar Agente”
        </h2>
        <p className="text-gray-200">
          No canto superior direito, pressione o botão verde “Criar” para iniciar a configuração de um novo agente.
        </p>
        <img
          src="/assets/documentation/agenteStepByStep/passo2.png"
          alt="Passo 2"
          className="w-full h-auto rounded"
        />
      </div>

      <div className=" flex justify-center">
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-1">
            <p >🔵</p> 
            <p className="text-blue-500">Opcional</p>
          </div>
          <div className="flex flex-row gap-1">
            <p>🟡</p> 
            <p className="text-yellow-500">Necessário, porém não afeta a funcionalidade do agente</p>
          </div>

          <div className="flex flex-row gap-1">
            <p>🔴</p> 
            <p className="text-red-500">Importante</p>
          </div>
        </div>
      </div>

      {/* Passo 3 */}
      <div className="space-y-2 ">
        <h2 className="text-xl font-semibold">
          Passo 3: Preencha o Nome e a Descrição
        </h2>
        <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">
          <strong>Nome:</strong> deixe um rótulo curto para identificar seu agente.<br/>
          <strong>Descrição:</strong> explique em uma frase qual é a função principal dele.
        </p>
        
      </div>

      {/* Passo 4 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 4: Defina as Instruções (Prompts do sistema)
        </h2>
        <p className="text-gray-200 border-l-4 border-red-500 pl-4">
          No campo “Instruções” você coloca as regras de comportamento do agente: tom de voz, limites de atuação, variáveis etc.
        </p>
        <p>
          Exemplos:
        </p>
        <pre className="text-gray-200 bg-gray-850 ">
          {`
          Você é um assistente de vendas de carros.
          Você deve responder apenas em português brasileiro.
          Responda apenas com o que é pedido.
          Não seja muito formal.
          Seja educado e amigável.
          Seja breve e direto.
          Seja objetivo.
          Seja claro.
          Seja preciso.
          `}
        </pre>
        
      </div>

      {/* Passo 5 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 5: Escolha o Modelo de IA
        </h2>
        <p className="text-gray-200 border-l-4 border-red-500 pl-4">
          No dropdown “Modelo”, selecione a versão de GPT (ou outro modelo) que seu agente deverá usar.
        </p>
        <img
          src="/assets/documentation/agenteStepByStep/passo5.png"
          alt="Passo 5"
          className="w-full h-auto rounded"
        />
        <p className="text-gray-200 border-l-4 border-red-500 pl-4">
          Essa etapa escolheremos o modelo de IA que o agente irá usar, o modelo escolhido será o que o agente irá usar para responder as perguntas.
        </p>
        <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">
          Outras informações como temperatura, top_p, etc. podem ser úteis para o agente, mas por padrão podemos deixar como está. Elas são capacidades extras, que podem ser usadas para melhorar a resposta do agente.
        </p>
        
        <div className="flex flex-col items-center ">
          <p className="mt-4">
              <strong>Após escolher o modelo, clique em "Salvar" e depois voltar</strong>
            </p>
          <img
            src="/assets/documentation/agenteStepByStep/passo5.1.png"
            alt="Passo 5.1"
            className="w-64 h-auto rounded"
          />
          
        </div>
      </div>

      {/* Passo 6 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 6: Capacidades
        </h2>
        <p>
          <em className="text-sm">Podemos ignorar a capacidade API do Interpretador de Código, pois não iremos usar ela</em>
        </p>
        <img src="/assets/documentation/agenteStepByStep/passo6.png" alt="Passo 6" className="w-full h-auto rounded" />
        <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">
          Habilite Web Search para buscar informações na internet.
        </p>
        <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">
          Suba arquivos PDF, DOCX, etc. para que o agente possa ler e entender o conteúdo.
        </p>
        
        
      </div>

      {/* Passo 7 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 7: Salvar e usar
        </h2>
        <p className="text-gray-200 border-l-4 border-blue-500 pl-4">
          Clique em "Salvar" para salvar as configurações do agente e depois vamos buscar o agente na lista de agentes.
        </p>
        <img src="/assets/documentation/agenteStepByStep/passo7.png" alt="Passo 7" className="w-full h-auto rounded" />
      </div>

      {/* Passo 8 */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Passo 8: Uso do agente
        </h2>
        <p className="text-gray-200 border-l-4 border-blue-500 pl-4">
          Agora que o agente está criado, você pode usá-lo para responder perguntas relacionadas aos arquivos que você subiu.
        </p>

        <p>
          Ex.
        </p>
        <pre className="text-gray-200 bg-gray-850">
          {`
          Qual o nome do produto?
          Qual o preço do produto?
          Qual média de vendas do produto?
          Qual dia da semana tem mais vendas?
          `}
        </pre>
      </div>


    </div>
  );
}
