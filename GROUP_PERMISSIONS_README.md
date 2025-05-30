# Sistema de Permissões por Grupos - LibreChat

Este sistema permite controlar o acesso de usuários a endpoints, modelos e agentes específicos através de grupos configuráveis.

## 🚀 Funcionalidades

- **Controle granular de acesso**: Defina quais endpoints, modelos e agentes cada grupo pode acessar
- **Segurança total**: Bloqueio completo no backend e frontend para modelos não autorizados
- **Proteção de conversas antigas**: Usuários não podem acessar conversas com modelos que perderam permissão
- **Configuração flexível**: Sistema baseado em JSON para fácil gerenciamento
- **Compatibilidade total**: Funciona com todos os endpoints existentes (OpenAI, Anthropic, Google, etc.)

## 📋 Configuração Inicial

### 1. Migração do Banco de Dados

Primeiro, execute a migração para adicionar o campo `userGroup` aos usuários existentes:

```bash
node scripts/migrate-user-groups.js migrate
```

### 2. Configuração de Grupos

Edite o arquivo `groups-config.json` na raiz do projeto para definir seus grupos:

```json
{
  "groups": {
    "default": {
      "name": "Usuários Padrão",
      "description": "Grupo padrão com acesso básico",
      "permissions": {
        "endpoints": ["openAI", "anthropic"],
        "models": {
          "openAI": ["gpt-3.5-turbo", "gpt-4"],
          "anthropic": ["claude-3-haiku", "claude-3-sonnet"]
        },
        "agents": [],
        "assistants": false,
        "plugins": []
      }
    },
    "premium": {
      "name": "Usuários Premium",
      "description": "Usuários premium com acesso estendido",
      "permissions": {
        "endpoints": ["openAI", "anthropic", "google"],
        "models": {
          "openAI": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o"],
          "anthropic": ["claude-3-haiku", "claude-3-sonnet", "claude-3-opus"],
          "google": ["gemini-pro", "gemini-pro-vision"]
        },
        "agents": ["*"],
        "assistants": true,
        "plugins": ["web-search", "calculator"]
      }
    },
    "enterprise": {
      "name": "Usuários Enterprise",
      "description": "Acesso completo a todos os recursos",
      "permissions": {
        "endpoints": ["*"],
        "models": {
          "*": ["*"]
        },
        "agents": ["*"],
        "assistants": true,
        "plugins": ["*"]
      }
    }
  },
  "defaultGroup": "default"
}
```

## 🔧 Gerenciamento de Usuários

### Atribuir Usuário a um Grupo

```bash
# Atribuir usuário específico a um grupo
node scripts/migrate-user-groups.js assign usuario@email.com premium
```

### Listar Usuários e Grupos

```bash
# Ver todos os usuários e seus grupos
node scripts/migrate-user-groups.js list
```

## 📖 Estrutura de Permissões

### Endpoints

- `["*"]`: Acesso a todos os endpoints
- `["openAI", "anthropic"]`: Acesso apenas aos endpoints especificados

### Modelos

- `{"*": ["*"]}`: Acesso a todos os modelos de todos os endpoints
- `{"openAI": ["*"]}`: Acesso a todos os modelos do OpenAI
- `{"openAI": ["gpt-4", "gpt-3.5-turbo"]}`: Acesso apenas aos modelos especificados

### Agentes

- `["*"]`: Acesso a todos os agentes
- `["agent1", "agent2"]`: Acesso apenas aos agentes especificados
- `[]`: Sem acesso a agentes

### Assistants

- `true`: Acesso aos assistants
- `false`: Sem acesso aos assistants

### Plugins

- `["*"]`: Acesso a todos os plugins
- `["web-search", "calculator"]`: Acesso apenas aos plugins especificados
- `[]`: Sem acesso a plugins

## 🛡️ Segurança

### Proteções Implementadas

1. **Validação no Backend**: Todos os endpoints verificam permissões antes de processar requisições
2. **Filtragem de Dados**: APIs retornam apenas dados que o usuário tem permissão para ver
3. **Proteção de Conversas**: Usuários não podem acessar conversas com modelos não autorizados
4. **Validação de URLs**: Acesso direto via URL é bloqueado se não houver permissão
5. **Middleware de Segurança**: Múltiplas camadas de validação em todas as rotas

### Cenários Protegidos

