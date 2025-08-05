import CodeBlock from "./components/CodeBlock";


export interface Step {
    number: number;
    icon: string;
    title: string;
    description: string;
    img?: string | null;
    tip?: string;
    link?: string;
}





export const platform_step_by_step: Step[] = [
    {
        number: 1,
        icon: '🔗',
        title: 'Acesse a Plataforma',
        description:
            'Navegue para a página principal da plataforma através do link interno da empresa: ',
        img: '/assets/documentation/platformStepByStep/passo1.png',
        tip: 'Certifique-se de estar conectado à VPN corporativa.',
        link: 'https://ia.hpeautos.com.br/',
    },
    {
        number: 2,
        icon: '🧠',
        title: 'Escolha o Modelo',
        description:
            'Selecione o modelo de IA desejado no menu suspenso disponível.',
        img: '/assets/documentation/platformStepByStep/passo2.png',
        tip: 'Para iniciantes, leia o glossário e escolha um modelo que equilibre velocidade e qualidade.',
    },
    {
        number: 3,
        icon: '📝',
        title: 'Digite seu Prompt',
        description:
            'Escreva sua instrução na caixa de texto ou selecione um template pronto.',
        img: '/assets/documentation/platformStepByStep/passo3.png'


    },
    {
        number: 4,
        icon: '▶️',
        title: 'Execute a Solicitação',
        description:
            "Clique no botão 'ENVIAR' para enviar seu prompt.",
        img: null,
        tip: 'Aguarde alguns segundos enquanto a IA processa.',
    },
    {
        number: 5,
        icon: '📥',
        title: 'Copie ou Baixe',
        description:
            'Use os botões para copiar a resposta ou baixar como arquivo de texto.',
        img: '/assets/documentation/platformStepByStep/passo5.png',
        tip: 'Você pode copiar para a área de transferência ou salvar localmente.',
    },
];







export const updates = [
    {
        date: "2025-07-28",
        version: "v1.0.0",
        type: "NOVO",
        title: "Lançamento da Plataforma",
        description: "Lançamento da plataforma de IA com suporte a diversos modelos de IA, de forma gratuita e sem limites de uso.",
        details: [
            "Suporte a diversos modelos de IA",
            "Melhor compreensão de contexto",
            "Respostas mais precisas e detalhadas"
        ]
    }

];



export const legendItemsAgent = [
    { color: 'blue-500', text: 'Opcional', emoji: '🔵' },
    { color: 'yellow-500', text: 'Recomendado para a funcionalidade', emoji: '🟡' },
    { color: 'red-500', text: 'Essencial / Importante', emoji: '🔴' },
];


