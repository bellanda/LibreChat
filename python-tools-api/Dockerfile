FROM python:3.12-bullseye
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/

WORKDIR /app

COPY . .

RUN uv sync

# Instalar dependências do sistema para o markdown-html-pdf (wkhtmltopdf, fontes, etc)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wkhtmltopdf \
    fonts-dejavu-core \
    fonts-liberation \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar Playwright e seus navegadores durante o build
RUN uv run playwright install chromium
RUN uv run playwright install-deps chromium
RUN uv run install-emoji-fonts

EXPOSE 15784

COPY app/ app/

# Comando direto para iniciar a aplicação
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "15784"]
