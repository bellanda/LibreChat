FROM python:3.12-slim

# Install cron, tzdata and other system dependencies
RUN apt-get update && apt-get install -y \
    cron \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set timezone to Brazil (Brasília)
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Add `uv` for package management
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN uv --version

# Set working directory
WORKDIR /app

# Copy Python project files
COPY pyproject.toml uv.lock .python-version ruff.toml ./

# Install Python dependencies
RUN uv sync --frozen

# Copy scripts and crontab
COPY scripts/ ./scripts/
COPY crontab /etc/cron.d/librechat-cron

# Set proper permissions for crontab
RUN chmod 0644 /etc/cron.d/librechat-cron && \
    crontab /etc/cron.d/librechat-cron

# Create log directory
RUN mkdir -p /var/log/cron

# Start cron in foreground
CMD ["cron", "-f"]
