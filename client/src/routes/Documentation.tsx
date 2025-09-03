import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Library,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Documentation/components/Breadcrumb';
import PrecoTokenizacaoLimitacoesPage from '../components/Documentation/subtopics/glossary/PrecoTokenizacaoLimitacoesPage';
import AgentePage from '../components/Documentation/subtopics/step-by-step/AgentePage';
import PastasPage from '../components/Documentation/subtopics/step-by-step/PastasPage';
import AtualizacoesPage from '../components/Documentation/topics/AtualizacoesPage';
import BoasPraticasPage from '../components/Documentation/topics/BoasPraticasPage';
import EngenhariaDePromptsPage from '../components/Documentation/topics/EngenhariaDePromptsPage';
import GlossarioPage from '../components/Documentation/topics/GlossarioPage';
import PassoAPassoPage from '../components/Documentation/topics/PassoAPassoPage';
import PoliticaUsoPage from '../components/Documentation/topics/PoliticaUsoPage';
import VisaoGeralPage from '../components/Documentation/topics/VisaoGeralPage';

/**
 * Documentation
 * -----------------------------------------------------------------------------
 * Sistema de documentação com rotas para cada seção.
 * Cada tópico tem sua própria URL com navegação via React Router.
 * -----------------------------------------------------------------------------
 */

// Definições dos blocos de navegação (id, título, ícone e subtópicos)
const SECTIONS = [
  {
    id: 'visao-geral',
    title: 'Visão Geral',
    icon: Eye,
    subtopics: [],
  },
  {
    id: 'glossario',
    title: 'Glossário Básico',
    icon: BookOpen,
    subtopics: [
      {
        id: 'gb-preco-tokenizacao-limitacoes',
        title: 'Preço, Tokenização e Limitações',
        component: 'PrecoTokenizacaoLimitacoesPage',
      },
    ],
  },
  {
    id: 'passo-a-passo',
    title: 'Passo a Passo',
    icon: CheckCircle,
    subtopics: [
      { id: 'agentes', title: 'Agentes', component: 'AgentePage' },
      { id: 'pastas', title: 'Pastas', component: 'PastasPage' },
    ],
  },
  {
    id: 'engenharia-de-prompts',
    title: 'Engenharia de Prompts',
    icon: Library,
    subtopics: [],
  },
  {
    id: 'boas-praticas',
    title: 'Boas Práticas Rápidas',
    icon: ThumbsUp,
    subtopics: [],
  },
  {
    id: 'politica-de-uso-de-ia',
    title: 'Política de Uso de IA',
    icon: ShieldCheck,
    subtopics: [],
  },
] as const;

