import { useNavigate } from 'react-router-dom';
import { DOCUMENTATION_ROUTES } from '../utils';

export const useDocumentationNavigation = () => {
  const navigate = useNavigate();

  const navigateToSection = (route: keyof typeof DOCUMENTATION_ROUTES) => {
    navigate(DOCUMENTATION_ROUTES[route]);
  };

  const navigateToHome = () => {
    navigate('/documentation');
  };

  const navigateToVisaoGeral = () => {
    navigate(DOCUMENTATION_ROUTES.VISAO_GERAL);
  };

  const navigateToGlossario = () => {
    navigate(DOCUMENTATION_ROUTES.GLOSSARIO);
  };

  const navigateToPassoAPasso = () => {
    navigate(DOCUMENTATION_ROUTES.PASSO_A_PASSO);
  };

  const navigateToEngenhariaPrompts = () => {
    navigate(DOCUMENTATION_ROUTES.ENGENHARIA_PROMPTS);
  };

  const navigateToBoasPraticas = () => {
    navigate(DOCUMENTATION_ROUTES.BOAS_PRATICAS);
  };

  const navigateToPoliticaUso = () => {
    navigate(DOCUMENTATION_ROUTES.POLITICA_USO);
  };

  return {
    navigateToSection,
    navigateToHome,
    navigateToVisaoGeral,
    navigateToGlossario,
    navigateToPassoAPasso,
    navigateToEngenhariaPrompts,
    navigateToBoasPraticas,
    navigateToPoliticaUso,
    routes: DOCUMENTATION_ROUTES,
  };
};
