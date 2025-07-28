const calculatePrice = (price: number, token_count: number) => {

    return price / token_count;
}

export const models = [
    {
        company: "Google",
        models: [
            {
                name: "Gemini 2.5 Flash",
                description: "Modelo otimizado para velocidade, ideal para tarefas rápidas e respostas curtas com boa coerência.",
                tip: "Use em chatbots ou resumos rápidos.",
                price_currency: "USD",
                price_input: 0.30,
                price_output: 2.50,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.30, 1000000),
                price_per_token_output: calculatePrice(2.50, 1000000)
            },
            {
                name: "Gemini 2.5 Flash Lite",
                description: "Versão mais leve do Flash, ainda mais rápida, com custo menor.",
                tip: "Bom para aplicações em larga escala e perguntas simples.",
                price_currency: "USD",
                price_input: 0.10,
                price_output: 0.40,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.10, 1000000),
                price_per_token_output: calculatePrice(0.40, 1000000)
            },
            {
                name: "Gemini 2.5 Pro",
                description: "Foca na qualidade de respostas, ótimo para textos longos ou análises.",
                tip: "Ideal para redações, e-mails e conteúdos mais elaborados.",
                price_currency: "USD",
                price_input: 1.25,
                price_output: 10.00,
                token_count: 1000000,
                price_per_token_input: calculatePrice(1.25, 1000000),
                price_per_token_output: calculatePrice(10.00, 1000000)
            }
        ]
    },
    {
        company: "OpenAI",
        models: [
            {
                name: "GPT-o3",
                description: "Modelo básico, rápido e eficiente.",
                tip: "Use para tarefas cotidianas, como resumos, traduções e respostas simples.",
                price_currency: "USD",
                price_input: 0.40,
                price_output: 1.60,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.40, 1000000),
                price_per_token_output: calculatePrice(1.60, 1000000)
            },
            {
                name: "GPT-o4-mini",
                description: "Compacto, com desempenho surpreendente.",
                tip: "Equilibra bem custo e qualidade. Ótimo para projetos contínuos.",
                price_currency: "USD",
                price_input: 0.15,
                price_output: 0.60,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.15, 1000000),
                price_per_token_output: calculatePrice(0.60, 1000000)
            },
            {
                name: "GPT-4.1",
                description: "Modelo avançado com excelente compreensão de contexto e geração de texto.",
                tip: "Perfeito para uso jurídico, técnico ou criativo de alto nível.",
                price_currency: "USD",
                price_input: 2.00,
                price_output: 8.00,
                token_count: 1000000,
                price_per_token_input: calculatePrice(2.00, 1000000),
                price_per_token_output: calculatePrice(8.00, 1000000)
            },
            {
                name: "GPT-4.1-mini",
                description: "Versão compacta do 4.1, com ótimo desempenho e custo reduzido.",
                tip: "Use quando quiser qualidade próxima do 4.1, mas mais barato.",
                price_currency: "USD",
                price_input: 0.40,
                price_output: 1.60,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.40, 1000000),
                price_per_token_output: calculatePrice(1.60, 1000000)
            },
            {
                name: "GPT-4.1-nano",
                description: "Modelo ultra leve, para tarefas rápidas e de baixa complexidade.",
                tip: "Ideal para assistentes embarcados e dispositivos com pouca memória.",
                price_currency: "USD",
                price_input: 0.10,
                price_output: 0.40,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.10, 1000000),
                price_per_token_output: calculatePrice(0.40, 1000000)
            }
        ]
    },
    {
        company: "Anthropic",
        models: [
            {
                name: "Claude Sonnet 4",
                description: "Modelo de linguagem com ótimo raciocínio e ética.",
                tip: "Indicado para uso institucional, educacional e com foco em segurança.",
                price_currency: "USD",
                price_input: 3.00,
                price_output: 15.00,
                token_count: 1000000,
                price_per_token_input: calculatePrice(3.00, 1000000),
                price_per_token_output: calculatePrice(15.00, 1000000)
            }
        ]
    },
    {
        company: "Groq",
        models: [
            {
                name: "Llama 4 Maverick",
                description: "Foco em velocidade extrema, ótimo para tempo real.",
                tip: "Use em interfaces onde a resposta instantânea é prioridade.",
                price_currency: "USD",
                price_input: 0.27,
                price_output: 0.85,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.27, 1000000),
                price_per_token_output: calculatePrice(0.85, 1000000)
            },
            {
                name: "Llama 4 Scout",
                description: "Variante rápida e robusta para tarefas variadas.",
                tip: "Boa escolha para fluxos mistos com leitura, análise e geração de texto.",
                price_currency: "USD",
                price_input: 0.18,
                price_output: 0.59,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.18, 1000000),
                price_per_token_output: calculatePrice(0.59, 1000000)
            },
            {
                name: "Kimi K2",
                description: "Modelo versátil da Groq, com boa fluidez e entendimento.",
                tip: "Útil para diálogos mais naturais e interações complexas.",
                price_currency: "USD",
                price_input: 0.15,
                price_output: 2.50,
                token_count: 1000000,
                price_per_token_input: calculatePrice(0.15, 1000000),
                price_per_token_output: calculatePrice(2.50, 1000000)
            }
        ]
    }
];







export interface Step {
    number: number;
    icon: string;
    title: string;
    description: string;
    img?: string | null;
    tip: string;
}

export const steps: Step[] = [
    {
        number: 1,
        icon: '🔗',
        title: 'Acesse a Plataforma',
        description:
            'Navegue para a página principal da plataforma através do link interno da empresa: https://www.google.com',
        img: '/assets/documentation/passo1.png',
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