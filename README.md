# TeraTrace

<div align="center">

**A lightweight, local-only tracing and observability tool for development**

[![Go Version](https://img.shields.io/badge/Go-1.24.1+-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

*Real-time observability for your local development environment*

[Quick Start](#quick-start) • [Documentation](DOCUMENTS.md) • [Contributing](CONTRIBUTING.md)

</div>

---

## ✨ Features

- 🚀 **Local-first**: Runs entirely on your machine with no external dependencies
- 🌐 **Web Dashboard**: Beautiful embedded web interface at `http://localhost:8080`
- 🔄 **Real-time Updates**: Live WebSocket connections for instant log streaming
- 📦 **Client Libraries**: Native SDK for Node.js applications
- 🛡️ **Security-first**: Binds only to localhost, no data leaves your machine
- 🏗️ **Developer Experience**: Designed specifically for local development workflows
- 📊 **Rich Observability**: Structured logging with trace IDs, metadata, and session tracking

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Client SDK](#client-sdk)
- [Architecture](#architecture)
- [Testing](#testing)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## 🚀 Quick Start

### 1. Start TeraTrace Server

```bash
# Clone the repository
git clone https://github.com/tera-language/tera-trace.git
cd tera-trace

# Build and run
go run ./cmd/tera-trace
```

### 2. Open Dashboard

Navigate to **[http://localhost:8080](http://localhost:8080)** in your browser

### 3. Send Some Logs

```bash
# Using curl (HTTP)
curl -X POST http://localhost:8090/ingest \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "Hello TeraTrace!", "service": "demo"}'
```

That's it! Your logs will appear instantly in the web dashboard.

## 📦 Installation

### Server (Go)

**Prerequisites:**
- Go 1.24.1 or later

**From Source:**
```bash
git clone https://github.com/tera-language/tera-trace.git
cd tera-trace
go build -o teratrace ./cmd/tera-trace
./teratrace
```

**Cross-platform builds:**
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o teratrace-linux ./cmd/tera-trace

# macOS
GOOS=darwin GOARCH=amd64 go build -o teratrace-macos ./cmd/tera-trace
```

### Client SDK (Node.js)

**Prerequisites:**
- Node.js 14 or later

```bash
npm install tera-trace-client
# or
yarn add tera-trace-client
```

## 💻 Usage

### Basic Usage

Once TeraTrace is running, you can send logs via:

- **HTTP POST** to `http://localhost:8090/ingest`
- **WebSocket** connection to `ws://localhost:8081/ws`

### Log Format

TeraTrace accepts JSON logs with the following structure:

```json
{
  "level": "INFO",
  "message": "User logged in",
  "service": "auth-service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "traceId": "abc-123-def",
  "sessionId": "session-456",
  "metadata": {
    "userId": 12345,
    "ip": "192.168.1.1"
  }
}
```

## 🔧 Client SDK

The `tera-trace-client` package provides a convenient SDK for Node.js applications.

### Installation

```bash
npm install tera-trace-client
```

### Basic Usage

```javascript
const TeraTraceClient = require('tera-trace-client');

// Create client
const tracer = new TeraTraceClient({
  service: 'my-app',
  transport: 'http'  // or 'ws' for WebSocket
});

// Send logs
await tracer.info('Application started');
await tracer.warn('High memory usage detected');
await tracer.error('Database connection failed', {
  traceId: 'req-123',
  metadata: { errorCode: 500 }
});

// Structured logging
await tracer.log({
  level: 'INFO',
  message: 'User action completed',
  traceId: 'trace-abc-123',
  sessionId: 'session-xyz-789',
  metadata: {
    userId: 12345,
    action: 'profile_update',
    duration: 250
  }
});
```

### Express.js Integration

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
      userAgent: req.headers['user-agent']
    }
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    tracer.info(`Response ${res.statusCode}`, {
      traceId,
      metadata: { duration }
    });
  });

  next();
});

app.listen(3000);
```

### Transport Options

**HTTP Transport (default):**
- Simple and reliable
- No persistent connections
- Best for low-frequency logging

**WebSocket Transport:**
- Persistent connections
- Lower latency for high-frequency logging
- Automatic reconnection on failures

```javascript
// HTTP (default)
const httpTracer = new TeraTraceClient({
  transport: 'http',
  service: 'my-service'
});

// WebSocket
const wsTracer = new TeraTraceClient({
  transport: 'ws',
  service: 'my-service'
});
```

## 🏗️ Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐
│   Applications  │────────────▶│                 │
│   (Node.js,     │             │   TeraTrace     │
│    curl, etc.)  │             │     Server      │
└─────────────────┘             │                 │
                                │ ┌─────────────┐ │
                                │ │   Ingestion │ │
┌─────────────────┐             │ │   Engine    │ │
│   Web Browser   │◀────────────│ └─────────────┘ │
│   Dashboard     │   WebSocket │                 │
└─────────────────┘             │ ┌─────────────┐ │
                                │ │  In-Memory  │ │
                                │ │   Storage   │ │
                                │ └─────────────┘ │
                                └─────────────────┘
```

### Components

- **Ingestion Engine**: Accepts logs via HTTP POST and WebSocket connections
- **Data Translator**: Converts raw logs into structured `LogEntry` objects
- **In-Memory Storage**: Stores recent logs with configurable limits
- **Web Dashboard**: Real-time web interface served from embedded assets
- **WebSocket Broadcaster**: Streams new logs to connected dashboard clients

### Ports

- **8080**: Web dashboard (HTTP)
- **8090**: Log ingestion (HTTP POST)
- **8081**: Log ingestion (WebSocket)

## 🧪 Testing

TeraTrace includes comprehensive integration tests for the client SDK.

### Prerequisites

Make sure TeraTrace server is running:

```bash
go run ./cmd/tera-trace
```

### Run Tests

```bash
# Test everything
cd package-test && npm run test:all

# Test individual transports
npm run test:http    # HTTP transport only
npm run test:ws      # WebSocket transport only
npm run test         # Integration tests only
```

### Test Coverage

- ✅ HTTP transport functionality
- ✅ WebSocket transport with reconnection
- ✅ Error handling and edge cases
- ✅ Performance testing (100 concurrent logs)
- ✅ Structured logging validation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Agent Guidelines](AGENTS.md) for details.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/tera-language/tera-trace.git
cd tera-trace

