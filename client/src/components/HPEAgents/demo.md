# HPEAgents Middleware - Demo e Documentação

## Como usar o sistema

O middleware HPEAgents intercepta automaticamente mensagens de texto que contêm marcações especiais e as renderiza como componentes visuais animados.

### Exemplo de uso básico:

```typescript
import { HPEAgentsProcessor } from '~/components/HPEAgents';

function MyComponent() {
  const textWithMarkups = `
    [STEP:1:Iniciando análise de dados]
    [PROGRESS:25.0:Carregando arquivos...]
    [TOOL_START:web_search:Pesquisando informações relevantes]
    [THINKING:Analisando os melhores resultados da busca...]
    [TOOL_END:web_search:Busca concluída com sucesso]
    [PROGRESS:75.0:Processando resultados...]
    [RESULT:success:Análise concluída com êxito]
    [HIGHLIGHT:Dados importantes encontrados!]
  `;

  return <HPEAgentsProcessor text={textWithMarkups} />;
}
```

### Integração automática

O middleware já está integrado no sistema de mensagens do LibreChat. Quando o backend enviar texto com marcações HPEAgents, elas serão automaticamente detectadas e renderizadas.

## Tipos de marcações suportadas

### 1. Progresso

```
[PROGRESS:75.0:Analisando documentos...]
```

### 2. Início de Ferramenta

```
[TOOL_START:web_search:Pesquisando na internet: 'Python tutorial']
```

### 3. Fim de Ferramenta

```
[TOOL_END:web_search:Operação concluída com sucesso]
```

### 4. Status

```
[STATUS:processing:Processando informações...]
```

### 5. Pensamento

```
[THINKING:Analisando a melhor abordagem...]
```

### 6. Resultado

```
[RESULT:success:Operação concluída com sucesso]
```

### 7. Destaque

```
[HIGHLIGHT:texto importante]
```

### 8. Aviso

```
[WARNING:Atenção: verificar configuração]
```

### 9. Erro

```
[ERROR:Erro ao conectar com o servidor]
```

### 10. Código

```
[CODE:javascript:console.log('hello')]
```

### 11. Passos

```
[STEP:1:Conectando ao servidor]
```

## Exemplo completo de sequência

```
Olá! Vou ajudá-lo a processar esses dados.

[STEP:1:Validando entrada...]
[PROGRESS:20.0:Validação em andamento...]

[THINKING:Verificando a estrutura dos dados...]

[STEP:2:Processando arquivos...]
[TOOL_START:file_reader:Lendo arquivo de dados]
[PROGRESS:50.0:Processamento em andamento...]

[HIGHLIGHT:Encontrados 1,234 registros válidos]

[TOOL_END:file_reader:Leitura concluída com sucesso]

[STEP:3:Gerando relatório...]
[PROGRESS:80.0:Quase pronto...]

[CODE:python:
import pandas as pd
df = pd.read_csv('dados.csv')
print(f"Total de registros: {len(df)}")
]

[PROGRESS:100.0:Processamento concluído!]

[RESULT:success:Relatório gerado com sucesso]

O processamento foi concluído! Você pode visualizar os resultados acima.
```

## Recursos visuais

### Animações

- **Progresso**: Barra animada com shimmer effect
- **Ferramentas**: Indicadores pulsantes com ícones
- **Status**: Animações específicas por tipo de status
- **Pensamento**: Pontos animados de digitação
- **Erro**: Animação de shake
- **Sucesso**: Checkmark animado

### Temas

- Suporte completo para modo escuro/claro
- Cores consistentes com o design system do LibreChat
- Responsivo para mobile e desktop

### Performance

- Processamento otimizado com regex
- Componentes memoizados
- Animações CSS performáticas
- Hooks otimizados com useMemo

## Hooks utilitários

```typescript
import { useHPEAgentsProcessor, useHasHPEMarkups } from '~/hooks/useHPEAgentsProcessor';

// Verificar se texto tem marcações
const hasMarkups = useHasHPEMarkups(text);

// Processar texto completo
const { shouldUseProcessor, markups, processedText } = useHPEAgentsProcessor(text);
```
