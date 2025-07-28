import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  History,
  Library,
  ShieldCheck,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";
import PrecoTokenizacaoLimitacoesPage from "../components/Documentation/subtopics/glossary/PrecoTokenizacaoLimitacoesPage";
import AgentePage from "../components/Documentation/subtopics/step-by-step/AgentePage";
import AtualizacoesPage from "../components/Documentation/topics/AtualizacoesPage";
import BoasPraticasPage from "../components/Documentation/topics/BoasPraticasPage";
import EngenhariaDePromptsPage from "../components/Documentation/topics/EngenhariaDePromptsPage";
import GlossarioPage from "../components/Documentation/topics/GlossarioPage";
import PassoAPassoPage from "../components/Documentation/topics/PassoAPassoPage";
import PoliticaUsoPage from "../components/Documentation/topics/PoliticaUsoPage";
import VisaoGeralPage from "../components/Documentation/topics/VisaoGeralPage";

/**
 * Documentation
 * -----------------------------------------------------------------------------
 * Sistema de documentação com páginas separadas para cada seção.
 * Cada tópico tem sua própria página com navegação entre elas.
 * -----------------------------------------------------------------------------
 */

// Definições dos blocos de navegação (id, título, ícone e subtópicos)
const SECTIONS = [
  { 
    id: "visao-geral", 
    title: "Visão Geral", 
    icon: Eye,
    subtopics: []
  },
  { 
    id: "glossario", 
    title: "Glossário Básico", 
    icon: BookOpen,
    subtopics: [
      { id: "gb-preco-tokenizacao-limitacoes", title: "Preço, Tokenização e Limitações", component: "PrecoTokenizacaoLimitacoesPage" },
    ]
  },
  { 
    id: "passo-a-passo", 
    title: "Passo a Passo", 
    icon: CheckCircle,
    subtopics: [
      { id: "pap-agentes", title: "Agentes", component: "AgentePage" }
    ]
  },
  { 
    id: "engenharia-de-prompts", 
    title: "Engenharia de Prompts", 
    icon: Library,
    subtopics: []
  },
  { 
    id: "boas-praticas", 
    title: "Boas Práticas Rápidas", 
    icon: ThumbsUp,
    subtopics: []
  }
  // ,
  // { 
  //   id: "faq", 
  //   title: "Perguntas Frequentes (FAQ)", 
  //   icon: HelpCircle,
  //   subtopics: []
  // }
  ,
  { 
    id: "politica-uso", 
    title: "Política de Uso", 
    icon: ShieldCheck,
    subtopics: []
  },
  { 
    id: "atualizacoes", 
    title: "Atualizações (Changelog)", 
    icon: History,
    subtopics: []
  },
] as const;

export default function Documentation() {
  const [currentPage, setCurrentPage] = useState<string>(SECTIONS[0].id);
  const [currentSubtopic, setCurrentSubtopic] = useState<string | null>(null);

  // Navegação entre páginas
  const currentIndex = SECTIONS.findIndex(section => section.id === currentPage);
  const currentSection = SECTIONS[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < SECTIONS.length - 1;

  // Verificar se a seção atual tem subtópicos
  const hasSubtopics = currentSection.subtopics && currentSection.subtopics.length > 0;

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
    setCurrentSubtopic(null); // Reset subtópico ao mudar de seção
  };

  const goToSubtopic = (subtopicId: string) => {
    setCurrentSubtopic(subtopicId);
  };

  // Renderiza o conteúdo da página atual
  const renderPageContent = () => {
    // Se há subtópicos e um subtópico está selecionado, renderizar o subtópico
    if (hasSubtopics && currentSubtopic) {
      const subtopic = currentSection.subtopics.find(s => s.id === currentSubtopic);
      if (subtopic) {
        switch (subtopic.component) {
          case "AgentePage":
            return <AgentePage />;
          case "PrecoTokenizacaoLimitacoesPage":
            return <PrecoTokenizacaoLimitacoesPage />;
          default:
            return <PassoAPassoPage />;
        }
      }
    }

    // Renderizar página principal da seção
    switch (currentPage) {
      case "visao-geral":
        return <VisaoGeralPage />;
      case "glossario":
        return <GlossarioPage />;
      case "passo-a-passo":
        return <PassoAPassoPage />;
      case "engenharia-de-prompts":
        return <EngenhariaDePromptsPage />;
      case "boas-praticas":
        return <BoasPraticasPage />;
      // case "faq":
      //   return <FAQPage />;
      case "politica-uso":
        return <PoliticaUsoPage />;
      case "atualizacoes":
        return <AtualizacoesPage />;
      default:
        return <VisaoGeralPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-800 text-white font-sans">
    {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-700 bg-surface-primary-alt p-6 lg:block">
        <div className="flex items-center justify-center gap-3">
            <img
                  src="/assets/hpe-ia-neural-dark-mode.png"
                  alt="HPE IA Neural Logo"
                  className="h-16 w-auto rounded-lg bg-white p-2"
              />
        </div>

        <nav>
          <ul className="space-y-2 mt-4">
            {SECTIONS.map(({ id, title, icon: Icon, subtopics }) => (
              <li key={id}>
                <button
                  onClick={() => goToSection(id)}
                  className={`w-full text-left rounded-md px-4 py-2 text-gray-300 transition-colors duration-200 hover:bg-gray-700 flex items-center gap-3 ${
                    currentPage === id
                      ? "bg-indigo-600 font-semibold text-white"
                      : ""
                  }`}
                >
                  <Icon size={20} />
                  {title}
                </button>
                
                {/* Subtópicos */}
                {currentPage === id && subtopics && subtopics.length > 0 && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {subtopics.map((subtopic) => (
                      <li key={subtopic.id}>
                        <button
                          onClick={() => goToSubtopic(subtopic.id)}
                          className={`w-full text-left rounded-md px-3 py-1.5 text-sm text-gray-400 transition-colors duration-200 hover:bg-gray-700 hover:text-gray-200 flex items-center gap-2 ${
                            currentSubtopic === subtopic.id
                              ? "bg-indigo-500 text-white"
                              : ""
                          }`}
                        >
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                          {subtopic.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 lg:ml-64">
        <div className="mx-auto max-w-4xl">
          {/* Header da página */}
          <header className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <currentSection.icon className="text-indigo-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">{currentSection.title}</h1>
                {currentSubtopic && (
                  <h2 className="text-xl font-semibold text-indigo-300 mt-1">
                    {currentSection.subtopics.find(s => s.id === currentSubtopic)?.title}
                  </h2>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {currentSubtopic 
                ? `Subtópico ${currentSection.subtopics.findIndex(s => s.id === currentSubtopic) + 1} de ${currentSection.subtopics.length}`
                : `Página ${currentIndex + 1} de ${SECTIONS.length}`
              }
            </div>
          </header>

          {/* Conteúdo da página */}
          <div className="mb-8">
            {renderPageContent()}
          </div>

          {/* Navegação entre páginas */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-700">
            <button
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                hasPrevious
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
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
                      : "bg-gray-600 hover:bg-gray-500"
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
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
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
