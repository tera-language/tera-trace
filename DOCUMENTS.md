# TeraTrace Documentation

Welcome to the official documentation for TeraTrace, a lightweight local observability tool for developers.

## 📚 Table of Contents

- [Getting Started](README.md#getting-started)
- [Installation](README.md#installation)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Client SDK](#client-sdk)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](CONTRIBUTING.md)
- [Security](README.md#security)

## 📖 Usage Guide

### Basic Concepts

TeraTrace operates on three main principles:

1. **Local-First**: Everything runs on your machine, no external dependencies
2. **Real-Time**: Live streaming of logs via WebSocket connections
3. **Developer-Centric**: Designed specifically for local development workflows

### Log Ingestion

TeraTrace accepts logs through two primary methods:

#### HTTP POST
Send logs via HTTP POST requests to `http://localhost:8090/ingest`:

```bash
curl -X POST http://localhost:8090/ingest \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "Hello World", "service": "my-app"}'
```

#### WebSocket
Establish a persistent WebSocket connection to `ws://localhost:8081/ws`:

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8081/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    level: 'INFO',
    message: 'WebSocket log',
    service: 'my-app'
  }));
});
```

### Web Dashboard

Access the web interface at `http://localhost:8080` to:
- View logs in real-time
- Filter by service, level, or time
- Search through log messages
- Monitor connection status

## 🔧 API Reference

### Log Entry Format

All logs are converted to a standardized format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO|WARN|ERROR|DEBUG",
  "message": "Log message text",
  "service": "service-name",
  "traceId": "optional-trace-identifier",
  "sessionId": "optional-session-identifier",
  "metadata": {
    "key": "value",
    "additional": "data"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string | No | ISO 8601 timestamp (auto-generated if missing) |
| `level` | string | No | Log level: INFO, WARN, ERROR, DEBUG (defaults to INFO) |
| `message` | string | Yes | The log message content |
| `service` | string | No | Service/application name (configurable default) |
| `traceId` | string | No | Trace identifier for request correlation |
| `sessionId` | string | No | Session identifier for user tracking |
| `metadata` | object | No | Additional structured data |

### HTTP Endpoints

#### POST /ingest
Accepts JSON log entries via HTTP POST.

**Request:**
```http
POST /ingest HTTP/1.1
Content-Type: application/json

{
  "level": "INFO",
  "message": "Application started",
  "service": "web-server"
}
```

**Response:**
```http
HTTP/1.1 200 OK
```

### WebSocket Endpoints

#### /ws
WebSocket endpoint for real-time log streaming.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8081/ws');
```

**Message Format:**
```json
{
  "level": "INFO",
  "message": "Real-time log",
  "service": "app"
}
```

## 📦 Client SDK

### Node.js Client

The official Node.js client provides a convenient interface for sending logs to TeraTrace.

#### Installation

```bash
npm install tera-trace-client
```

#### Basic Usage

```javascript
const TeraTraceClient = require('tera-trace-client');

const tracer = new TeraTraceClient({
  service: 'my-application',
  transport: 'http'  // or 'ws'
});

// Simple logging
await tracer.info('Application started');
await tracer.warn('Warning message');
await tracer.error('Error occurred');
await tracer.debug('Debug information');

// Structured logging
await tracer.log({
  level: 'INFO',
  message: 'User action completed',
  traceId: 'req-12345',
  metadata: {
    userId: 123,
    action: 'login'
  }
});
```

#### Configuration Options

```javascript
const tracer = new TeraTraceClient({
  host: 'localhost',        // Server host (default: 'localhost')
  httpPort: 8090,          // HTTP port (default: 8090)
  wsPort: 8081,            // WebSocket port (default: 8081)
  service: 'my-app',       // Default service name
  transport: 'http',       // 'http' or 'ws' (default: 'http')
  autoReconnect: true      // Auto-reconnect WebSocket (default: true)
});
```

#### Transport Methods

**HTTP Transport:**
- Reliable for low-frequency logging
- No persistent connections
- Simple and lightweight

**WebSocket Transport:**
- Ideal for high-frequency logging
- Persistent connections
- Automatic reconnection
- Lower latency

### Framework Integration

#### Express.js

```javascript
const express = require('express');
const TeraTraceClient = require('tera-trace-client');

const app = express();
const tracer = new TeraTraceClient({ service: 'express-app' });

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const traceId = req.headers['x-trace-id'] || `req-${Date.now()}`;

  tracer.info(`${req.method} ${req.url}`, {
    traceId,
    metadata: {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';

    tracer.log({
      level,
      message: `Response ${res.statusCode}`,
      traceId,
      metadata: { duration, statusCode: res.statusCode }
    });
  });

  next();
});
```

## ⚙️ Configuration

### Server Configuration

TeraTrace is configured primarily through code. Key settings include:

- **Host**: Default `127.0.0.1` (localhost only)
- **HTTP Port**: Default `8090` for log ingestion
- **WebSocket Port**: Default `8081` for real-time streaming
- **Web Port**: Default `8080` for dashboard
- **Storage Limit**: Default 1000 log entries

### Client Configuration

See the [Client SDK](#client-sdk) section for configuration options.

### Environment Variables

Currently, TeraTrace does not use environment variables. All configuration is done programmatically.

## 🔧 Troubleshooting

### Common Issues

#### Server Won't Start

**Problem:** TeraTrace fails to start or bind to ports.

**Solutions:**
- Check if ports 8080, 8090, 8081 are available
- Ensure you're running as a user with permission to bind to ports
- On Windows, try running as Administrator
- Check for other applications using these ports

**Check port availability:**
```bash
# Linux/macOS
lsof -i :8080
lsof -i :8090
lsof -i :8081

