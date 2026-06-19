# Sandbox / Code Interpreter — Arquitetura e Funcionamento

Documento de referência do **code interpreter self-hosted** (`packages/sandbox`),
usado pelo **modo auto** dos agentes deste fork do LibreChat. Cobre o fluxo ponta a
ponta, isolamento entre sessões, retorno de arquivos ao modelo, o papel dos
templates e os achados/decisões de segurança.

> Resumo: `packages/sandbox` é um serviço HTTP **compatível com a API
> `code.librechat.ai`**, mas que executa código localmente em containers Docker
> descartáveis. Quando `SANDBOX_PORT` está setado, o LibreChat aponta
> automaticamente para ele em vez do serviço pago.

---

## 1. Componentes

| Camada | Arquivo | Papel |
| --- | --- | --- |
| Ativação (modo auto) | `api/server/services/Endpoints/agents/build.js` | Injeta o prompt do modo auto (`generateAutoModeToolsPrompt`) quando `ephemeralAgent.auto_mode === true` |
| Auto-config baseURL | `api/server/index.js` | Define `LIBRECHAT_CODE_BASEURL=http://host:SANDBOX_PORT` se `SANDBOX_PORT` existe |
| Tool `execute_code` | `@librechat/agents` → `CodeExecutor.mjs` | `POST {baseURL}/exec`; injeta `session_id` e arquivos |
| Priming / contexto | `api/server/services/Files/Code/process.js` (`primeFiles`) | Monta o contexto da tool, lista arquivos, injeta o guia de uso |
| Retorno de arquivos | `api/server/controllers/agents/callbacks.js` + `process.js` (`processCodeOutput`) | Transforma a saída em anexos do chat |
| Upload/Download proxy | `api/server/services/Files/Code/crud.js` | Faz upload/stream de download contra o sandbox |
| **Servidor sandbox** | `packages/sandbox/src/server.js` | API HTTP: `/upload`, `/exec`, `/download`, `/files`, `/extract-pdf`, `/queue-status`, `/health` |
| Execução | `packages/sandbox/src/executor.js` | Roda código em container Docker isolado |
| Fila | `packages/sandbox/src/queue.js` | Semáforo de concorrência (default 5) |
| Storage | `packages/sandbox/src/storage.js` | Layout `storage/{userId}/{sessionId}/`, validação de path |
| Retenção | `packages/sandbox/src/cleanup.js` | Sweeper de TTL dos arquivos (in-process) |
| Auditoria | `packages/sandbox/src/audit.js` + `models/AuditLog.js` | Log estruturado + MongoDB opcional |
| Templates | `packages/sandbox/templates/` | Builders e layouts para PDF/PPTX/XLSX/DOCX |

---

## 2. Fluxo ponta a ponta (modo auto)

```
Usuário (chat, modo auto)
   │
   ▼
build.js  ── injeta prompt do modo auto no promptPrefix
   │
   ▼
Agente decide usar a tool `execute_code`
   │
   ▼
CodeExecutor.mjs ──POST /exec──►  sandbox/server.js
   │  body: { lang, code, files[], ...params }       │
   │  headers: X-API-Key (SEM User-Id)               ▼
   │                                          queue.enqueue → executor.execute
   │                                                 │
   │                                                 ▼
   │                                  docker run --rm --network none
   │                                    --memory 512m --cpus 1
   │                                    -v exec_<id>:/mnt/data:rw
   │                                    (uv run python | bun) script
   │                                                 │
   │                                  arquivos de saída → workspace/{fileId}.ext
   │  ◄──── { stdout, stderr, exitCode, files[] } ───┘
   ▼
callbacks.js → processCodeOutput
   ├─ imagem → baixa, converte, salva como File real → inline no chat
   └─ pdf/pptx/xlsx/docx → link lazy /api/files/code/download/{session}/{id} (card)
```

### Detalhes-chave

- **`session_id = conversationId`** (`entity_id`), injetado pelo ToolNode. Garante
  que o mesmo chat reaproveita a mesma sessão (arquivos persistem entre mensagens).
- **Execução isolada**: cada chamada cria `workspace/exec_<id>`, monta **só** essa
  pasta em `/mnt/data`, roda, copia as saídas para `workspace/` e **apaga o
  `exec_<id>` ~1s depois**. O container roda **sem rede**, como usuário não-root
  (uid 1000), com limite de memória/CPU e `--rm`.