# Install client dependencies
cd tera-trace-client && npm install

# Install test dependencies
cd ../package-test && npm install

# Run linter and tests
cd ../tera-trace-client && npm run lint && npm test
```

### Project Structure

```
tera-trace/
├── cmd/tera-trace/           # Main application entry point
├── pkg/
│   ├── ingestion/            # HTTP/WebSocket servers
│   ├── server/               # Web dashboard server
│   ├── storage/              # In-memory data store
│   ├── translator/           # Log data transformation
│   ├── ui/                   # Embedded web assets
│   └── utils/                # Shared utilities
├── tera-trace-client/        # Node.js client SDK
├── package-test/             # Integration tests
├── AGENTS.md                 # AI agent guidelines
└── README.md
```

## 🔒 Security

TeraTrace is designed with security as a first-class concern:

- **Local-only**: Binds exclusively to `127.0.0.1` (localhost)
- **No external connections**: Never makes outbound network requests
- **No data collection**: All data remains on your local machine
- **Transparent operation**: Open source with inspectable code

### Known Security Notes

Antivirus software may flag development builds due to:
- Unsigned binaries
- Embedded web server functionality
- Local WebSocket usage

These are **false positives** for legitimate developer tools.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Go](https://golang.org/) for performance and reliability
- WebSocket support via [gorilla/websocket](https://github.com/gorilla/websocket)
- Inspired by the need for better local development observability

## 📞 Support

- 📖 [Documentation](DOCUMENTS.md)
- 🐛 [Issues](https://github.com/tera-language/tera-trace/issues)
- 💬 [Discussions](https://github.com/tera-language/tera-trace/discussions)

---

<div align="center">

**Made with ❤️ for developers, by developers**

[⭐ Star us on GitHub](https://github.com/tera-language/tera-trace) • [🐛 Report a bug](https://github.com/tera-language/tera-trace/issues)

</div>