- ✅ Usuário tenta acessar modelo não autorizado via interface
- ✅ Usuário tenta acessar modelo não autorizado via URL direta
- ✅ Usuário tenta continuar conversa com modelo que perdeu acesso
- ✅ Usuário tenta acessar agentes sem permissão
- ✅ Usuário tenta usar assistants sem permissão
- ✅ Listagem de conversas filtra automaticamente conversas não autorizadas

## 🔄 Recarregamento de Configuração

O sistema recarrega automaticamente a configuração quando o arquivo `groups-config.json` é modificado. Para forçar o recarregamento:

```javascript
const groupPermissionService = require('./api/server/services/GroupPermissionService');
groupPermissionService.reloadConfig();
```

## 📝 Logs e Monitoramento

O sistema registra todas as tentativas de acesso negado:

```
WARN: User user@email.com (group: default) denied access to endpoint: google
WARN: User user@email.com (group: default) denied access to model: gpt-4o on endpoint: openAI
```

## 🚨 Troubleshooting

### Problema: Usuário não consegue ver nenhum modelo

**Solução**: Verifique se o grupo do usuário está configurado corretamente e se tem permissões válidas.

### Problema: Configuração não está sendo aplicada

**Solução**: Verifique se o arquivo `groups-config.json` está na raiz do projeto e tem sintaxe JSON válida.

### Problema: Conversas antigas não aparecem

**Solução**: Isso é esperado - conversas com modelos não autorizados são filtradas por segurança.

## 🔧 Desenvolvimento

### Adicionando Novos Endpoints

Para adicionar suporte a novos endpoints:

1. Adicione validação nas rotas do endpoint
2. Atualize o `GroupPermissionService` se necessário
3. Teste todas as permissões

### Testando Permissões

```javascript
const groupPermissionService = require('./api/server/services/GroupPermissionService');

// Testar acesso a endpoint
const hasAccess = groupPermissionService.hasEndpointAccess('premium', 'openAI');

// Testar acesso a modelo
const hasModelAccess = groupPermissionService.hasModelAccess('premium', 'openAI', 'gpt-4');
```

## 📚 Exemplos de Uso

### Configuração para Empresa com 3 Níveis

```json
{
  "groups": {
    "intern": {
      "name": "Estagiários",
      "permissions": {
        "endpoints": ["openAI"],
        "models": {
          "openAI": ["gpt-3.5-turbo"]
        },
        "agents": [],
        "assistants": false,
        "plugins": []
      }
    },
    "employee": {
      "name": "Funcionários",
      "permissions": {
        "endpoints": ["openAI", "anthropic"],
        "models": {
          "openAI": ["gpt-3.5-turbo", "gpt-4"],
          "anthropic": ["claude-3-haiku", "claude-3-sonnet"]
        },
        "agents": [],
        "assistants": true,
        "plugins": ["web-search"]
      }
    },
    "manager": {
      "name": "Gerentes",
      "permissions": {
        "endpoints": ["*"],
        "models": {
          "*": ["*"]
        },
        "agents": ["*"],
        "assistants": true,
        "plugins": ["*"]
      }
    }
  },
  "defaultGroup": "intern"
}
```

### Configuração para SaaS com Planos

```json
{
  "groups": {
    "free": {
      "name": "Plano Gratuito",
      "permissions": {
        "endpoints": ["openAI"],
        "models": {
          "openAI": ["gpt-3.5-turbo"]
        },
        "agents": [],
        "assistants": false,
        "plugins": []
      }
    },
    "pro": {
      "name": "Plano Pro",
      "permissions": {
        "endpoints": ["openAI", "anthropic"],
        "models": {
          "openAI": ["gpt-3.5-turbo", "gpt-4"],
          "anthropic": ["claude-3-haiku", "claude-3-sonnet"]
        },
        "agents": ["*"],
        "assistants": true,
        "plugins": ["web-search", "calculator"]
      }
    },
    "enterprise": {
      "name": "Plano Enterprise",
      "permissions": {
        "endpoints": ["*"],
        "models": {
          "*": ["*"]
        },
        "agents": ["*"],
        "assistants": true,
        "plugins": ["*"]
      }
    }
  },
  "defaultGroup": "free"
}
```

## 🤝 Contribuição

Para contribuir com melhorias no sistema de permissões:

1. Teste todas as funcionalidades de segurança
2. Documente mudanças na configuração
3. Adicione testes para novos recursos
4. Verifique compatibilidade com versões anteriores

---

**Nota**: Este sistema garante segurança total no controle de acesso. Usuários só podem ver e usar recursos para os quais têm permissão explícita.
