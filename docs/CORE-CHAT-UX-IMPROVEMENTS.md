# Melhorias de Core UX do Chat — LibreChat

Documento técnico com recomendações para melhorar a experiência central do chat (streaming, scroll, ações em mensagens, estados vazios e feedback visual). Baseado na análise do código em `client/src`.

---

## 1. Feedback visual durante o streaming

### Estado atual
- **Cursor de streaming:** a classe `.result-streaming` em `client/src/style.css` (linhas ~2086–2169) adiciona um caractere `⬤` após o último elemento (parágrafo, lista, código). Funciona bem para texto.
- **Estado “pensando”:** `.submitting .result-thinking` mostra um ponto pulsante (`pulseSize`) quando o conteúdo ainda está vazio (`LoadingFallback` em `MessageContent.tsx`).
- **Placeholder:** `PlaceholderRow` é apenas um bloco transparente de 27px; não há skeleton ou animação de “digitando”.

### Recomendações

| Melhoria | Onde implementar | Descrição |
|----------|------------------|-----------|
| **Skeleton de “digitando”** | `PlaceholderRow.tsx` ou novo componente `StreamingSkeleton.tsx` | Quando `isSubmitting` e a mensagem do assistente ainda está viva (sem texto ou texto muito curto), exibir 2–3 linhas de skeleton (barra cinza animada com `animate-pulse`), em vez de área vazia. |
| **Cursor mais visível** | `client/src/style.css` (`.result-streaming`) | Trocar `⬤` por um cursor piscante (border-left + animação `opacity` ou `blink`) ou garantir contraste acessível (WCAG) do ponto atual. |
| **Transição ao terminar** | `MessageContent.tsx` / CSS | Ao sair de `isSubmitting`, remover a classe `result-streaming` de forma que o cursor desapareça sem “pulo” (ex.: pequeno delay ou fade-out no CSS). |
| **Thinking block** | Já existe em `MessageContent` (`parseThinkingContent` + `<Thinking>`) | Manter; opcional: animação leve (ex.: ícone ou barra de progresso indeterminada) enquanto só há bloco de thinking e nenhum conteúdo regular. |

---

## 2. Scroll automático e suavidade

### Estado atual
- **Durante o envio:** `useMessageScrolling.ts` chama `scrollToBottom()` sempre que `isSubmitting` e `messagesTree` mudam (efeito a cada nova atualização de mensagem).
- **Comportamento:** `useScrollToRef.ts` usa `scrollIntoView({ behavior: 'instant' })` com throttle de **145 ms** para o scroll automático. O botão “scroll to bottom” usa `behavior: 'smooth'` (throttle 750 ms).
- **Problema:** Scroll `instant` a cada 145 ms durante o streaming pode causar sensação de “pulo”, principalmente com blocos grandes (código, imagens) sendo inseridos.

### Recomendações

| Melhoria | Onde implementar | Descrição |
|----------|------------------|-----------|
| **Scroll suave durante streaming** | `useScrollToRef.ts` | Introduzir um parâmetro ou variante (ex.: `scrollToRefSmoothStreaming`) que use `behavior: 'smooth'` com throttle menor (ex.: 200–250 ms) apenas quando `isSubmitting === true`, mantendo `instant` para carga inicial ou troca de conversa. |
| **Respeitar “usuário scrollou”** | Já existe em parte com `abortScroll` | Garantir que, quando o usuário sobe manualmente (IntersectionObserver já usado para o botão), o auto-scroll não force a volta para baixo a cada chunk; hoje o efeito em `useMessageScrolling` depende de `messagesTree` e `isSubmitting` — revisar se um “user scrolled up” flag desliga temporariamente o scroll automático até o próximo envio. |
| **Scroll após render de bloco grande** | Opcional: `Markdown` / componentes de código ou imagem | Para blocos de código ou imagens grandes, considerar `scrollIntoView({ behavior: 'smooth', block: 'end' })` no próprio elemento quando entrar no viewport (com cuidado para não conflitar com o scroll geral). |
| **scrollToEnd em event handlers** | `utils/messages.ts` / `useEventHandlers.ts` | `scrollToEnd` usa `behavior: 'instant'`. Para eventos de “fim de resposta”, considerar `smooth` para alinhar com a sensação do botão “scroll to bottom”. |

---

## 3. Ações rápidas em mensagens (hover)

### Estado atual
- **HoverButtons** (`HoverButtons.tsx`): Copy, Edit, Regenerate, Fork, Feedback, TTS. Visibilidade: `md:group-hover:visible`, `md:opacity-0 md:group-hover:opacity-100` (e `group-focus-within`).
- O container da mensagem (`MessageRender`) tem a classe `group`, então o hover na card inteira mostra os botões.
- Em mobile não há `group-hover` equivalente; botões podem ficar sempre visíveis ou em menu (verificar `SubRow` — `lg:flex`).

