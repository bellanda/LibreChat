


export interface Step {
    number: number;
    icon: string;
    title: string;
    description: string;
    img?: string | null;
    tip: string;
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
        tip: 'Certifique-se de estar conectado à VPN corporativa se necessário.',
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
        img: '/assets/documentation/platformStepByStep/passo3.png',
        tip: 'Seja específico e claro sobre o que quer que a IA faça.',
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

export const updates_backup = [
    {
        date: "2024-06-01",
        version: "v2.1.0",
        type: "NOVO",
        title: "Modelo GPT-4o Disponível",
        description: "Adicionado suporte ao modelo GPT-4o da OpenAI, oferecendo melhor performance e capacidades expandidas.",
        details: [
            "Suporte a até 15.000 tokens por requisição",
            "Melhor compreensão de contexto",
            "Respostas mais precisas e detalhadas",
            "Compatibilidade com arquivos de imagem"
        ]
    },
    {
        date: "2024-05-15",
        version: "v2.0.5",
        type: "MELHORIA",
        title: "Limite de Tokens Aumentado",
        description: "O limite padrão de tokens foi aumentado para 8.000, permitindo respostas mais longas e detalhadas.",
        details: [
            "Limite padrão: 8.000 tokens (era 4.000)",
            "Configuração personalizável por usuário",
            "Melhor controle de custos",
            "Interface mais intuitiva para ajustes"
        ]
    },
    {
        date: "2024-05-01",
        version: "v2.0.0",
        type: "MAJOR",
        title: "Nova Interface de Usuário",
        description: "Redesign completo da interface para melhorar a experiência do usuário e facilitar o uso da plataforma.",
        details: [
            "Interface mais limpa e moderna",
            "Navegação simplificada",
            "Templates organizados por categoria",
            "Histórico de conversas melhorado"
        ]
    },
    {
        date: "2024-04-15",
        version: "v1.9.2",
        type: "CORREÇÃO",
        title: "Correções de Bugs",
        description: "Correções de problemas menores e melhorias de estabilidade.",
        details: [
            "Corrigido problema de timeout em requisições longas",
            "Melhorada a precisão do contador de tokens",
            "Correção na exportação de arquivos",
            "Otimização de performance geral"
        ]
    }
];









export const agent_step_by_step: Step[] = [
    {
        number: 1,
        icon: '🔗',
        title: 'Acesse a Plataforma',
        description:
            'Clique na direita para acessar a parte de agentes principal da plataforma através do link interno da empresa: https://www.google.com',
        img: '/assets/documentation/agenteStepByStep/passo1.png',
        tip: 'Certifique-se de estar conectado à VPN corporativa se necessário.',
    },
    {
        number: 2,
        icon: '🧠',
        title: 'Escolha o Modelo',
        description:
            'Selecione o modelo de IA desejado no menu suspenso disponível.',
        img: '/assets/documentation/passo2.png',
        tip: 'Para iniciantes, leia o glossário e escolha um modelo que equilibre velocidade e qualidade.',
    },
    {
        number: 3,
        icon: '📝',
        title: 'Digite seu Prompt',
        description:
            'Escreva sua instrução na caixa de texto ou selecione um template pronto.',
        img: '/assets/documentation/passo3.png',
        tip: 'Seja específico e claro sobre o que quer que a IA faça.',
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
        img: '/assets/documentation/passo5.png',
        tip: 'Você pode copiar para a área de transferência ou salvar localmente.',
    },
];
