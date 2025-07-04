docker build -t markdown-html-pdf-api ./packages/markdown-html-pdf-apidocker build -t markdown-html-pdf-api ./packages/markdown-html-pdf-api

1. Pare e remova o container antigo (se estiver rodando)

docker stop markdown-html-pdf-api
docker rm markdown-html-pdf-api

2. Rebuild da imagem
No diretório raiz do seu projeto (ou onde está o Dockerfile):

docker build -t markdown-html-pdf-api ./packages/markdown-html-pdf-api

3. Rode novamente o container

docker run -d -p 8000:8000 --name markdown-html-pdf-api markdown-html-pdf-api

Pronto! O serviço estará rodando com a nova versão.
Se estiver usando docker-compose, basta rodar:

docker-compose up --build markdown-html-pdf-api

Se quiser automatizar ou ver os logs, me avise!