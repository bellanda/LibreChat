// Componentes principais
export { default as Documentation } from '../../routes/Documentation';

// Componentes de tópicos
export { default as AtualizacoesPage } from './topics/AtualizacoesPage';
export { default as BoasPraticasPage } from './topics/BoasPraticasPage';
export { default as EngenhariaDePromptsPage } from './topics/EngenhariaDePromptsPage';
export { default as GlossarioPage } from './topics/GlossarioPage';
export { default as PassoAPassoPage } from './topics/PassoAPassoPage';
export { default as PoliticaUsoPage } from './topics/PoliticaUsoPage';
export { default as VisaoGeralPage } from './topics/VisaoGeralPage';

// Componentes de subtópicos
export { default as PrecoTokenizacaoLimitacoesPage } from './subtopics/glossary/PrecoTokenizacaoLimitacoesPage';
export { default as AgentePage } from './subtopics/step-by-step/AgentePage';
export { default as PastasPage } from './subtopics/step-by-step/PastasPage';

// Componentes utilitários
export { default as Breadcrumb } from './components/Breadcrumb';
export { default as CodeBlock } from './components/CodeBlock';
export { default as DocumentationLink } from './components/DocumentationLink';
export { default as DocumentationQuickLinks } from './components/DocumentationQuickLinks';
export { default as Legend } from './components/Legend';
export { default as SectionRecommendations } from './components/SectionRecommendations';

// Hooks
export { useDocumentationNavigation } from './hooks/useDocumentationNavigation';

// Utilitários e constantes
export * from './utils';