# Windows
netstat -ano | findstr :8080
```

#### Logs Not Appearing

**Problem:** Logs sent to TeraTrace don't appear in the dashboard.

**Solutions:**
- Verify TeraTrace server is running
- Check the correct endpoints are being used
- Ensure JSON format is valid
- Check browser console for WebSocket connection issues
- Verify firewall isn't blocking local connections

#### Client Connection Errors

**Problem:** Client SDK fails to connect.

**Solutions:**
- Confirm TeraTrace server is running
- Check host and port configuration
- Verify network connectivity to localhost
- Try switching between HTTP and WebSocket transport

### Performance Issues

#### High Memory Usage

**Problem:** TeraTrace consumes too much memory.

**Solutions:**
- The in-memory storage is limited to 1000 entries by default
- Restart the server to clear accumulated logs
- Consider log rotation in high-volume scenarios

#### Slow Dashboard

**Problem:** Web interface is slow or unresponsive.

**Solutions:**
- Check browser developer tools for errors
- Ensure WebSocket connection is established
- Try refreshing the page
- Check system resources (CPU, memory)

### Debug Mode

Enable additional logging by checking the server console output when running TeraTrace.

## 📊 Best Practices

### Log Levels

Use appropriate log levels:

- **DEBUG**: Detailed diagnostic information
- **INFO**: General information about application operation
- **WARN**: Warning conditions that don't stop operation
- **ERROR**: Error conditions that may affect operation

### Structured Logging

Always include relevant context:

```javascript
// Good
tracer.info('User login successful', {
  traceId: req.id,
  metadata: {
    userId: user.id,
    loginMethod: 'password',
    ipAddress: req.ip
  }
});

// Avoid
tracer.info('User logged in');
```

### Trace IDs

Use trace IDs to correlate related log entries:

```javascript
const traceId = req.headers['x-trace-id'] || generateTraceId();

// Use the same traceId across all related operations
tracer.info('Processing payment', { traceId, metadata: { amount: 99.99 } });
tracer.info('Payment processed', { traceId, metadata: { transactionId: 'tx_123' } });
```

### Service Naming

Use consistent service names:

```javascript
// Good
const authTracer = new TeraTraceClient({ service: 'auth-service' });
const apiTracer = new TeraTraceClient({ service: 'api-gateway' });

// Avoid
const tracer1 = new TeraTraceClient({ service: 'auth' });
const tracer2 = new TeraTraceClient({ service: 'API' });
```

## 🔒 Security Considerations

TeraTrace is designed for local development use only:

- **No External Access**: Binds only to 127.0.0.1
- **No Data Transmission**: Never sends data externally
- **Local Storage**: All logs remain on your machine
- **No Authentication**: No security measures implemented

**⚠️ Important:** Never run TeraTrace on production systems or expose it to external networks.

## 📈 Performance

### Benchmarks

Typical performance characteristics:

- **Throughput**: 1000+ logs/second (depending on hardware)
- **Latency**: < 1ms for HTTP transport
- **Memory**: ~50MB baseline + ~1KB per stored log
- **CPU**: Minimal overhead for typical development workloads

### Optimization Tips

1. **Use WebSocket for high-frequency logging**
2. **Batch logs when possible**
3. **Limit stored log history** (currently fixed at 1000 entries)
4. **Use appropriate log levels** to reduce noise

## 🆘 Support

### Getting Help

1. **Check this documentation** first
2. **Review troubleshooting section** above
3. **Search existing issues** on GitHub
4. **Create a new issue** if needed

### Community

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community support
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 Changelog

### Version 1.0.0 (Latest)

- Initial release with HTTP and WebSocket ingestion
- Web dashboard with real-time updates
- Node.js client SDK
- Comprehensive testing suite

## 🔗 Links

- [GitHub Repository](https://github.com/tera-language/tera-trace)
- [Quick Start](README.md#quick-start)
- [Client SDK](README.md#client-sdk)
- [Contributing Guide](CONTRIBUTING.md)
- [Agent Guidelines](AGENTS.md)