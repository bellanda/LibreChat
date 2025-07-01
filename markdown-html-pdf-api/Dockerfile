FROM python:3.12-slim
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
    && rm -rf /var/lib/apt/lists/*


EXPOSE 15784

COPY app/ app/

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "15784"]
# uv run uvicorn app.main:app --host 0.0.0.0 --port 15784
