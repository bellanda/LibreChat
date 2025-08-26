import { Link } from 'react-router-dom';
import { DOCUMENTATION_ROUTES } from '../utils';

interface DocumentationLinkProps {
  route: keyof typeof DOCUMENTATION_ROUTES;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function DocumentationLink({ 
  route, 
  children, 
  className = '',
  onClick 
}: DocumentationLinkProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      to={DOCUMENTATION_ROUTES[route]}
      className={`text-indigo-400 hover:text-indigo-300 transition-colors ${className}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
