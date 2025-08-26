# Sistema de Documentação com Rotas

Este sistema de documentação foi migrado de navegação por estado local para navegação por rotas usando React Router.

## Estrutura de Rotas

### Rotas Principais
- `/documentation` - Página inicial da documentação
- `/documentation/:sectionId` - Seção específica da documentação
- `/documentation/:sectionId/:subtopicId` - Subtópico específico de uma seção

### Seções Disponíveis
- `visao-geral` - Visão Geral
- `glossario` - Glossário Básico
- `passo-a-passo` - Passo a Passo
- `engenharia-de-prompts` - Engenharia de Prompts
- `boas-praticas` - Boas Práticas Rápidas
- `politica-de-uso-de-ia` - Política de Uso

### Subtópicos
- `glossario/gb-preco-tokenizacao-limitacoes` - Preço, Tokenização e Limitações
- `passo-a-passo/pap-agentes` - Agentes
- `passo-a-passo/pap-pastas` - Pastas

## Como Usar

### 1. Navegação Direta por URL
```typescript
// Navegar para uma seção específica
navigate('/documentation/glossario');

// Navegar para um subtópico específico
navigate('/documentation/glossario/gb-preco-tokenizacao-limitacoes');
```

### 2. Usando o Hook useDocumentationNavigation
```typescript
import { useDocumentationNavigation } from '~/components/Documentation';

function MyComponent() {
  const { navigateToGlossario, navigateToPoliticaUso } = useDocumentationNavigation();
  
  return (
    <div>
      <button onClick={navigateToGlossario}>Ver Glossário</button>
      <button onClick={navigateToPoliticaUso}>Ver Política</button>
    </div>
  );
}
```

### 3. Usando o Componente DocumentationLink
```typescript
import { DocumentationLink } from '~/components/Documentation';

function MyComponent() {
  return (
    <div>
      <DocumentationLink route="GLOSSARIO">
        Clique aqui para ver o glossário
      </DocumentationLink>
      
      <DocumentationLink route="POLITICA_USO" className="text-red-500">
        Política de Uso
      </DocumentationLink>
    </div>
  );
}
```

### 4. Usando o Componente DocumentationQuickLinks
```typescript
import { DocumentationQuickLinks } from '~/components/Documentation';

function MyComponent() {
  return (
    <div>
      <h2>Acesso Rápido à Documentação</h2>
      <DocumentationQuickLinks />
    </div>
  );
}
```

## Constantes de Rotas

Todas as rotas estão disponíveis como constantes em `DOCUMENTATION_ROUTES`:

```typescript
import { DOCUMENTATION_ROUTES } from '~/components/Documentation';

// Exemplos de uso
const glossarioUrl = DOCUMENTATION_ROUTES.GLOSSARIO; // '/documentation/glossario'
const politicaUrl = DOCUMENTATION_ROUTES.POLITICA_USO; // '/documentation/politica-de-uso-de-ia'
```

## Benefícios da Migração

1. **URLs Persistentes**: Cada seção tem sua própria URL que pode ser compartilhada
2. **Navegação pelo Browser**: Botões voltar/avançar funcionam corretamente
3. **Bookmarks**: Usuários podem salvar links diretos para seções específicas
4. **SEO**: Melhor indexação pelos motores de busca
5. **Histórico**: Navegação mais intuitiva e familiar

## Estrutura de Arquivos

```
Documentation/
├── components/
│   ├── Breadcrumb.tsx          # Navegação breadcrumb
│   ├── CodeBlock.tsx           # Blocos de código
│   ├── DocumentationLink.tsx   # Links para documentação
│   ├── DocumentationQuickLinks.tsx # Links rápidos
│   ├── Legend.tsx              # Legendas
│   └── SectionRecommendations.tsx # Recomendações
├── hooks/
│   └── useDocumentationNavigation.ts # Hook de navegação
├── subtopics/
│   ├── glossary/               # Subtópicos do glossário
│   └── step-by-step/           # Subtópicos passo a passo
├── topics/                     # Páginas principais
├── utils.tsx                   # Utilitários e constantes
├── index.ts                    # Exportações
└── README.md                   # Este arquivo
```

## Migração de Código Existente

Se você tem código que usa o sistema antigo, aqui está como migrar:

### Antes (Estado Local)
```typescript
const [currentPage, setCurrentPage] = useState('glossario');
const [currentSubtopic, setCurrentSubtopic] = useState(null);

const goToSection = (sectionId) => {
  setCurrentPage(sectionId);
  setCurrentSubtopic(null);
};
```

### Depois (React Router)
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const goToSection = (sectionId) => {
  navigate(`/documentation/${sectionId}`);
};
```

## Exemplos de Uso Avançado

### Navegação Condicional
```typescript
import { useDocumentationNavigation } from '~/components/Documentation';

function ConditionalNavigation({ userRole }) {
  const { navigateToPoliticaUso, navigateToBoasPraticas } = useDocumentationNavigation();
  
  const handleNavigation = () => {
    if (userRole === 'admin') {
      navigateToPoliticaUso();
    } else {
      navigateToBoasPraticas();
    }
  };
  
  return <button onClick={handleNavigation}>Ver Documentação</button>;
}
```

### Links com Estado
```typescript
import { DocumentationLink } from '~/components/Documentation';

function LinkWithState() {
  const handleClick = () => {
    // Lógica adicional antes da navegação
    console.log('Navegando para documentação...');
  };
  
  return (
    <DocumentationLink 
      route="GLOSSARIO" 
      onClick={handleClick}
      className="custom-styles"
    >
      Glossário com Estado
    </DocumentationLink>
  );
}
```