### Recomendações

| Melhoria | Onde implementar | Descrição |
|----------|------------------|-----------|
| **Mobile: ações sempre acessíveis** | `HoverButtons.tsx` / `SubRow` | Em viewports pequenos, manter botões visíveis (ex.: sempre `opacity-100` em `< lg`) ou um menu “⋯” que abre Copy / Edit / Regenerate, para não depender de hover. |
| **Tooltip consistente** | `HoverButton` já usa `title` | Garantir que todos os botões tenham `title` localizado e, se houver design system de Tooltip (Radix, etc.), usar componente de tooltip em vez de só `title` para melhor acessibilidade. |
| **Compartilhar mensagem** | Novo botão em `HoverButtons` | Se o produto tiver “compartilhar conversa” ou “compartilhar mensagem”, adicionar ação “Share” no hover (por exemplo ao lado de Copy), com link para share ou modal. |
| **Área de hover maior** | `MessageRender.tsx` / `SubRow` | O `SubRow` com `empty:hidden` pode colapsar quando não há irmãos; garantir que a linha de botões tenha altura mínima (min-height) para não exigir clique preciso. |

---

## 4. Estados vazios e “landing” do chat

### Estado atual
- **ConversationStarters** (`Input/ConversationStarters.tsx`): só é exibido se houver `conversation_starters` no `entity` (agent/assistant) ou em `documentsMap`. Para modelos genéricos (OpenAI, etc.) não há starters — a tela fica só com o input e possivelmente o footer.
- **“Nothing found”:** quando há conversa mas `messagesTree` vazio, mostra apenas `com_ui_nothing_found`.

### Recomendações

| Melhoria | Onde implementar | Descrição |
|----------|------------------|-----------|
| **Starters genéricos** | `ConversationStarters.tsx` ou config | Se não houver starters do agente/assistante, exibir uma lista curta de prompts genéricos (ex.: “Explique em termos simples”, “Resuma em bullet points”, “Traduza para…”) configurável por endpoint ou em `env`. |
| **Mensagem de boas-vindas** | `ChatView.tsx` (landing) | Na landing (nova conversa), além dos starters, opcionalmente uma linha de texto (“Comece uma conversa ou escolha um exemplo abaixo”) para orientar. |
| **Empty state com ilustração** | `MessagesView.tsx` (quando `messagesTree` vazio com conversa existente) | Para “nothing found”, considerar ícone ou ilustração leve + CTA “Nova conversa” ou “Voltar”, em vez de só texto. |

---

## 5. Renderização de conteúdo (Markdown, código, artefatos)

### Estado atual
- Markdown via `Markdown` / `MarkdownLite`; código em blocos (ex.: `CodeBlock`).
- Existe estrutura de Artifacts (`Artifacts/Code.tsx`, `useAutoScroll` para artefatos).

### Recomendações (opcional para “core”)

| Melhoria | Onde implementar | Descrição |
|----------|------------------|-----------|
| **Auto-scroll em artefatos** | Já existe `useAutoScroll` em Artifacts | Garantir que, quando um artefato (ex.: código) está sendo streamado, o scroll interno do painel do artefato acompanhe (já há lógica em `Code.tsx`). |
| **Copy em código** | `CodeBlock` | Botão “Copy” em cada bloco de código (se ainda não existir) melhora muito a UX sem sair da mensagem. |

---

## 6. Resumo de prioridades sugeridas

1. **Alta:** Scroll suave durante streaming e skeleton/placeholder de “digitando” (streaming).
2. **Média:** Starters genéricos na landing e ações em mensagens sempre visíveis no mobile.
3. **Baixa:** Cursor de streaming mais visível/acessível, tooltips consistentes, empty state com ilustração.

---

## 7. Arquivos principais envolvidos

| Área | Arquivos |
|------|----------|
| Scroll | `client/src/hooks/Messages/useMessageScrolling.ts`, `client/src/hooks/useScrollToRef.ts`, `client/src/utils/messages.ts` (`scrollToEnd`) |
| Streaming UI | `client/src/components/Chat/Messages/Content/MessageContent.tsx`, `client/src/components/Chat/Messages/ui/PlaceholderRow.tsx`, `client/src/style.css` (`.result-streaming`, `.submitting`) |
| Ações em mensagem | `client/src/components/Chat/Messages/HoverButtons.tsx`, `client/src/components/Chat/Messages/ui/MessageRender.tsx`, `client/src/components/Chat/Messages/SubRow.tsx` |
| Landing / empty | `client/src/components/Chat/ChatView.tsx`, `client/src/components/Chat/Input/ConversationStarters.tsx`, `client/src/components/Chat/Messages/MessagesView.tsx` |

---

*Documento gerado com base na análise do repositório LibreChat. Ajustes finos (throttle, delays, textos) devem ser validados em QA e acessibilidade.*
