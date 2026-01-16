# TeraTrace Client

A Node.js client library for sending logs to [TeraTrace](https://github.com/tera-language/tera-trace), a lightweight local observability tool.

## Installation

```bash
npm install tera-trace-client
```

## Quick Start

```javascript
const TeraTraceClient = require('tera-trace-client');

// Create client with default settings (connects to localhost:8090 via HTTP)
const tracer = new TeraTraceClient({
  service: 'my-app',
});

// Send a log
await tracer.info('Application started', {
  traceId: 'abc-123',
  metadata: { userId: 12345 },
});

// Send different log levels
await tracer.error('Database connection failed');
await tracer.warn('High memory usage detected');
await tracer.debug('Processing request', { requestId: 'req-456' });
```

## Configuration Options

```javascript
const tracer = new TeraTraceClient({
  host: 'localhost', // TeraTrace server host
  httpPort: 8090, // HTTP ingestion port
  wsPort: 8081, // WebSocket port
  service: 'my-service', // Default service name
  transport: 'http', // 'http' or 'ws'
  autoReconnect: true, // Auto reconnect WebSocket (WS only)
});
```

## Transport Methods

### HTTP Transport (Default)

- Uses HTTP POST requests to `/ingest` endpoint
- Simple and reliable for most use cases
- No persistent connections

```javascript
const tracer = new TeraTraceClient({
  transport: 'http', // Default
});
```

### WebSocket Transport

- Maintains persistent WebSocket connection to `/ws` endpoint
- Lower latency for high-frequency logging
- Automatic reconnection on connection loss

```javascript
const tracer = new TeraTraceClient({
  transport: 'ws',
});
```

## Log Entry Format

Log entries support the following fields:

```javascript
{
  level: 'INFO',           // Log level: INFO, WARN, ERROR, DEBUG
  message: 'Log message',  // Required: The log message
  service: 'my-service',   // Service name (uses client default if not specified)
  timestamp: '2024-01-01T12:00:00.000Z',  // ISO timestamp (auto-generated if not provided)
  traceId: 'trace-123',    // Optional trace ID
  sessionId: 'sess-456',   // Optional session ID
  metadata: {              // Optional additional data
    userId: 123,
    requestId: 'req-789'
  }
}
```

## API Reference

### Constructor

```javascript
new TeraTraceClient(options);
```

### Methods

#### `log(logData)`

Send a custom log entry.

#### `info(message, options)`

Send an INFO level log.

#### `warn(message, options)`

Send a WARN level log.

#### `error(message, options)`

Send an ERROR level log.

#### `debug(message, options)`

Send a DEBUG level log.

#### `close()`

Close WebSocket connection (WebSocket transport only).

## Examples

### Basic Logging

```javascript
const tracer = new TeraTraceClient({ service: 'api-server' });

app.get('/users/:id', async (req, res) => {
  await tracer.info('Fetching user data', {
    traceId: req.headers['x-trace-id'],
    metadata: { userId: req.params.id },
  });

  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    await tracer.error('Failed to fetch user', {
      traceId: req.headers['x-trace-id'],
      metadata: { userId: req.params.id, error: error.message },
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Error Tracking

```javascript
const tracer = new TeraTraceClient({ service: 'payment-service' });

process.on('uncaughtException', async (error) => {
  await tracer.error('Uncaught exception', {
    metadata: {
      error: error.message,
      stack: error.stack,
      nodeVersion: process.version,
      platform: process.platform,
    },
  });
});
```

### Request Tracing

```javascript
const tracer = new TeraTraceClient({ service: 'web-server' });

app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] || generateTraceId();

  tracer.info('Incoming request', {
    traceId,
    metadata: {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    },
  });

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    tracer.info('Request completed', {
      traceId,
      metadata: {
        statusCode: res.statusCode,
        duration,
      },
    });
  });

  next();
});
```

## Integration with Express

Create a middleware for automatic request logging:

```javascript
const express = require('express');
const TeraTraceClient = require('tera-trace-client');

const app = express();
const tracer = new TeraTraceClient({ service: 'express-app' });

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const traceId = req.headers['x-trace-id'] || `req-${Date.now()}`;

  // Log incoming request
  tracer.info(`${req.method} ${req.url}`, {
    traceId,
    metadata: {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    tracer.info(`Response ${res.statusCode}`, {
      traceId,
      metadata: { duration },
    });
  });

  next();
});

app.listen(3000);
```

## Requirements

- Node.js 14+
- Running TeraTrace server (default: localhost:8090 for HTTP, localhost:8081 for WebSocket)

## License

MIT
