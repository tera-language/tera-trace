# TeraTrace

**TeraTrace** is a lightweight, local-only tracing and observability tool for development.  
It runs entirely on your machine and exposes a web-based interface for viewing runtime data in real time.

> ⚠️ **Local use only**  
> TeraTrace does not expose any external networking and is intended for local development and debugging.

---

## Features

- Local HTTP server with embedded web UI
- Real-time updates via WebSockets
- No external dependencies or cloud services
- Single self-contained executable
- Designed for development and debugging workflows

---

## Getting Started

### Requirements
- Go 1.22+ (for building from source)

### Build

```bash
go build -o teratrace.exe ./cmd/tera-trace
```

### Run
Windows

You can simply double-click the executable:

```
teratrace.exe
```

Or run it from Command Prompt / PowerShell:

```powershell
./teratrace.exe
```

Once running, open your browser and navigate to:

```
http://localhost:8080
```

---

Project Structure
> ⚠️ **Struture is subject to change**  
> This structure maybe change as this project is in active development.
```
tera-trace/
├─ cmd/                # Entry points (build targets)
├─ pkg/
│  ├─ aggregator/      # Data aggregation logic
│  ├─ ingestion/       # HTTP & WebSocket ingestion servers
│  ├─ server/          # Dashboard HTTP server
│  ├─ storage/         # In-memory storage layer
│  ├─ terminal/        # Terminal UI / startup banner
│  ├─ translator/     # Data translation utilities
│  ├─ ui/              # Embedded web UI assets
│  └─ utils/           # Logging & helpers
├─ go.mod
├─ go.sum
├─ LICENSE
```

---

### Security & Networking

Binds only to `127.0.0.1`

- No outbound network connections

- No data is collected or transmitted externally

- Designed to be transparent and inspectable

 If your antivirus flags early development builds, this is typically due to:

- Unsigned binaries

- Embedded web servers

- Local WebSocket usage

These are known false positives for new developer tools.

---

### Status

Early development
APIs and internal structure may change.

---

### License

MIT License
