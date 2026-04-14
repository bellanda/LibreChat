docker compose -f docker-compose.dev.override.yml down && \
docker compose -f docker-compose.dev.override.yml up

PROD

docker compose build & docker compose down & docker compose compose up -d --force-recreate & docker system prune

rm811487@WSCAT00378:~/code/hpe/LibreChat$ git stash
Saved working directory and index state WIP on upstream-sync-jan-2026: 315b6c7ff - 🛠️ Ajustes em processadores de arquivos e otimizações em serviços de arquivos/otimização de ferramentas - 🎨 Melhorias no rendering e componentes de mensagens no client (ContentParts, MarkdownComponents, MessageRender, etc) - ⚙️ Configurações atualizadas em vite.config.ts e package.json - 🗂️ Criação de novos templates e builders para sandbox: Python e JS para documentos corporativos, temas PDF e estilos fixos - 📄 Adicionado guia operacional (pt-br) de uso de IA com guardrails em sandbox/templates