- **Concorrência**: `queue.js` limita execuções simultâneas (`SANDBOX_MAX_CONCURRENT_EXECUTIONS`, default 5).

---

## 3. Isolamento entre sessões / vazamento de dados

**Em operação normal não há vazamento direto:** cada sessão é uma pasta isolada
`storage/{userId}/{sessionId}/`, com `sessionId = conversationId` (único e não
adivinhável). O container só enxerga o próprio `exec_<id>`. Há proteção contra
path traversal e symlink escape (`storage.js: resolveWithin / resolveWithinReal`,
`sanitizeFilename`).

### Pontos de atenção (limitações reais do design)

1. **A isolação por usuário "colapsa" em sessões só-de-código.**
   O LibreChat **só envia `User-Id` no `/upload`** (`crud.js`). No `/exec` e
   `/download` **nenhum identificador de usuário é enviado**. Consequência:
   - Sessões com upload de arquivo → `storage/{userIdReal}/{conversationId}/` ✅
   - Sessões só de código (sem upload) → `storage/anonymous/{conversationId}/`
   - A checagem de dono do sandbox (`SESSION_OWNERSHIP_MISMATCH`) fica **dormente**,
     porque ninguém manda `User-Id` no exec/download. O controle de acesso real
     acontece na **camada do LibreChat** (`fileAccess`, `filterFilesByAgentAccess`),
     não no sandbox.
   - **Modelo de confiança efetivo**: o sandbox é um serviço **interno** que confia
     em quem tem a API key. A separação entre usuários depende do `conversationId`
     ser único/secreto + do gatekeeping do LibreChat.

2. **Autenticação pode ser desligada sem querer.** `server.js`:
   `if (!API_KEY || key === API_KEY) return next()`. Se `SANDBOX_API_KEY` /
   `LIBRECHAT_CODE_API_KEY` estiverem vazios, **toda requisição é aceita**.
   - **Mitigação aplicada**: o servidor agora **recusa subir em produção**
     (`NODE_ENV=production`) sem API key e emite **warning explícito** em dev.

3. **Retenção de dados.** Antes, só o `exec_<id>` era apagado; `uploads/` e
   `workspace/` cresciam indefinidamente.
   - **Mitigação aplicada**: sweeper de TTL in-process (`cleanup.js`), default 30
     dias — ver seção 6.

### Recomendações futuras (não aplicadas ainda)

- Propagar `User-Id` no `/exec` e `/download` (exige ajuste no `@librechat/agents`
  ou passar `user_id` em `params`/`postData`) para reativar a checagem de dono no
  sandbox e namespacing real por usuário.
- Hardening adicional do container: `--read-only` no rootfs, `--pids-limit`,
  perfil `seccomp`/`--security-opt no-new-privileges`.

---

## 4. Retorno de arquivos ao modelo

Funciona corretamente, em **dois caminhos** (`processCodeOutput`):

- **Imagens** (`png`, `jpg`, …): baixadas do sandbox, convertidas (`convertImage`)
  e salvas como **File real** do LibreChat (`createFile`) → exibidas **inline**.
- **Não-imagens** (`pdf`, `pptx`, `xlsx`, `docx`, …): vira um link **lazy**
  `/api/files/code/download/{session_id}/{id}` (card de download, baixado sob
  demanda). `expiresAt` = 24h.