export const agent_step_by_step = [
    {
      title: 'Passo 1: Acesse a seção de Agentes',
      description: 'No menu lateral da plataforma, clique em “Agentes” para abrir a lista de agentes existentes.',
      image: '/assets/documentation/agenteStepByStep/passo1.png',
    },
    {
      title: 'Passo 2: Clique em “Criar Agente”',
      description: 'No canto superior direito, pressione o botão verde “Criar” para iniciar a configuração de um novo agente.',
      image: '/assets/documentation/agenteStepByStep/passo2.png',
    },
    {
      title: 'Passo 3: Preencha o Nome e a Descrição',
      children: (
        <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">
          <strong>Nome:</strong> deixe um rótulo curto para identificar seu agente.<br/>
          <strong>Descrição:</strong> explique em uma frase qual é a função principal dele.
        </p>
      ),
    },
    {
      title: 'Passo 4: Defina as Instruções (Prompts do sistema)',
      children: (
        <>
          <p className="text-gray-200 border-l-4 border-red-500 pl-4">
            No campo “Instruções” você coloca as regras de comportamento do agente: tom de voz, limites de atuação, variáveis etc.
          </p>
          <p>Exemplos:</p>
          <CodeBlock language="text">
            {`Você é um assistente de vendas de carros.
Você deve responder apenas em português brasileiro.
Responda apenas com o que é pedido.
Não seja muito formal.
Seja educado e amigável.
Seja breve e direto.`}
          </CodeBlock>
        </>
      ),
    },
      {
      title: 'Passo 5: Escolha o Modelo de IA',
      image: '/assets/documentation/agenteStepByStep/passo5.png',
      children: (
        <>
          <p className="text-gray-200 border-l-4 border-red-500 pl-4">
            No dropdown “Modelo”, selecione a versão de GPT (ou outro modelo) que seu agente deverá usar.
          </p>
          <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">
            Outras informações como temperatura, top_p, etc. podem ser úteis, mas por padrão podemos deixar como está.
          </p>
          <div className="flex flex-col items-center mt-4">
            <p className="font-semibold">Após escolher o modelo, clique em "Salvar" e depois "Voltar".</p>
            <img
              src="/assets/documentation/agenteStepByStep/passo5.1.png"
              alt="Salvar e voltar"
              className="w-64 h-auto rounded mt-2"
            />
          </div>
        </>
      ),
    },
    {
      title: 'Passo 6: Capacidades',
      image: '/assets/documentation/agenteStepByStep/passo6.png',
      children: (
          <>
              <p className="text-sm italic">Podemos ignorar a capacidade "API do Interpretador de Código", pois não a usaremos.</p>
              <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">Habilite "Web Search" para buscar informações na internet.</p>
              <p className="text-gray-200 border-l-4 border-yellow-500 pl-4">Suba arquivos (PDF, DOCX, etc.) para que o agente possa processar o conteúdo.</p>
          </>
      )
    },
    {
        title: 'Passo 7: Salvar e usar',
        image: '/assets/documentation/agenteStepByStep/passo7.png',
        description: 'Clique em "Salvar" para gravar as configurações. Depois, vamos buscar o agente na lista.'
    },
    {
        title: 'Passo 8: Uso do agente',
        description: 'Agora que o agente está criado, você pode usá-lo para responder perguntas relacionadas aos arquivos que você subiu.',
        children: (
            <>
              <p>Exemplos de perguntas:</p>
              <CodeBlock language="text">
              {`Qual o nome do produto?
Qual o preço do produto?
Qual a média de vendas do produto?`}
              </CodeBlock>
            </>
        )
    }
  ];







  export const pastas_step_by_step = [
    {
      title: 'Passo 1: Acesse a seção de Pastas',
      description: 'No menu lateral da plataforma, clique em "Favoritos" para abrir a lista de pastas existentes.',
      image: '/assets/documentation/folderStepByStep/passo1.png',
    },
    {
      title: 'Passo 2: Dê seu título e Descrição',
      description: 'Ex: "Projeto 1" ou "Cliente 1"',
      image: '/assets/documentation/folderStepByStep/passo2.png',
    },
    {
      title: 'Passo 3: Abra o seu grupo de pastas por aqui',
      image: '/assets/documentation/folderStepByStep/passo3.png',
      description: 'Aqui ficará todas as pastas que você criar. Clicando ',
      children: (
        <p className="text-gray-200 border-l-4 border-blue-500 pl-4">
          <strong>Limpar tudo:</strong> Sai dos favoritos e volta para a lista padrão de chats.<br/>
          <strong>Testando:</strong> A pasta que foi criada no tutorial com um chat exemplo. Ao clicar teremos a lista de chats dela.
        </p>
      ),
    },
    {
      title: 'Passo 4: Conseguimos verificar todas pastas criadas',
      image: '/assets/documentation/folderStepByStep/passo4.png',
      description: 'Ao excluir uma pasta, os chats que estavam nela NÃO serão excluídos.',
    },
      {
      title: 'Passo 5: Exemplo prático de pastas',
      image: '/assets/documentation/folderStepByStep/passo5.png',
      
    },
    
  ];