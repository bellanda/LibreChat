import CodeBlock from './components/CodeBlock';

// Constantes para as rotas da documentação
export const DOCUMENTATION_ROUTES = {
  VISAO_GERAL: '/documentation/visao-geral',
  GLOSSARIO: '/documentation/glossario',
  GLOSSARIO_PRECO_TOKENIZACAO: '/documentation/glossario/gb-preco-tokenizacao-limitacoes',
  PASSO_A_PASSO: '/documentation/passo-a-passo',
  PASSO_A_PASSO_AGENTES: '/documentation/passo-a-passo/pap-agentes',
  PASSO_A_PASSO_PASTAS: '/documentation/passo-a-passo/pap-pastas',
  ENGENHARIA_PROMPTS: '/documentation/engenharia-de-prompts',
  BOAS_PRATICAS: '/documentation/boas-praticas',
  POLITICA_USO: '/documentation/politica-de-uso-de-ia',
} as const;

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
    description: 'Selecione o modelo de IA desejado no menu suspenso disponível.',
    img: '/assets/documentation/platformStepByStep/passo2.png',
    tip: 'Para iniciantes, leia o glossário e escolha um modelo que equilibre velocidade e qualidade.',
  },
  {
    number: 3,
    icon: '📝',
    title: 'Digite seu Prompt',
    description: 'Escreva sua instrução na caixa de texto ou selecione um template pronto.',
    img: '/assets/documentation/platformStepByStep/passo3.png',
  },
  {
    number: 4,
    icon: '▶️',
    title: 'Execute a Solicitação',
    description: "Clique no botão 'ENVIAR' para enviar seu prompt.",
    img: null,
    tip: 'Aguarde alguns segundos enquanto a IA processa.',
  },
  {
    number: 5,
    icon: '📥',
    title: 'Copie ou Baixe',
    description:
      'Use os botões para copiar a resposta ou exportar para PDF, HTML, Texto, Markdown, CSV, JSON, etc.',
    img: '/assets/documentation/platformStepByStep/passo5.png',
    tip: 'Você pode copiar para a área de transferência ou salvar localmente.',
  },
];

export const updates = [
  {
    date: '2025-07-28',
    version: 'v1.0.0',
    type: 'NOVO',
    title: 'Lançamento da Plataforma',
    description:
      'Lançamento da plataforma de IA com suporte a diversos modelos de IA, de forma gratuita e sem limites de uso.',
    details: [
      'Suporte a diversos modelos de IA',
      'Melhor compreensão de contexto',
      'Respostas mais precisas e detalhadas',
    ],
  },
];

export const legendItemsAgent = [
  { color: 'blue-500', text: 'Opcional', emoji: '🔵' },
  { color: 'yellow-500', text: 'Recomendado para a funcionalidade', emoji: '🟡' },
  { color: 'red-500', text: 'Essencial / Importante', emoji: '🔴' },
];