O **modelo é informado** via o texto da tool (`"Generated files: - /mnt/data/...")`
e o `primeFiles` instrui o modelo a **não inventar links** (a UI já mostra o card).
`filterCodeOutputFiles` esconde imagens intermediárias quando existe um entregável
final (ex.: o PNG do gráfico usado dentro de um PDF não aparece solto).

### Edge-cases conhecidos (`executor.js`)

- Se o código gerar um arquivo com **o mesmo nome de um input**, ele é tratado como
  input e **não é retornado** ao usuário.
- Saídas em **subpastas** de `/mnt/data` são ignoradas — apenas arquivos no nível
  raiz são coletados.

---

## 5. Templates — o que é template de verdade

| Formato | Mecanismo | É "template"? |
| --- | --- | --- |
| **PDF** | Jinja2 (`FileSystemLoader` → `templates/layouts/*.html`) | ✅ Sim — `base.html` + `executivo`/`operacional`/`tecnico` que fazem `extends "base.html"` |
| **PPTX** | `python-pptx`, slide layout "blank", construído por código | ⚠️ Não — builder programático, temaizado por `style.py` |
| **XLSX** | `openpyxl`/`xlsxwriter`, construído por código | ⚠️ Não — builder programático |
| **DOCX** | `python-docx`, construído por código | ⚠️ Não — builder programático |

- Os builders padronizados ficam em `templates/corporate_builders.py` (Python) e
  `templates/js/corporate_builders.mjs` (JS), com temas em `style.py`
  (paleta **HPE Corporate Clean**). O `primeFiles` instrui o modelo a **sempre usar
  os builders** (nunca `canvas`/`pptx`/`openpyxl` crus).
- Os tipos de documento e seus campos obrigatórios/opcionais estão em
  `templates/document_types.py` (`relatorio` é o default).
- 🗑️ **`templates/pdf_templates/` está órfão**: o código usa `TEMPLATES_DIR = layouts/`;
  `pdf_templates/` só aparece num comentário ("old pdf_templates"). São 4 HTMLs
  legados — candidatos a remoção.

---

## 6. Retenção de arquivos (cleanup / TTL)

### Decisão de arquitetura

O **cron precisa rodar onde o volume `storage/` está montado** — ou seja, no
**container do sandbox**. Um cron externo (no container do LibreChat) não enxerga
esse volume sem compartilhamento explícito. Por isso a limpeza é feita
**in-process, dentro do sandbox**, via `setInterval` (mesmo padrão já usado em
`api/cache/getLogStores.js` e `GenerationJobManager`). Isso evita cruzar fronteira
de container.

### Como funciona (`cleanup.js`)

1. Na subida do `server.js`, `startCleanupScheduler(STORAGE_ROOT)` agenda uma
   varredura ~30s após o boot e depois a cada `SANDBOX_CLEANUP_INTERVAL_HOURS`.
2. `findExpiredSessions` percorre `storage/{userId}/{sessionId}/`, calcula o
   **mtime mais recente** da sessão e marca como expirada se `idade > TTL`.
3. Remove o diretório inteiro da sessão e **poda** a entrada no índice raiz
   `.sessions.json`.

### Configuração (env)

| Variável | Default | Descrição |
| --- | --- | --- |
| `SANDBOX_FILE_TTL_DAYS` | `30` | Idade máxima dos arquivos de sessão; `0` desativa |
| `SANDBOX_CLEANUP_INTERVAL_HOURS` | `24` | Intervalo entre varreduras |

### Staging → Produção

- **Staging**: subir com `SANDBOX_FILE_TTL_DAYS=30` (ou menor para validar mais
  rápido, ex. `1`) e conferir nos logs `[cleanup] Sweep complete`.
- **Produção**: manter `30`. Como o sweeper é in-process e idempotente, não há
  estado extra a provisionar. Se um dia o sandbox rodar com **réplicas**, cada
  réplica varre o mesmo volume — as remoções são `rm -rf force`, então é seguro
  ( no-op se outra réplica já removeu), mas convém habilitar o sweeper em apenas
  uma réplica para evitar trabalho duplicado.

---

## 7. Endpoints da API do sandbox

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/upload` | Upload de arquivo (multipart, ≤10MB). Envia `User-Id` |
| POST | `/exec` | Executa `code` em `lang` (`py`/`js`), com `files[]` opcionais |
| POST | `/extract-pdf` | Extrai texto de PDF já enviado (alternativa grátis ao RAG API) |
| GET | `/download/:session_id/:fileId` | Baixa arquivo |
| GET | `/files/:session_id?detail=summary\|full` | Lista arquivos da sessão |
| GET | `/queue-status` | Estado da fila |
| GET | `/health` | Healthcheck |

Auth: header `X-API-Key` (comparado com `SANDBOX_API_KEY`/`LIBRECHAT_CODE_API_KEY`).

---

## 8. Testes

```bash
cd packages/sandbox
node --test src/storage.test.js src/cleanup.test.js
```

- `storage.test.js`: path traversal, namespacing, upload/download.
- `cleanup.test.js`: expiração por TTL, poda do índice, resolução de env
  (default 30d quando a env não está setada, desligado com `0`).
