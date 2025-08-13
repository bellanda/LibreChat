FROM python:3.12-slim AS main

WORKDIR /app

# 🛡️ Instalar certificados e dependências
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    pandoc \
    netcat-openbsd \
    libgl1 \
    libglib2.0-0 \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 🚀 Adicionar `uv` 
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN uv --version

COPY pyproject.toml .
COPY .python-version .
RUN uv sync

# 📚 Download NLTK com tratamento de certificados
RUN uv run python -c "import ssl; import nltk; nltk.download('punkt_tab', download_dir='/app/nltk_data'); nltk.download('averaged_perceptron_tagger', download_dir='/app/nltk_data')"
ENV NLTK_DATA=/app/nltk_data

# 🚫 Desativar analytics
ENV SCARF_NO_ANALYTICS=true

COPY . .

CMD ["uv", "run", "main.py"]