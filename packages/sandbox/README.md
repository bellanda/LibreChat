# @librechat/sandbox

Self-hosted Code Interpreter sandbox compatible with the [code.librechat](https://code.librechat.ai) API.

## Features

- **API-compatible**: Implements `/upload`, `/exec`, `/download`, `/files` endpoints
- **Storage**: `storage/{userId}/{sessionId}/uploads` and `workspace`
- **Isolation**: Docker-based execution, path validation, no path traversal
- **Languages**: Python (uv), JavaScript/TypeScript (bun)
- **Queue**: Built-in execution queue with configurable concurrency limits
- **Structured Logging**: JSON-formatted logs with Winston for easy integration with log aggregation tools
- **Audit Trail**: MongoDB-based audit logging for compliance and security (optional)

## Quick Start

### 1. Build the executor image

```bash
cd packages/sandbox
docker build -t librechat/sandbox-executor:latest -f docker/Dockerfile.executor docker/
```

### 2. Install dependencies and start the server

```bash
cd packages/sandbox
bun install  # or npm install
bun run start  # or npm start
```

### 3. Configure LibreChat

Add to your `.env`:

```
SANDBOX_PORT=3082
SANDBOX_API_KEY=your-secret-key
LIBRECHAT_CODE_API_KEY=your-secret-key

# Optional: MongoDB for audit logging (if not set, audit logs only to files)
MONGO_URI=mongodb://localhost:27017/librechat
```

`LIBRECHAT_CODE_BASEURL` is auto-set to `http://localhost:SANDBOX_PORT` when `SANDBOX_PORT` exists.
Users must set the same API key in their Code Interpreter settings (or use a shared key).

**Note**: If `MONGO_URI` is not set, the sandbox will still work but audit logs will only be written to structured log files (not persisted to database).

### 4. (Optional) Run with Docker Compose

```yaml
# docker-compose.override.yml
services:
  sandbox:
    build:
      context: ./packages/sandbox
      dockerfile: docker/Dockerfile.executor
    image: librechat/sandbox-executor:latest
    # The sandbox server runs on the host and uses this image for execution
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SANDBOX_PORT` | 3081 | HTTP server port |
| `SANDBOX_STORAGE_PATH` | `./storage` | Base path for user/session storage |
| `SANDBOX_API_KEY` | - | API key for auth (or use `LIBRECHAT_CODE_API_KEY`) |
| `SANDBOX_DOCKER_IMAGE` | `librechat/sandbox-executor:latest` | Docker image for code execution |
| `SANDBOX_TIMEOUT_MS` | 30000 | Execution timeout |
| `SANDBOX_MEMORY_MB` | 512 | Memory limit per execution |
| `SANDBOX_MAX_CONCURRENT_EXECUTIONS` | 5 | Maximum number of simultaneous code executions (queue limit) |
| `MONGO_URI` | - | MongoDB connection string for audit logging (optional) |
| `SANDBOX_LOG_LEVEL` | `info` | Logging level (error, warn, info, debug, verbose) |
| `SANDBOX_AUDIT_TTL_DAYS` | - | TTL in days for audit logs (auto-delete after expiration, optional) |
| `MONGO_MAX_POOL_SIZE` | 10 | MongoDB connection pool max size |
| `MONGO_MIN_POOL_SIZE` | 2 | MongoDB connection pool min size |

## Storage Layout

```
storage/
└── {userId}/
    └── {sessionId}/
        ├── uploads/          # User-uploaded files (read-only in container)
        │   ├── .manifest.json
        │   └── {uuid}.{ext}
        ├── workspace/        # Execution outputs
        │   └── exec_*/
        └── .session.json
```

## Security

- Path traversal and symlink escape prevention
- Docker `--network none` by default
- Non-root user in container
- API key authentication

## Logging & Audit

### Structured Logging

The sandbox uses Winston for structured JSON logging. In production, logs are output as JSON for easy parsing by log aggregation tools (ELK, Loki, CloudWatch, etc.). In development, logs are formatted for human readability.

Log levels: `error`, `warn`, `info`, `debug`, `verbose`

### Audit Trail

All sandbox operations are logged for compliance and security auditing:

- **Upload events**: File uploads with metadata (filename, size, user, session)
- **Execution events**: Code executions with metrics (language, duration, exit code, resource usage)
- **Download events**: File downloads with user and session tracking
- **Files list events**: Directory listing requests
- **Authentication failures**: Failed API key attempts

Audit logs are stored in MongoDB (collection: `sandbox_audit_logs`) if `MONGO_URI` is configured. If MongoDB is not available, audit events are still logged to structured log files.

#### Audit Log Schema

```javascript
{
  action: 'upload' | 'exec' | 'download' | 'files_list' | 'auth_failure',
  userId: string,
  sessionId: string,
  status: 'success' | 'error' | 'denied',
  ip: string,
  userAgent: string,
  details: object,        // Action-specific details
  execution: {             // For exec actions
    lang: string,
    durationMs: number,
    exitCode: number,
    memoryMB: number,
    filesGenerated: number
  },
  file: {                 // For upload/download actions
    fileId: string,
    filename: string,
    size: number,
    mimeType: string
  },
  error: string,          // Error message if status is 'error'
  createdAt: Date,
  updatedAt: Date
}
```

#### Querying Audit Logs

Example MongoDB queries:

```javascript
// All executions by a user
db.sandbox_audit_logs.find({ userId: 'user123', action: 'exec' })

// Failed executions in last 24 hours
db.sandbox_audit_logs.find({
  action: 'exec',
  status: 'error',
  createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
})

// Authentication failures
db.sandbox_audit_logs.find({ action: 'auth_failure' })
```

#### Automatic Cleanup

Set `SANDBOX_AUDIT_TTL_DAYS` to automatically delete audit logs after a specified number of days (useful for compliance with data retention policies).
