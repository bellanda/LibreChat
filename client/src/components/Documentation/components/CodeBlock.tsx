// Componente para formatar blocos de código
export default function CodeBlock({ children, language = 'text' }) {
    return (
        <pre className="bg-gray-850 text-gray-200 p-4 rounded-md overflow-x-auto">
            <code className={`language-${language}`}>
                {children.trim()}
            </code>
        </pre>
    );
  }