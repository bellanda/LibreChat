# Build

```

git pull && docker compose -f docker-compose.yml -f docker-compose.dev.override.yml down && docker compose -f docker-compose.yml -f docker-compose.dev.override.yml up --build
```

git pull && \
docker compose -f docker-compose.yml -f docker-compose.dev.override.yml build && \
docker compose -f docker-compose.yml -f docker-compose.dev.override.yml down && \
docker compose -f docker-compose.yml -f docker-compose.dev.override.yml up --force-recreate

docker-compose.prod.override.yml — revertido, sem tocar ✅

Para subir no stage:

# Build do executor (imagem que roda o código Python/JS)

docker build -f packages/sandbox/docker/Dockerfile.executor \
 -t librechat/sandbox-executor:latest packages/sandbox

# Subir com o dev override

docker compose -f docker-compose.yml -f docker-compose.dev.override.yml up -d --build sandbox api

---

Passo 1 — Commitar o que está pendente aqui
git add packages/sandbox/templates/corporate_builders.py \
 packages/sandbox/templates/tests/test_builders.py \
 .env

git commit -m "fix: corporate_builders — document_type API, PPTX bugs, CSS vars PDF, polars"

Passo 2 — Criar uma tag de segurança no stage atual (garante o rollback)
git fetch origin stage
git tag stage-pre-merge-$(date +%Y%m%d) origin/stage

Passo 3 — Fazer o merge
git checkout stage
git merge upstream-sync-jan-2026 --no-ff -m "merge: upstream-sync-jan-2026 → stage (14/04/2026)"

Se houver conflito, para manter sempre a versão da sua branch:
git checkout --theirs .
git add .
git merge --continue

Passo 4 — Push
git push origin stage

---

Para rollback a qualquer hora:
git checkout stage
git reset --hard stage-pre-merge-20260414
git push origin stage --force

---

Uma observação: stage tem 4 commits que não estão na sua branch (fix: update dependencies, atualizações de token

---

# CRIAR USER

---

## docker exec -it api_dev npm run create-user

# COMANDOS tokens

1. ´´´
   docker exec -it mongodb_dev mongosh LibreChat --eval '
   db.users.find().forEach(function(user) {
   var hasBalance = db.balances.findOne({ user: user.\_id });
   if (!hasBalance) {
   db.balances.insertOne({
   user: user.\_id,
   tokenPayPref: "prepaid",
   credit: 1000000
   });
   print("Créditos iniciais atribuídos a: " + user.email);
   }
   });
   '
   ´´´

2.

´´´
docker exec -it mongodb_dev mongosh LibreChat --eval '
db.balances.find({ tokenPayPref: { $ne: "prepaid" } }).forEach(function(b) {
db.balances.updateOne({ \_id: b.\_id }, { $set: { tokenPayPref: "prepaid" } });
print("Atualizado balanço para prepaid: " + b.user);
});
'
´´´