export default function Documentation() {
  const navigate = useNavigate();
  const { sectionId = 'visao-geral', subtopicId } = useParams();

  // Navegação entre páginas
  const currentIndex = SECTIONS.findIndex((section) => section.id === sectionId);
  const currentSection = SECTIONS[currentIndex] || SECTIONS[0];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < SECTIONS.length - 1;

  // Verificar se a seção atual tem subtópicos
  const hasSubtopics = currentSection.subtopics && currentSection.subtopics.length > 0;

  const goToPrevious = () => {
    if (subtopicId && hasSubtopics) {
      const currentSubtopicIndex = currentSection.subtopics.findIndex((s) => s.id === subtopicId);
      if (currentSubtopicIndex > 0) {
        const previousSubtopic = currentSection.subtopics[currentSubtopicIndex - 1];
        if (previousSubtopic) {
          navigate(`/documentation/${sectionId}/${previousSubtopic.id}`);
        }
        return;
      } else {
        navigate(`/documentation/${sectionId}`);
        return;
      }
    }

    if (hasPrevious) {
      const previousSection = SECTIONS[currentIndex - 1];
      if (previousSection.subtopics && previousSection.subtopics.length > 0) {
        const lastSubtopic = previousSection.subtopics[previousSection.subtopics.length - 1];
        if (lastSubtopic) {
          navigate(`/documentation/${previousSection.id}/${lastSubtopic.id}`);
        }
      } else {
        navigate(`/documentation/${previousSection.id}`);
      }
    }
  };

  const goToNext = () => {
    if (subtopicId && hasSubtopics) {
      const currentSubtopicIndex = currentSection.subtopics.findIndex((s) => s.id === subtopicId);
      if (currentSubtopicIndex < currentSection.subtopics.length - 1) {
        const nextSubtopic = currentSection.subtopics[currentSubtopicIndex + 1];
        if (nextSubtopic) {
          navigate(`/documentation/${sectionId}/${nextSubtopic.id}`);
        }
        return;
      } else {
        if (hasNext) {
          const nextSection = SECTIONS[currentIndex + 1];
          navigate(`/documentation/${nextSection.id}`);
        }
        return;
      }
    }

    if (hasSubtopics) {
      const firstSubtopic = currentSection.subtopics[0];
      if (firstSubtopic) {
        navigate(`/documentation/${sectionId}/${firstSubtopic.id}`);
      }
    } else if (hasNext) {
      const nextSection = SECTIONS[currentIndex + 1];
      navigate(`/documentation/${nextSection.id}`);
    }
  };

  const goToSection = (sectionId: string) => {
    navigate(`/documentation/${sectionId}`);
  };

  const goToSubtopic = (subtopicId: string) => {
    navigate(`/documentation/${sectionId}/${subtopicId}`);
  };

  // Renderiza o conteúdo da página atual
  const renderPageContent = () => {
    // Se há subtópicos e um subtópico está selecionado, renderizar o subtópico
    if (hasSubtopics && subtopicId) {
      const subtopic = currentSection.subtopics.find((s) => s.id === subtopicId);
      if (subtopic) {
        switch (subtopic.component) {
          case 'AgentePage':
            return <AgentePage />;
          case 'PastasPage':
            return <PastasPage />;
          case 'PrecoTokenizacaoLimitacoesPage':
            return <PrecoTokenizacaoLimitacoesPage />;
          default:
            return <PassoAPassoPage />;
        }
      }
    }

    // Renderizar página principal da seção
    switch (sectionId) {
      case 'visao-geral':
        return <VisaoGeralPage />;
      case 'glossario':
        return <GlossarioPage />;
      case 'passo-a-passo':
        return <PassoAPassoPage />;
      case 'engenharia-de-prompts':
        return <EngenhariaDePromptsPage />;
      case 'boas-praticas':
        return <BoasPraticasPage />;
      case 'politica-de-uso-de-ia':
        return <PoliticaUsoPage />;
      case 'atualizacoes':
        return <AtualizacoesPage />;
      default:
        return <VisaoGeralPage />;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sectionId, subtopicId]);

  return (
    <div className="flex min-h-screen font-sans text-white bg-gray-800">
      {/* SIDEBAR */}
      <aside className="hidden fixed top-0 left-0 p-6 w-64 h-full bg-gray-900 border-r border-gray-700 dark:bg-gray-900 lg:block">
        <div className="flex gap-3 justify-center items-center">
          <img
            src="/assets/hpe-ia-neural-dark-mode.png"
            alt="HPE IA Neural Logo"
            className="p-2 w-auto h-16 bg-white rounded-lg"
          />
        </div>

        <nav>
          <ul className="mt-4 space-y-2">
            {SECTIONS.map(({ id, title, icon: Icon, subtopics }) => (
              <li key={id}>
                <button
                  onClick={() => goToSection(id)}
                  className={`flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-gray-300 transition-colors duration-200 hover:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 ${
                    sectionId === id
                      ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-600 dark:text-white'
                      : ''
                  }`}
                >
                  <Icon size={20} />
                  {title}
                </button>

                {/* Subtópicos */}
                {sectionId === id && subtopics && subtopics.length > 0 && (
                  <ul className="mt-2 ml-6 space-y-1">
                    {subtopics.map((subtopic) => (
                      <li key={subtopic.id}>
                        <button
                          onClick={() => goToSubtopic(subtopic.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-gray-400 transition-colors duration-200 hover:bg-gray-700 hover:text-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 ${
                            subtopicId === subtopic.id
                              ? 'bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white'
                              : ''
                          }`}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>
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
        <div className="mx-auto max-w-5xl">
          {/* Header da página */}
          <header className="mb-4">
            {/* Breadcrumbs */}
            <Breadcrumb
              sectionTitle={currentSection.title}
              subtopicTitle={
                subtopicId
                  ? currentSection.subtopics.find((s) => s.id === subtopicId)?.title
                  : undefined
              }
              sectionId={sectionId}
              subtopicId={subtopicId}
            />

            <div className="flex gap-3 items-center mb-4">
              <currentSection.icon className="text-indigo-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {subtopicId
                    ? currentSection.subtopics.find((s) => s.id === subtopicId)?.title
                    : currentSection.title}
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {subtopicId
                ? `Subtópico ${currentSection.subtopics.findIndex((s) => s.id === subtopicId) + 1} de ${currentSection.subtopics.length}`
                : `Página ${currentIndex + 1} de ${SECTIONS.length}`}
            </div>
          </header>

          {/* Conteúdo da página */}
          <div className="mb-8">{renderPageContent()}</div>

          {/* Navegação entre páginas */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-700">
            <button
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
                hasPrevious
                  ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                  : 'text-gray-400 bg-gray-700 cursor-not-allowed'
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
                  className={`h-3 w-3 rounded-full transition-colors ${
                    sectionId === section.id ? 'bg-indigo-600' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title={section.title}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={!hasNext}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
                hasNext
                  ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                  : 'text-gray-400 bg-gray-700 cursor-not-allowed'
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
