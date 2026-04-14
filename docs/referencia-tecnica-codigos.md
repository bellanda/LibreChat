# Referência Técnica Avançada — HPE-IA (LibreChat)

> Documento com nomes de arquivos, containers e fluxo real de código.
> Pré-requisito: leia `referencia-tecnica.md` primeiro.

---

## 1. Infraestrutura (docker-compose.yml)

Todos os serviços rodam via Docker. Arquivo principal: `docker-compose.yml`.

```mermaid
graph TB
    subgraph DOCKER["Containers Docker (docker-compose.yml)"]
        APP["📦 LibreChat\nimage: ghcr.io/danny-avila/librechat-dev\nporta: 3080\nentry: api/server/index.js"]
        MONGO["🗄️ chat-mongodb\nimage: mongo\nusado por: api/db/connect.js\nmodels: api/models/*.js"]
        MEILI["🔍 chat-meilisearch\nimage: getmeili/meilisearch:v1.12.3\nusado para: busca no histórico"]
        VDB["📊 vectordb\nimage: pgvector/pgvector\nusado por: rag_api (embeddings)"]
        RAG["🔗 rag_api\nimage: librechat-rag-api-dev-lite\nconfigura em: rag.yml\nendpoint: /query"]
    end

    subgraph IA["☁️ Provedores externos (librechat.yaml)"]
        OAI["OpenAI\napi/app/clients/OpenAIClient.js"]
        ANT["Anthropic\napi/app/clients/AnthropicClient.js"]
        GOO["Google\napi/app/clients/GoogleClient.js"]
        GROQ["Groq / OpenRouter\n(via OpenAIClient — baseURL customizada)"]
        XAI["xAI (Grok)\n(via OpenAIClient — baseURL customizada)"]
    end

    APP -- "mongoose" --> MONGO
    APP -- "HTTP /indexes" --> MEILI
    APP -- "HTTP /query" --> RAG
    RAG -- "pgvector SQL" --> VDB
    APP -- "HTTPS" --> OAI
    APP -- "HTTPS" --> ANT
    APP -- "HTTPS" --> GOO
    APP -- "HTTPS" --> GROQ
    APP -- "HTTPS" --> XAI

    style DOCKER fill:#f3e5f5,stroke:#6a1b9a
    style IA fill:#e8f5e9,stroke:#2e7d32
```

---

## 2. Estrutura de código — Backend (api/)

```mermaid
graph TD
    subgraph ENTRY["Entrada"]
        IDX["api/server/index.js\nExpress app, porta 3080\nregistra todas as rotas"]
    end

    subgraph ROUTES["api/server/routes/"]
        RM["messages.js\nPOST /api/messages"]
        RC["convos.js\nGET/POST /api/convos"]
        RE["endpoints.js\nGET /api/endpoints"]
        RA["agents/ (pasta)\nrotas de agentes"]
        RF["files/ (pasta)\nupload de arquivos"]
        RAUTH["auth.js\nPOST /api/auth/login|register"]
    end

    subgraph MIDDLE["api/server/middleware/"]
        JWT["requireJwtAuth.js\nvalida Bearer token"]
        VAL["validateMessageReq.js\nvalida corpo da requisição"]
        LIM["concurrentLimiter.js\nlimita requests simultâneos"]
    end

    subgraph CTRL["api/server/controllers/"]
        AGR["agents/request.js\nResumableAgentController\norquestra toda a geração"]
        AGV1["agents/v1.js\ninitializeClient()"]
        EDIT["EditController.js\nregerar / editar mensagem"]
    end

    subgraph CLIENTS["api/app/clients/"]
        BASE["BaseClient.js\nclasse base — streaming, histórico"]
        OPENAI["OpenAIClient.js\nextends BaseClient"]
        ANTHRO["AnthropicClient.js\nextends BaseClient"]
        GOOGLE["GoogleClient.js\nextends BaseClient"]
    end

    subgraph MODELS["api/models/"]
        MSG["Message.js\nMongoose schema de mensagem"]
        CONV["Conversation.js\nMongoose schema de conversa"]
        TXN["Transaction.js + tx.js\ncálculo e log de tokens/custo"]
        AGENT["Agent.js\nconfig de agentes"]
    end

    IDX --> ROUTES
    ROUTES --> MIDDLE
    MIDDLE --> CTRL
    CTRL --> CLIENTS
    CLIENTS --> MODELS
```

---

## 3. Estrutura de código — Frontend (client/src/)

