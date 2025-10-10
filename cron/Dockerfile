FROM python:3.12-bullseye

# Install cron, tzdata and other system dependencies
RUN apt-get update && apt-get install -y \
    cron \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set timezone to Brazil (Brasilia)
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


###########################
# Install Oracle Instant Client
ENV ORACLE_VERSION=23.8.0.25.04-1
RUN apt-get update && apt-get install -y \
    wget \
    rpm2cpio \
    cpio \
    alien \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

# Download Oracle Instant Client RPMs
RUN wget https://download.oracle.com/otn_software/linux/instantclient/2380000/oracle-instantclient-basic-23.8.0.25.04-1.el9.x86_64.rpm -O oracle-basic.rpm && \
    wget https://download.oracle.com/otn_software/linux/instantclient/2380000/oracle-instantclient-sqlplus-23.8.0.25.04-1.el9.x86_64.rpm -O oracle-sqlplus.rpm

# Extract RPM files
RUN rpm2cpio oracle-basic.rpm | cpio -idmv && \
    rpm2cpio oracle-sqlplus.rpm | cpio -idmv

# Create Oracle client directory structure
RUN mkdir -p /usr/lib/oracle/23/client64
RUN mkdir -p /usr/lib/oracle/23/client64/network/admin

# Move extracted files to final location
RUN cp -r usr/lib/oracle/23/client64/. /usr/lib/oracle/23/client64/

# Set environment variables for Oracle
ENV LD_LIBRARY_PATH=/usr/lib/oracle/23/client64/lib:$LD_LIBRARY_PATH
ENV ORACLE_HOME=/usr/lib/oracle/23/client64
ENV PATH=${ORACLE_HOME}/bin:$PATH

# Copy tnsnames.ora file
COPY tnsnames.ora /usr/lib/oracle/23/client64/network/admin/tnsnames.ora

###########################


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
COPY . .
COPY crontab /etc/cron.d/librechat-cron

# Set proper permissions for crontab
RUN chmod 0644 /etc/cron.d/librechat-cron && \
    crontab /etc/cron.d/librechat-cron

# Create log directory
RUN mkdir -p /var/log/cron

# Start cron in foreground
CMD ["cron", "-f"]
