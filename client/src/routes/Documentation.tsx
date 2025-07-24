import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  History,
  Library,
  ShieldCheck,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";

/**
 * Documentation
 * -----------------------------------------------------------------------------
 * Sistema de documentação com páginas separadas para cada seção.
 * Cada tópico tem sua própria página com navegação entre elas.
 * -----------------------------------------------------------------------------
 */

// Definições dos blocos de navegação (id, título e ícone)
const SECTIONS = [
  { id: "visao-geral", title: "Visão Geral", icon: Eye },
  { id: "glossario", title: "Glossário Básico", icon: BookOpen },
  { id: "passo-a-passo", title: "Passo a Passo Inicial", icon: CheckCircle },
  { id: "biblioteca-prompts", title: "Biblioteca de Prompts", icon: Library },
  { id: "boas-praticas", title: "Boas Práticas Rápidas", icon: ThumbsUp },
  { id: "faq", title: "Perguntas Frequentes (FAQ)", icon: HelpCircle },
  { id: "politica-uso", title: "Política de Uso", icon: ShieldCheck },
  { id: "atualizacoes", title: "Atualizações (Changelog)", icon: History },
] as const;

export default function Documentation() {
  const [currentPage, setCurrentPage] = useState<string>(SECTIONS[0].id);

  // Navegação entre páginas
  const currentIndex = SECTIONS.findIndex(section => section.id === currentPage);
  const currentSection = SECTIONS[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < SECTIONS.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      setCurrentPage(SECTIONS[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setCurrentPage(SECTIONS[currentIndex + 1].id);
    }
  };

  const goToSection = (sectionId: string) => {
    setCurrentPage(sectionId);
  };

  // Renderiza o conteúdo da página atual
  const renderPageContent = () => {
    switch (currentPage) {
      case "visao-geral":
        return <VisaoGeralPage />;
      case "glossario":
        return <GlossarioPage />;
      case "passo-a-passo":
        return <PassoAPassoPage />;
      case "biblioteca-prompts":
        return <BibliotecaPromptsPage />;
      case "boas-praticas":
        return <BoasPraticasPage />;
      case "faq":
        return <FAQPage />;
      case "politica-uso":
        return <PoliticaUsoPage />;
      case "atualizacoes":
        return <AtualizacoesPage />;
      default:
        return <VisaoGeralPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Eye className="text-indigo-600" size={28} />
          <h1 className="text-xl font-bold text-slate-900">Plataforma IA</h1>
        </div>

        <nav>
          <ul className="space-y-2">
            {SECTIONS.map(({ id, title, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => goToSection(id)}
                  className={`w-full text-left rounded-md px-4 py-2 text-slate-600 transition-colors duration-200 hover:bg-slate-100 flex items-center gap-3 ${
                    currentPage === id
                      ? "bg-indigo-100 font-semibold text-indigo-800"
                      : ""
                  }`}
                >
                  <Icon size={20} />
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 lg:ml-64">
        <div className="mx-auto max-w-4xl">
          {/* Header da página */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <currentSection.icon className="text-indigo-600" size={32} />
              <h1 className="text-3xl font-bold text-slate-900">{currentSection.title}</h1>
            </div>
            <div className="text-sm text-slate-500">
              Página {currentIndex + 1} de {SECTIONS.length}
            </div>
          </header>

          {/* Conteúdo da página */}
          <div className="mb-8">
            {renderPageContent()}
          </div>

          {/* Navegação entre páginas */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-200">
            <button
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                hasPrevious
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={20} />
              Anterior
            </button>

            <div className="flex gap-2">
              {SECTIONS.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPage === section.id
                      ? "bg-indigo-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  title={section.title}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={!hasNext}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                hasNext
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Próximo
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                PÁGINAS                                     */
/* -------------------------------------------------------------------------- */

function VisaoGeralPage() {
  return (
    <div className="space-y-6 text-slate-600">
      {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200"> */}
        {/* <h3 className="text-xl font-semibold text-slate-800 mb-4">Objetivo da Plataforma</h3> */}
        <div className="text-slate-600 text-justify">
          <p>A presente plataforma tem como principal objetivo democratizar o acesso a modelos de Inteligência Artificial no ambiente corporativo, promovendo inovação, agilidade e autonomia nas atividades diárias dos colaboradores.</p>
          <br />
          <p>Por meio de uma interface simples e acessível, disponibilizamos gratuitamente diversos modelos de IA integrados ao LibreOffice, permitindo que todos os usuários da empresa possam gerar conteúdos, revisar textos, automatizar tarefas e tomar decisões com apoio inteligente, sem a necessidade de conhecimento técnico avançado.</p>
          <br />
          <p>Ao centralizar essas ferramentas em um único ambiente, buscamos fomentar a cultura digital na organização, otimizando fluxos de trabalho, ampliando a produtividade e reduzindo o retrabalho, sempre com foco na segurança da informação e no uso ético das tecnologias emergentes.</p>
        </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Benefícios de uso</h3>
        <ul className="list-disc list-inside text-slate-600">
          <li>Aumento significativo de produtividade</li>
          <li>Geração de insights a partir de textos complexos</li>
          <li>Otimização de processos repetitivos</li>
          <li>Interface intuitiva e fácil de usar</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Exemplos Rápidos de Uso</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📄 Resumo de Documentos</h4>
            <p className="text-blue-700">Gerar um resumo de um artigo longo ou relatório complexo</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">📧 E-mails Profissionais</h4>
            <p className="text-green-700">Criar e-mails de marketing ou comunicação corporativa</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">💻 Código Simples</h4>
            <p className="text-purple-700">Escrever código básico em Python, JavaScript ou outras linguagens</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">📊 Análise de Dados</h4>
            <p className="text-orange-700">Interpretar e explicar dados ou gráficos</p>
          </div>
        </div>
      </div>

      {/* <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">Modelo de IA Utilizado</h3>
        <p className="text-indigo-700">
          Atualmente, a plataforma utiliza o modelo <span className="font-semibold">GPT‑4o</span>, 
          otimizado para velocidade e precisão, oferecendo respostas rápidas e de alta qualidade.
        </p>
      </div> */}
    </div>
  );
}

function GlossarioPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Termos Técnicos Essenciais</h3>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-slate-800 mb-2">🤖 Prompt</h4>
            <p className="text-slate-600">
              A instrução, pergunta ou texto que você envia para a IA. A qualidade do prompt define diretamente a qualidade da resposta recebida.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
              <strong>Exemplo:</strong> "Escreva um resumo de 3 parágrafos sobre inteligência artificial"
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-slate-800 mb-2">🔤 Token</h4>
            <p className="text-slate-600">
              A IA processa texto em pedaços chamados tokens. Um token pode ser uma palavra, parte de uma palavra ou um caractere de pontuação.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
              <strong>Exemplo:</strong> "Olá, mundo!" = 3 tokens (Olá, vírgula, mundo!)
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-slate-800 mb-2">📏 Limite de Uso</h4>
            <p className="text-slate-600">
              A quantidade máxima de tokens que pode ser usada em uma única requisição (prompt + resposta). Controla custos e evita respostas excessivamente longas.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
              <strong>Padrão:</strong> 8.000 tokens por requisição
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-semibold text-slate-800 mb-2">⚙️ Modelo</h4>
            <p className="text-slate-600">
              O "cérebro" da IA que processa suas solicitações. Diferentes modelos têm diferentes capacidades, velocidades e custos.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
              <strong>Google:</strong> 2.5 Flash - Equilibra velocidade e qualidade
              <br />
              <strong>Google:</strong> 2.5 Flash Lite - Equilibra velocidade e qualidade
              <br />
              <strong>Google:</strong> 2.5 Pro - Qualidade 
              <br />
              <strong>OpenAI:</strong> GPT-o3 - Equilibra velocidade e qualidade
              <strong>OpenAI:</strong> GPT-o4-mini - Equilibra velocidade e qualidade
              <strong>OpenAI:</strong> GPT-4.1 - Equilibra velocidade e qualidade
              <strong>OpenAI:</strong> GPT-4.1-mini - Equilibra velocidade e qualidade
              <strong>OpenAI:</strong> GPT-4.1-nano - Equilibra velocidade e qualidade
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassoAPassoPage() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">🚀 Guia de Primeiros Passos</h3>
        <p className="text-blue-700">
          Siga estes passos simples para começar a usar a plataforma de IA em menos de 2 minutos.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            step: 1,
            title: "Acesse a Plataforma",
            description: "Navegue para a página principal da plataforma através do link interno da empresa.",
            icon: "🔗",
            details: "Certifique-se de estar conectado à VPN corporativa se necessário."
          },
          {
            step: 2,
            title: "Escolha o Modelo",
            description: "Selecione o modelo de IA desejado no menu suspenso disponível.",
            icon: "🧠",
            details: "Para iniciantes, recomendamos o GPT-4o que oferece bom equilíbrio entre velocidade e qualidade."
          },
          {
            step: 3,
            title: "Digite seu Prompt",
            description: "Escreva sua instrução na caixa de texto ou selecione um template pronto da biblioteca.",
            icon: "📝",
            details: "Seja específico e claro sobre o que você quer que a IA faça."
          },
          {
            step: 4,
            title: "Execute a Solicitação",
            description: "Clique no botão 'Executar' para enviar seu prompt para processamento.",
            icon: "▶️",
            details: "Aguarde alguns segundos enquanto a IA processa sua solicitação."
          },
          {
            step: 5,
            title: "Copie ou Baixe",
            description: "Use os botões disponíveis para copiar a resposta ou fazer download como arquivo.",
            icon: "📥",
            details: "As respostas podem ser copiadas para a área de transferência ou salvas como arquivos de texto."
          }
        ].map((item) => (
          <div key={item.step} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Passo {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                </div>
                <p className="text-slate-600 mb-2">{item.description}</p>
                <div className="bg-gray-50 p-3 rounded text-sm text-slate-600">
                  <strong>💡 Dica:</strong> {item.details}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BibliotecaPromptsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-xl font-semibold text-purple-800 mb-4">📚 Biblioteca de Templates</h3>
        <p className="text-purple-700">
          Templates pré-configurados para acelerar seu trabalho. Escolha o que melhor se adapta à sua necessidade.
        </p>
      </div>

      <div className="grid gap-6">
        {[
          {
            name: "Resumo de Texto",
            category: "Análise",
            description: "Sintetizar artigos ou documentos longos em pontos principais",
            example: "O texto discute o impacto da IA no mercado de trabalho, destacando três tendências principais: automação de tarefas repetitivas, criação de novos empregos e necessidade de requalificação profissional."
          },
          {
            name: "Brainstorm de Ideias",
            category: "Criatividade",
            description: "Gerar ideias para um novo projeto ou campanha",
            example: "1. App de caronas para universitários. 2. Marketplace de produtos artesanais locais. 3. Plataforma de micro-aprendizado. 4. Sistema de gestão de resíduos inteligente."
          },
          {
            name: "Correção Gramatical",
            category: "Revisão",
            description: "Revisar e corrigir a gramática de um texto",
            example: "Original: 'O relatório foi entregue aos gerentes.' (versão corrigida e melhorada)"
          },
          {
            name: "Análise de Dados",
            category: "Insights",
            description: "Interpretar e explicar dados ou gráficos",
            example: "Os dados mostram um crescimento de 15% nas vendas no Q2, impulsionado principalmente pelo segmento de produtos digitais que cresceu 23%."
          },
          {
            name: "E-mail Corporativo",
            category: "Comunicação",
            description: "Criar e-mails profissionais para diferentes contextos",
            example: "Prezados colegas, Gostaríamos de informar sobre as novas diretrizes de trabalho remoto que entrarão em vigor no próximo mês..."
          },
          {
            name: "Plano de Ação",
            category: "Estratégia",
            description: "Desenvolver planos estruturados para projetos",
            example: "Fase 1: Pesquisa de mercado (2 semanas). Fase 2: Desenvolvimento do protótipo (4 semanas). Fase 3: Testes com usuários (2 semanas)."
          }
        ].map((template, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {template.category}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800">{template.name}</h3>
                </div>
                <p className="text-slate-600">{template.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Exemplo de Resultado:</h4>
              <p className="text-slate-600 italic text-sm">{template.example}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoasPraticasPage() {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-xl font-semibold text-green-800 mb-4">✅ Melhores Práticas</h3>
        <p className="text-green-700">
          Siga estas diretrizes para obter os melhores resultados e usar a plataforma de forma eficiente e segura.
        </p>
      </div>

      <div className="grid gap-6">
        {[
          {
            title: "Seja Claro e Específico",
            description: "Dê contexto, exemplos e defina o formato da resposta desejada para obter melhores resultados.",
            tips: [
              "Inclua o público-alvo da resposta",
              "Especifique o tom desejado (formal, informal, técnico)",
              "Defina o formato (lista, parágrafo, tabela)",
              "Mencione o nível de detalhamento esperado"
            ],
            icon: "🎯"
          },
          {
            title: "Monitore o Limite de Tokens",
            description: "Se precisar de uma resposta mais longa, ajuste o limite de tokens nas configurações antes de executar.",
            tips: [
              "Verifique o tamanho do seu prompt",
              "Ajuste o limite conforme necessário",
              "Considere dividir solicitações muito grandes",
              "Use o contador de tokens quando disponível"
            ],
            icon: "📏"
          },
          {
            title: "Proteja Informações Sensíveis",
            description: "Nunca inclua dados pessoais, senhas, informações de clientes ou qualquer outra informação confidencial nos prompts.",
            tips: [
              "Não inclua CPF, RG ou dados pessoais",
              "Evite informações de contratos ou acordos",
              "Não compartilhe credenciais de acesso",
              "Use dados fictícios para exemplos"
            ],
            icon: "🔒"
          },
          {
            title: "Revise e Refine",
            description: "As respostas da IA são um ponto de partida. Sempre revise, edite e personalize o conteúdo gerado.",
            tips: [
              "Verifique a precisão das informações",
              "Adapte o tom para seu contexto",
              "Adicione exemplos específicos da sua área",
              "Teste diferentes abordagens se necessário"
            ],
            icon: "✏️"
          }
        ].map((practice, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">{practice.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{practice.title}</h3>
                <p className="text-slate-600">{practice.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-3">💡 Dicas Práticas:</h4>
              <ul className="space-y-2">
                {practice.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2 text-slate-600">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQPage() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-xl font-semibold text-yellow-800 mb-4">❓ Perguntas Frequentes</h3>
        <p className="text-yellow-700">
          Respostas para as dúvidas mais comuns sobre o uso da plataforma de IA.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            question: "Por que minha resposta veio cortada?",
            answer: "Provavelmente a resposta excedeu o limite de tokens definido.",
            solution: "Aumente o 'Limite de Tokens' nas configurações da ferramenta e execute o prompt novamente.",
            category: "Técnico"
          },
          {
            question: "Por que a execução está demorando muito?",
            answer: "A plataforma pode estar com uma alta demanda ou o prompt pode ser muito complexo.",
            solution: "Verifique o status da fila de execução no painel principal. Se o problema persistir, tente novamente em alguns minutos ou simplifique seu prompt.",
            category: "Performance"
          },
          {
            question: "Posso usar dados confidenciais da empresa?",
            answer: "Não, nunca inclua informações sensíveis, dados de clientes ou informações estratégicas nos prompts.",
            solution: "Use dados fictícios para exemplos ou consulte a política de segurança da empresa para casos específicos.",
            category: "Segurança"
          },
          {
            question: "Como posso melhorar a qualidade das respostas?",
            answer: "A qualidade depende muito de como você formula o prompt.",
            solution: "Seja específico, forneça contexto, use exemplos e defina claramente o formato desejado para a resposta.",
            category: "Uso"
          },
          {
            question: "Posso salvar meus prompts favoritos?",
            answer: "Atualmente não há funcionalidade de salvamento, mas você pode copiar e colar prompts que funcionaram bem.",
            solution: "Mantenha um arquivo de texto com seus prompts mais úteis para reutilização futura.",
            category: "Funcionalidade"
          },
          {
            question: "Qual a diferença entre os modelos disponíveis?",
            answer: "Diferentes modelos têm diferentes capacidades, velocidades e custos.",
            solution: "Para uso geral, o GPT-4o oferece bom equilíbrio. Para tarefas simples, modelos mais rápidos podem ser suficientes.",
            category: "Técnico"
          }
        ].map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">{faq.question}</h3>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                {faq.category}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-slate-700 mb-1">Resposta:</h4>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">💡 Solução:</h4>
                <p className="text-blue-700">{faq.solution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PoliticaUsoPage() {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-xl font-semibold text-red-800 mb-4">⚠️ Política de Uso e Segurança</h3>
        <p className="text-red-700">
          Informações importantes sobre as regras de uso da plataforma e proteção de dados.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">🔒 Proteção de Dados</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-slate-800 mb-2">Dados Proibidos</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Informações pessoais (CPF, RG, endereços)</li>
                <li>Credenciais de acesso (senhas, tokens)</li>
                <li>Dados de clientes ou fornecedores</li>
                <li>Informações estratégicas da empresa</li>
                <li>Contratos, acordos ou documentos confidenciais</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-slate-800 mb-2">Dados Permitidos</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Conteúdo público e informações gerais</li>
                <li>Exemplos fictícios para demonstração</li>
                <li>Dados anonimizados ou agregados</li>
                <li>Informações já publicadas pela empresa</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">📋 Regras de Uso</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">✅ O que é Permitido</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Uso para tarefas profissionais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Geração de conteúdo criativo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Análise de dados públicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Automação de tarefas repetitivas</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">❌ O que é Proibido</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Uso para fins pessoais não relacionados ao trabalho</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Compartilhamento de credenciais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Geração de conteúdo inadequado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Uso excessivo que impacte outros usuários</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 className="text-xl font-semibold text-amber-800 mb-4">⚠️ Monitoramento e Consequências</h3>
          <div className="space-y-3 text-amber-700">
            <p>
              <strong>Monitoramento:</strong> O uso da plataforma é monitorado para garantir conformidade com as políticas de segurança.
            </p>
            <p>
              <strong>Violations:</strong> Violações das políticas podem resultar em suspensão temporária ou permanente do acesso.
            </p>
            <p>
              <strong>Suporte:</strong> Em caso de dúvidas sobre o que é permitido, entre em contato com o suporte de TI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AtualizacoesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">🔄 Histórico de Atualizações</h3>
        <p className="text-indigo-700">
          Acompanhe as principais mudanças e melhorias implementadas na plataforma.
        </p>
      </div>

      <div className="space-y-4">
        {[
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
        ].map((update, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {update.type}
                </span>
                <span className="text-sm text-slate-500">{update.version}</span>
              </div>
              <span className="text-sm text-slate-500">{update.date}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{update.title}</h3>
            <p className="text-slate-600 mb-4">{update.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">📋 Principais Mudanças:</h4>
              <ul className="space-y-1">
                {update.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start gap-2 text-slate-600">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">📞 Suporte e Feedback</h3>
        <p className="text-slate-600">
          Para reportar bugs, sugerir melhorias ou obter suporte, entre em contato com a equipe de TI através dos canais oficiais da empresa.
        </p>
      </div>
    </div>
  );
}