export const agent_step_by_step = [
  {
    title: 'Passo 1: Acesse a seção de Agentes',
    description:
      'No menu lateral da plataforma, clique em “Agentes” para abrir a lista de agentes existentes.',
    image: '/assets/documentation/agenteStepByStep/passo1.png',
  },
  {
    title: 'Passo 2: Clique em “Criar Agente”',
    description:
      'No canto superior direito, pressione o botão verde “Criar” para iniciar a configuração de um novo agente.',
    image: '/assets/documentation/agenteStepByStep/passo2.png',
  },
  {
    title: 'Passo 3: Preencha o Nome e a Descrição',
    children: (
      <p className="pl-4 text-gray-200 border-l-4 border-yellow-500">
        <strong>Nome:</strong> deixe um rótulo curto para identificar seu agente.
        <br />
        <strong>Descrição:</strong> explique em uma frase qual é a função principal dele.
      </p>
    ),
  },
  {
    title: 'Passo 4: Defina as Instruções (Prompts do sistema)',
    children: (
      <>
        <p className="pl-4 text-gray-200 border-l-4 border-red-500">
          No campo “Instruções” você coloca as regras de comportamento do agente: tom de voz,
          limites de atuação, variáveis etc.
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
        <p className="pl-4 text-gray-200 border-l-4 border-red-500">
          No dropdown “Modelo”, selecione a versão de GPT (ou outro modelo) que seu agente deverá
          usar.
        </p>
        <p className="pl-4 text-gray-200 border-l-4 border-yellow-500">
          Outras informações como temperatura, top_p, etc. podem ser úteis, mas por padrão podemos
          deixar como está.
        </p>
        <h1 className="text-xl font-semibold">
          Após escolher o modelo, clique em "Salvar" e depois "Voltar".
        </h1>
        <div className="flex flex-col items-center mt-4"></div>
        <img
          src="/assets/documentation/agenteStepByStep/passo5.1.png"
          alt="Salvar e voltar"
          className="mt-2 w-full h-auto rounded"
        />
      </>
    ),
  },
  {
    title: 'Passo 6: Capacidades',
    image: '/assets/documentation/agenteStepByStep/passo6.png',
    children: (
      <>
        <p className="pl-4 text-gray-200 border-l-4 border-yellow-500">
          Api do Interpretador de Código: Para o modelo executar código, Python, Javascript, etc.
          por trás dos panos e ser capaz de responder com base nisso, para gerar planilhas, PDFs,
          realizar cálculos, etc
        </p>
        <p className="pl-4 text-gray-200 border-l-4 border-yellow-500">
          Habilite "Web Search" para buscar informações na internet.
        </p>
        <p className="pl-4 text-gray-200 border-l-4 border-yellow-500">
          Suba arquivos (PDF, DOCX, etc.) para que o agente possa responder com base no conteúdo
          completo de todos os documentos. Não se preocupe em subir muitos, ele consegue encontrar
          somente as informações relevantes dentre todos os documentos e responder com base nisso.
        </p>
      </>
    ),
  },
  {
    title: 'Passo 7: Compartilhar',
    description:
      'Você pode compartlhar o agente com todos os usuários da plataforma, pode compartilhar com usuários específicos (em breve com Grupos específicos) e também pode decidir de eles podem apenas usar o agente, editar ou são Owners (que podem fazer tudo)',
    children: (
      <>
        <img
          src="/assets/documentation/agenteStepByStep/agent-share-1.png"
          className="mt-2 w-full h-auto rounded"
        />
        <img
          src="/assets/documentation/agenteStepByStep/agent-share-2.png"
          className="mt-2 w-full h-auto rounded"
        />
        <img
          src="/assets/documentation/agenteStepByStep/agent-share-3.png"
          className="mt-2 w-full h-auto rounded"
        />
      </>
    ),
  },
  {
    title: 'Passo 8: Uso do agente',
    description:
      'Agora que o agente está criado, você pode usá-lo para responder perguntas relacionadas aos arquivos que você subiu.',
    children: (
      <>
        <p>Exemplos de perguntas:</p>
        <CodeBlock language="text">
          {`Como devo proceder nessa determinada situação?
Como devo responder o cliente?
Com base nas políticas de privacidade, como devo responder a essa pergunta?
Pode executar um código em Python e gerar um gráfico para mim a respeito dos dados que te enviei nesse Excel?`}
        </CodeBlock>
      </>
    ),
  },
];

export const pastas_step_by_step = [
  {
    title: 'Passo 1: Acesse a seção de Pastas',
    description:
      'No menu lateral da plataforma, clique em "Favoritos" para abrir a lista de pastas existentes.',
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
      <p className="pl-4 text-gray-200 border-l-4 border-blue-500">
        <strong>Limpar tudo:</strong> Sai dos favoritos e volta para a lista padrão de chats.
        <br />
        <strong>Testando:</strong> A pasta que foi criada no tutorial com um chat exemplo. Ao clicar
        teremos a lista de chats dela.
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