```mermaid
graph TD
    subgraph ENTRY["Entrada"]
        MAIN["main.jsx\nReactDOM.render"]
        APP["App.jsx\nProviders + Router"]
    end

    subgraph STORE["store/ (Jotai — estado global)"]
        SUB["submission.ts\nestado da mensagem sendo enviada"]
        EP["endpoints.ts\nendpoint/modelo selecionado"]
    end

    subgraph CHAT["components/Chat/"]
        CV["ChatView.tsx\nlayout principal do chat"]
        MV["Messages/MessagesView.tsx\nlista de mensagens"]
        MSG["Messages/Message.tsx\nmensagem individual"]
        FORM["Input/ChatForm.tsx\ncaixa de texto + botões"]
        SEND["Input/SendButton.tsx\nbotão enviar"]
    end

    subgraph HOOKS["hooks/SSE/"]
        SSE["useSSE.ts\nrecebe streaming da API via EventSource"]
        RSSE["useResumableSSE.ts\nreconecta se a conexão cair"]
        CONT["useContentHandler.ts\natualiza mensagem token a token"]
    end

    subgraph DP["data-provider/ (React Query)"]
        MUT["useSubmitMessage()\nmutation POST /api/messages"]
        QRY["useGetConversations()\nquery GET /api/convos"]
    end

    MAIN --> APP
    APP --> CHAT
    CHAT --> STORE
    FORM --> MUT
    MUT --> SSE
    SSE --> CONT
    CONT --> MSG
```

---

## 4. Fluxo real de código: do clique em "Enviar" até a resposta

```mermaid
sequenceDiagram
    actor Dev as 👤 Usuário
    participant CF as ChatForm.tsx
    participant SUB as store/submission.ts
    participant DP as data-provider/useSubmitMessage
    participant MW as middleware/requireJwtAuth.js
    participant RT as routes/messages.js
    participant CTRL as controllers/agents/request.js
    participant CLI as app/clients/OpenAIClient.js
    participant MDL as models/Message.js
    participant TXN as models/tx.js
    participant SSE as hooks/SSE/useSSE.ts

    Dev->>CF: clica em SendButton.tsx
    CF->>SUB: seta atom de submission (Jotai)
    SUB->>DP: dispara useSubmitMessage()
    DP->>MW: POST /api/messages + Bearer JWT
    MW->>MW: requireJwtAuth.js valida token
    MW->>RT: passa req autenticado
    RT->>CTRL: ResumableAgentController()
    CTRL->>CTRL: checkAndIncrementPendingRequest()
    CTRL->>MDL: saveMessage() — salva msg do usuário
    CTRL->>CLI: sendMessage() abre stream HTTPS

    Note over CLI: OpenAIClient (ou Anthropic/Google)<br/>cria payload e abre conexão com provedor

    loop Tokens chegando em streaming
        CLI-->>CTRL: chunk de texto
        CTRL-->>DP: SSE event (text_delta)
        DP-->>SSE: useSSE.ts recebe evento
        SSE-->>CONT: useContentHandler atualiza atom
        CONT-->>Dev: palavra aparece na tela
    end

    CLI-->>CTRL: stream encerrado
    CTRL->>MDL: saveMessage() — salva resposta completa
    CTRL->>TXN: spendTokens() — registra custo
    CTRL-->>Dev: ✅ resposta completa na tela
```

---

## 5. Arquivos mais importantes para o dia a dia

| Área          | Arquivo                                         | Para que serve                               |
| ------------- | ----------------------------------------------- | -------------------------------------------- |
| Servidor      | `api/server/index.js`                           | Entry point Express, registra todas as rotas |
| Roteamento    | `api/server/routes/messages.js`                 | Recebe mensagens do frontend                 |
| Orquestração  | `api/server/controllers/agents/request.js`      | Controla todo o ciclo de geração             |
| Clientes IA   | `api/app/clients/OpenAIClient.js`               | Comunica com OpenAI, Groq, xAI, OpenRouter   |
| Clientes IA   | `api/app/clients/AnthropicClient.js`            | Comunica com Anthropic (Claude)              |
| Custo/tokens  | `api/models/tx.js` + `Transaction.js`           | Calcula e registra custo por requisição      |
| Agentes       | `api/server/controllers/agents/v1.js`           | Inicializa clientes de agentes               |
| Config        | `librechat.yaml`                                | Define endpoints, modelos, preços, interface |
| Chat UI       | `client/src/components/Chat/ChatView.tsx`       | Layout principal do chat                     |
| Input         | `client/src/components/Chat/Input/ChatForm.tsx` | Caixa de texto do usuário                    |
| Streaming     | `client/src/hooks/SSE/useSSE.ts`                | Recebe tokens em tempo real                  |
| Estado global | `client/src/store/submission.ts`                | Estado da submissão (Jotai)                  |
| Auth          | `api/server/middleware/requireJwtAuth.js`       | Protege todas as rotas autenticadas          |
| Docker        | `docker-compose.yml`                            | Sobe todos os containers                     |
| Banco         | `api/db/connect.js`                             | Conecta ao MongoDB                           |
| Schemas DB    | `api/models/Message.js`, `Conversation.js`      | Schemas Mongoose                             |

---

## 6. Variáveis de ambiente relevantes (.env)

```
PORT=3080                  # porta do servidor
MONGO_URI=mongodb://...    # conexão MongoDB
GROQ_API_KEY=...           # modelos open source via Groq
ANTHROPIC_API_KEY=...      # Claude
OPENAI_API_KEY=...         # GPT-4o, o3
GOOGLE_KEY=...             # Gemini
XAI_API_KEY=...            # Grok
JWT_SECRET=...             # assina tokens de autenticação
```

---

_Atualizado em 2026-03-23 — gerado com base nos arquivos reais do repositório._
