## 📋 Contexto do Projeto

Estou trabalhando em um **fork customizado do LibreChat** e preciso implementar 
um sistema de sandbox próprio para execução de código, similar ao "Code Interpreter" 
oferecido pelo LibreChat oficial (que é um recurso pago).

### Diferencial Importante
- LibreChat tem suas customizações padrão
- Nosso fork tem customizações próprias
- **Princípio**: Criar novas funcionalidades ao invés de modificar a estrutura existente

---

## 🎯 Objetivos do Sandbox

### Funcionalidades Core
1. Executar código **Python**
2. Executar código **JavaScript/Node.js**
3. Renderizar **HTML/CSS** (preview visual)
4. Controle total sobre:
   - Prompts do sistema
   - Bibliotecas/dependências permitidas
   - Timeout de execução
   - Limites de recursos (CPU/RAM)

---

## 🔒 Requisitos de Segurança (Fase 1 - Crítico)

### Isolamento de Arquivos
**Estrutura de diretórios proposta:**
storage/
└── {ObjectIdUser}/           # ID do usuário (MongoDB ObjectId)
└── {UUID-conversation}/  # ID único da conversa/sessão
└── {UUID-arquivo}.{ext}  # Arquivos individuais

### Regras de Segurança Obrigatórias

#### 1️⃣ Upload e Acesso
- [ ] Upload vai direto para o sandbox do usuário específico
- [ ] IA só acessa arquivos da sessão atual do usuário que fez upload
- [ ] Usuários não podem acessar uploads de outros usuários
- [ ] Validação de tipos de arquivo (whitelist)

#### 2️⃣ Proteção do Sistema
- [ ] Código da IA **NÃO pode**:
  - Navegar para diretórios pais (`../`, `../../`)
  - Excluir arquivos fora do sandbox da sessão
  - Modificar arquivos do sistema
  - Acessar variáveis de ambiente sensíveis
  - Fazer chamadas de rede não autorizadas

#### 3️⃣ Isolamento de Processos
- [ ] Cada execução deve rodar em ambiente isolado
- [ ] Timeout automático (ex: 30s)
- [ ] Limite de memória por execução
- [ ] Kill automático de processos órfãos

---

 Próximos Passos
Após definirmos a arquitetura:

 Implementar MVP básico (só Python)
 Testes de segurança (penetration testing)
 Adicionar JavaScript/HTML
 Sistema de rate limiting
 Logs de auditoria
 Dashboard de monitoramento


















 Contexto e objetivo
Estou trabalhando em um fork do LibreChat. O LibreChat tem o recurso pago de Code Interpreter / Sandbox, e eu quero criar o nosso próprio sandbox (code interpreter self-hosted), com controle total de execução, bibliotecas, prompts, políticas de segurança e armazenamento.

Regra importante do fork
Estamos em um fork: o upstream tem as customizações deles e nós temos as nossas. Então, ao implementar algo, prefiro criar estruturas novas ao invés de “mexer na estrutura base” (evitar mudanças intrusivas no core). Sempre que possível: adicionar ao invés de substituir.

Escopo do sandbox (MVP)

O sandbox deve permitir apenas:

Rodar Python

Rodar JavaScript

Renderizar HTML (de forma segura)

E deve permitir que a IA execute código nesses ambientes, mas com controle e isolamento.

Fase 1 (prioridade absoluta): Segurança e isolamento

A primeira fase é garantir segurança.

Objetivo central de segurança

Garantir que o “código executado pela IA” (ou pelo sandbox) não consiga acessar nada acima do diretório permitido (sem acesso a “pasta pra trás” / path traversal / mount indevido).

Estrutura de armazenamento proposta

Quero estruturar o salvamento de arquivos assim:

storage/<ObjectIdUser>/<UUID-session-conversation>/<UUID-archive>.<ext>

ObjectIdUser: identifica o usuário

UUID-session-conversation: identifica a conversa/sessão

UUID-archive.extension: arquivo gerado ou enviado

Fluxo desejado (requisitos funcionais)

Quero que você proponha uma arquitetura que atenda exatamente estes pontos:

Upload do arquivo vai para o Sandbox

Arquivos enviados pelo usuário devem ser armazenados no local correto e ficar disponíveis para o sandbox daquela conversa.

O código da IA consegue acessar o upload

A IA precisa conseguir ler os arquivos enviados na execução do sandbox.

Isolamento entre usuários

Usuários que não fizeram aquele upload não podem acessar.

Nem por URL, nem por path, nem por session hijack, nem por “adivinhar o nome do arquivo”.

Imutabilidade / proteção do sistema e do storage

O código gerado pela IA não pode excluir ou alterar arquivos fora do permitido.

Idealmente o sandbox deve impedir que o código:

apague arquivos do host

altere o LibreChat

suba diretórios (“..”)

acesse secrets/variáveis sensíveis indevidas

E principalmente: não pode alterar nada em um caminho acima do Sandbox.

O que eu quero de você (entregáveis)

Antes de qualquer conclusão, quero conversar primeiro sobre as possibilidades.

Depois, quero que você me dê:

A) Todas as opções de implementação (com prós e contras)

Exemplos de opções que quero que você cubra (e outras que você julgar relevantes):

Nova pasta/módulo dentro do LibreChat (ex: “packages/sandbox” ou “apps/sandbox”)

Docker (container por execução, por conversa, ou pool de containers)

Isolamento por VM/microVM (se fizer sentido)

Execução local com sandboxing do OS (AppArmor/SELinux/seccomp, chroot, namespaces, etc.)

Worker separado (fila + executor)

Armazenamento/permite acesso via API (ao invés de montar volume direto)

Quero que você compare as opções considerando:

Segurança real

Complexidade de implementação e manutenção

Performance e escalabilidade

Facilidade de integração com o LibreChat

Controle de bibliotecas (whitelist/lockfile/cache)

Auditoria e logs

Custo operacional (infra)

B) Uma recomendação objetiva (melhor caminho para MVP)

Escolha um caminho recomendável para um MVP seguro e explique:

Componentes

Fluxo (upload → storage → execução → retorno)

Isolamento (quem acessa o quê e como)

Política de permissões

Onde entra a estrutura storage/ObjectIdUser/...

C) Modelo de ameaça (threat model) mínimo

Liste ameaças e como mitigar, por exemplo:

Path traversal

Symlink escape

Leitura de env vars/secrets

SSRF (se houver rede liberada)

Exfiltração por logs

DoS (loops infinitos, consumo de RAM/CPU)

Escape de container (mitigar com seccomp/AppArmor, rootless, etc.)

Upload de arquivos maliciosos

D) Regras de execução (políticas)

Defina políticas recomendadas:

CPU/mem/time limit

Tamanho máximo de upload

Lista de libs permitidas

Rede permitida ou bloqueada (e por quê)

Escrita permitida só em diretório de trabalho

Storage com “read-only” para arquivos enviados, se possível

Logs e auditoria por user/conversa

E) Perguntas críticas que você precisa que eu responda (no final)

Em vez de travar no início, faça suposições razoáveis, mas no fim liste as decisões que mudam a arquitetura, tipo:

Precisa de internet dentro do sandbox?

Os outputs precisam persistir por quanto tempo?

Quer execução por mensagem ou sessão contínua?

Precisa renderizar HTML com preview no browser ou só gerar HTML como arquivo?

Quantos usuários simultâneos?

Restrições adicionais

Evitar mexer demais no core do LibreChat: prefiro plug-in/módulo novo.

Quero rastreabilidade: logs por ObjectIdUser e conversa.

Quero que a solução seja explicada de forma prática, com caminhos concretos.