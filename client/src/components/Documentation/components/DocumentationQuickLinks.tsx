import { BookOpen, CheckCircle, Eye, Library, ShieldCheck, ThumbsUp } from 'lucide-react';
import { DocumentationLink } from '../index';

export default function DocumentationQuickLinks() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        📚 Documentação Rápida
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <DocumentationLink 
            route="VISAO_GERAL"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <Eye size={16} />
            Visão Geral
          </DocumentationLink>
          
          <DocumentationLink 
            route="GLOSSARIO"
            className="flex items-center gap-2 text-green-400 hover:text-green-300"
          >
            <BookOpen size={16} />
            Glossário Básico
          </DocumentationLink>
          
          <DocumentationLink 
            route="PASSO_A_PASSO"
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
          >
            <CheckCircle size={16} />
            Passo a Passo
          </DocumentationLink>
        </div>
        
        <div className="space-y-3">
          <DocumentationLink 
            route="ENGENHARIA_PROMPTS"
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <Library size={16} />
            Engenharia de Prompts
          </DocumentationLink>
          
          <DocumentationLink 
            route="BOAS_PRATICAS"
            className="flex items-center gap-2 text-orange-400 hover:text-orange-300"
          >
            <ThumbsUp size={16} />
            Boas Práticas
          </DocumentationLink>
          
          <DocumentationLink 
            route="POLITICA_USO"
            className="flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <ShieldCheck size={16} />
            Política de Uso
          </DocumentationLink>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <DocumentationLink 
          route="VISAO_GERAL"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          📖 Ver documentação completa
        </DocumentationLink>
      </div>
    </div>
  );
}
