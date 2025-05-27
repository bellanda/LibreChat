# Scripts Administrativos

Este diretório contém scripts para administração e manutenção do LibreChat.

## updateUserRoles.js

Script para gerenciar roles de usuários no sistema.

### Funcionalidades

- ✅ Listar todos os usuários
- ✅ Atualizar role de usuário individual
- ✅ Atualização em lote de múltiplos usuários
- ✅ Suporte a diferentes tipos de identificadores (username, email, ldapId)
- ✅ Validação de usuários existentes
- ✅ Relatório de resultados

### Uso

#### Listar usuários

```bash
node scripts/admin/updateUserRoles.js list
```

#### Atualizar usuário individual

```bash
# Por username (padrão)
node scripts/admin/updateUserRoles.js gb810437 admin

# Por email
node scripts/admin/updateUserRoles.js user@email.com admin email

# Por LDAP ID
node scripts/admin/updateUserRoles.js gb810437 admin ldapId
```

#### Atualização em lote

```bash
node scripts/admin/updateUserRoles.js batch
```

Para usar a atualização em lote, edite o array `userList` no script:

```javascript
const userList = [
  { identifier: 'gb810437', role: 'admin', identifierType: 'username' },
  { identifier: 'user2@email.com', role: 'admin', identifierType: 'email' },
  { identifier: 'user3', role: 'user', identifierType: 'username' },
];
```

### Roles Disponíveis

- `admin` - Administrador do sistema
- `user` - Usuário padrão

### Tipos de Identificador

- `username` - Nome de usuário (padrão)
- `email` - Endereço de email
- `ldapId` - ID do LDAP/Active Directory

### Exemplos de Saída

#### Listagem de usuários:

```
👥 LISTA DE USUÁRIOS:
=====================
1. Gustavo Casadei Bellanda
   Email: gustavobellanda@hpeautos.com.br
   Username: gb810437
   LDAP ID: gb810437
   Role: admin
   Provider: ldap
   Criado: 27/05/2025 11:30:15
   ---

Total: 1 usuários
```

#### Atualização de role:

```
📋 Usuário encontrado: Gustavo Casadei Bellanda (gustavobellanda@hpeautos.com.br)
📋 Role atual: user
✅ Role atualizado com sucesso para: admin
```

### Configuração

O script usa as configurações do arquivo `.env` do projeto:

- `MONGO_URI` - URI de conexão do MongoDB
- `DB_NAME` - Nome do banco de dados

### Segurança

⚠️ **Importante**: Este script tem acesso direto ao banco de dados. Use com cuidado em ambiente de produção.

### Troubleshooting

#### Erro de conexão MongoDB

```
❌ Erro ao atualizar usuário: MongoNetworkError
```

- Verifique se o MongoDB está rodando
- Confirme a URI de conexão no `.env`

#### Usuário não encontrado

```
❌ Usuário não encontrado: usuario123 (username)
```

- Verifique se o identificador está correto
- Use `node scripts/admin/updateUserRoles.js list` para ver usuários disponíveis
- Tente com um tipo de identificador diferente (email, ldapId)
