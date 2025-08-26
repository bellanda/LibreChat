import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  sectionTitle: string;
  subtopicTitle?: string;
  sectionId: string;
  subtopicId?: string;
}

export default function Breadcrumb({ 
  sectionTitle, 
  subtopicTitle, 
  sectionId, 
  subtopicId 
}: BreadcrumbProps) {
  return (
    <nav className="mb-3 flex items-center text-sm text-gray-400" aria-label="Breadcrumb">
      <Link 
        to="/documentation" 
        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <Home size={16} />
        <span className="font-medium">Documentação</span>
      </Link>
      
      <ChevronRight size={16} className="mx-2" />
      
      <Link 
        to={`/documentation/${sectionId}`}
        className="text-white hover:text-gray-200 transition-colors"
      >
        {sectionTitle}
      </Link>
      
      {subtopicTitle && subtopicId && (
        <>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-indigo-300">
            {subtopicTitle}
          </span>
        </>
      )}
    </nav>
  );
}
