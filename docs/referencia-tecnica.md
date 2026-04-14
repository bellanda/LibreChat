# Referência Técnica — Plataforma HPE-IA (LibreChat)

> Leia na ordem: primeiro o fluxo de uso, depois a arquitetura, depois o ciclo de uma mensagem.

---

## 1. O que você faz na tela (Fluxo de uso)

```mermaid
flowchart TD
    A([🧑 Você abre o navegador]) --> B[Tela de login]
    B --> C{Tem conta?}
    C -- Não --> D[Criar conta ou pedir acesso ao admin]
    C -- Sim --> E[Entra na plataforma]

    E --> F[Tela principal: lista de conversas]

    F --> G{O que você quer fazer?}

    G -- Nova conversa --> H[Clica em 'Nova conversa']
    G -- Continuar conversa --> I[Clica em uma conversa da lista]
    G -- Usar um Agente --> J[Escolhe um Agente no menu]

    H --> K[Escolhe o modelo de IA\nex: GPT-4o, Claude, Gemini...]
    I --> K
    J --> K

    K --> L[Escreve o prompt na caixa de texto]
    L --> M[Clica em Enviar]
    M --> N[⏳ Aguarda a resposta aparecer na tela]

    N --> O{Gostou da resposta?}
    O -- Sim --> P[Copia, exporta ou continua a conversa]
    O -- Não --> Q[Edita o prompt e tenta de novo\nou pede refinamento na mesma conversa]
    Q --> M

    P --> R([✅ Fim do ciclo básico])

    style A fill:#e8f5e9,stroke:#388e3c
    style R fill:#e8f5e9,stroke:#388e3c
    style N fill:#fff3e0,stroke:#f57c00
    style D fill:#ffebee,stroke:#c62828
```

---

## 2. Como a plataforma é montada (Arquitetura)

> Pense neste diagrama como um mapa dos sistemas que existem. Você usa o **Navegador**, o resto acontece nos bastidores.

```mermaid
graph TB
    subgraph VOCÊ["👤 Você (navegador)"]
        UI[Interface Web\nReact — botões, chat, menus]
    end

    subgraph SERVIDOR["🖥️ Servidor da HPE"]
        API[API\nNode.js — cérebro da plataforma]
        DB[(Banco de dados\nMongoDB — salva conversas\ne usuários)]
        CACHE[(Cache\nRedis — acelera respostas\nfrequentes)]
        RAG[Serviço de busca\nem documentos]
        PYTOOLS[Ferramentas Python\nex: executar código]
    end

    subgraph IA["☁️ Provedores de IA externos"]
        OAI[OpenAI\nGPT-4o, o3...]
        ANT[Anthropic\nClaude 3.5, 3.7...]
        GOO[Google\nGemini 2.0...]
        GROQ[Groq / OpenRouter\nModelos open source]
        XAI[xAI\nGrok...]
    end

    UI -- "envia sua mensagem (HTTPS)" --> API
    API -- "salva/busca conversa" --> DB
    API -- "verifica cache" --> CACHE
    API -- "busca em documentos" --> RAG
    API -- "executa código/ferramentas" --> PYTOOLS
    API -- "envia prompt e recebe resposta" --> OAI
    API -- "envia prompt e recebe resposta" --> ANT
    API -- "envia prompt e recebe resposta" --> GOO
    API -- "envia prompt e recebe resposta" --> GROQ
    API -- "envia prompt e recebe resposta" --> XAI
    API -- "devolve resposta em tempo real" --> UI

    style VOCÊ fill:#e3f2fd,stroke:#1565c0
    style SERVIDOR fill:#f3e5f5,stroke:#6a1b9a
    style IA fill:#e8f5e9,stroke:#2e7d32
```

---

## 3. O que acontece quando você clica em "Enviar" (Ciclo de uma mensagem)

> Este diagrama mostra o caminho completo da sua mensagem, do clique até a resposta aparecer na tela, em ordem cronológica.

```mermaid
sequenceDiagram
    actor Você
    participant Tela as 🖥️ Tela (navegador)
    participant API as ⚙️ API (servidor HPE)
    participant Banco as 🗄️ Banco de dados
    participant IA as 🤖 Provedor de IA

    Você->>Tela: Digita a mensagem e clica em Enviar
    Tela->>API: "Aqui está a mensagem do usuário"

    API->>Banco: Salva a mensagem no histórico
    Banco-->>API: Confirmado ✓

    API->>IA: "Preciso de uma resposta para este prompt"

    Note over IA: A IA processa o texto<br/>e começa a gerar a resposta

    loop Resposta chegando aos poucos (streaming)
        IA-->>API: Envia um pedaço da resposta
        API-->>Tela: Repassa o pedaço
        Tela-->>Você: Exibe as palavras aparecendo
    end

    API->>Banco: Salva a resposta completa no histórico
    Banco-->>API: Confirmado ✓

    Tela-->>Você: ✅ Resposta completa visível na tela
```

---

## Resumo rápido

| O que você vê                      | O que é por baixo                        |
| ---------------------------------- | ---------------------------------------- |
| Tela de chat                       | Frontend em React (JavaScript)           |
| Botão "Enviar"                     | Chama a API do servidor                  |
| Histórico de conversas             | Banco de dados MongoDB                   |
| Resposta aparecendo aos poucos     | Streaming via API → servidor → tela      |
| Seletor de modelo (GPT, Claude...) | Servidor conecta com provedores externos |
| Agentes e ferramentas              | Módulos extras no servidor + Python      |

---

_Atualizado em 2026-03-23 — Para dúvidas, fale com a equipe de IA da HPE._
