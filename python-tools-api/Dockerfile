FROM python:3.13-slim-trixie

WORKDIR /app

# Add uv package manager
COPY --from=docker.io/astral/uv:latest /uv /uvx /bin/

COPY . .

RUN uv sync

# Install system dependencies for markdown-html-pdf (wkhtmltopdf, fonts, etc)
RUN apt update && \
    apt install -y --no-install-recommends \
    wkhtmltopdf \
    fonts-dejavu-core \
    fonts-liberation \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright and its browsers during build
RUN uv run playwright install chromium
RUN uv run playwright install-deps chromium
RUN uv run install-emoji-fonts

EXPOSE 15784

COPY app/ app/

# Direct command to start the application
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "15784"]
