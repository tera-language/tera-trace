# AGENTS.md - Development Guidelines for TeraTrace

This document provides comprehensive guidelines for AI coding agents working on the TeraTrace project. Follow these conventions to maintain code quality and consistency.

## Project Overview

TeraTrace is a lightweight, local-only tracing and observability tool written in Go. It provides real-time monitoring through a web interface without external dependencies.

### Components

- **Core Server**: Go-based observability server with HTTP/WebSocket ingestion
- **Client Package**: Node.js client library for sending logs to TeraTrace
- **Integration Tests**: Comprehensive test suite for validating client-server communication

## Build, Lint, and Test Commands

### Building
```bash
# Build the main executable
go build -o teratrace.exe ./cmd/tera-trace

# Build for different platforms
GOOS=linux GOARCH=amd64 go build -o teratrace-linux ./cmd/tera-trace
GOOS=darwin GOARCH=amd64 go build -o teratrace-mac ./cmd/tera-trace
```

### Formatting and Linting
```bash
# Format all Go files
go fmt ./...

# Vet for potential issues
go vet ./...

# Run both formatting and vetting
go fmt ./... && go vet ./...
```

### Testing
```bash
# Run all Go tests (when tests are added)
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests for a specific package
go test ./pkg/utils

# Run a single test function (when tests exist)
go test -run TestFunctionName ./pkg/package_name

# Run tests with verbose output
go test -v ./...
```

### Client Package Testing
```bash
# Run client package tests (requires server running)
cd tera-trace-client
npm test

# Run linting and formatting
npm run lint
npm run format

# Run example
npm run example
```

### Integration Testing
```bash
# Run integration tests (requires server running)
cd package-test
npm run test:all    # Run all tests
npm run test:http   # Test HTTP transport only
npm run test:ws     # Test WebSocket transport only
npm run test        # Run integration tests only
```

### Development Workflow
```bash
# Clean build artifacts
go clean

# Tidy dependencies
go mod tidy

# Download dependencies
go mod download

# Verify dependencies
go mod verify
```

## Code Style Guidelines

### General Conventions

- **Line Length**: Keep lines under 100 characters when possible
- **File Organization**: Use `package main` for executables, `package <name>` for libraries
- **Comments**: Use `//` for single-line comments. Document exported functions and types
- **Naming**: Follow Go naming conventions:
  - `PascalCase` for exported identifiers (functions, types, constants)
  - `camelCase` for unexported identifiers
  - Acronyms like HTTP, API, ID remain uppercase in PascalCase (e.g., `HTTPClient`, `APIEndpoint`)

### Imports

Group imports in this order with blank lines between groups:
1. Standard library imports
2. Third-party imports
3. Local project imports

```go
import (
    "fmt"
    "time"

    "github.com/gorilla/websocket"

    "github.com/tera-language/tera-trace/pkg/utils"
)
```

### Structs and Types

- Use JSON tags for structs that will be serialized
- Group related fields together
- Use meaningful field names

```go
type LogEntry struct {
    Timestamp time.Time              `json:"Timestamp"`
    Level     string                 `json:"Level"`
    Message   string                 `json:"Message"`
    Service   string                 `json:"Service"`
    TraceID   string                 `json:"TraceID,omitempty"`
    SessionID string                 `json:"SessionID,omitempty"`
    Metadata  map[string]interface{} `json:"Metadata,omitempty"`
}
```

### Functions

- Use descriptive names that indicate purpose
- Group parameters logically
- Return errors as the last return value
- Use early returns to reduce nesting

```go
func TranslateJSON(raw []byte, defaultService string) (*LogEntry, error) {
    // Implementation
}
```

### Error Handling

- Always check for errors
- Use `fmt.Errorf` with `%w` verb for error wrapping
- Provide context in error messages
- Return errors immediately unless recovery is possible

```go
if err := json.Unmarshal(raw, &generic); err != nil {
    return nil, fmt.Errorf("failed to unmarshal raw log: %w", err)
}
```

### Constants

- Group related constants together
- Use meaningful constant names
- Use `iota` for enumerated constants

```go
const (
    LevelInfo  = "INFO"
    LevelWarn  = "WARN"
    LevelError = "ERROR"
    LevelDebug = "DEBUG"
)
```

### Control Flow

- Use `switch` statements for multiple conditions instead of long if-else chains
- Prefer `for` loops over other iteration methods when appropriate
- Use `range` for iterating over slices, maps, and channels

### Logging

Use the centralized logging utility in `pkg/utils`:

```go
utils.Log(utils.LevelInfo, "COMPONENT", "message")
utils.Log(utils.LevelError, "COMPONENT", "error message: "+err.Error())
```

Available log levels: `LevelInfo`, `LevelWarn`, `LevelError`, `LevelDebug`

### Goroutines and Concurrency

- Use goroutines for concurrent operations
- Always handle potential race conditions
- Use channels for communication between goroutines
- Document goroutine lifecycles

### HTTP Servers

- Bind only to localhost (`127.0.0.1`) for security
- Use `http.NewServeMux()` for routing
- Handle server startup errors appropriately

```go
server := &http.Server{
    Addr:    addr,
    Handler: mux,
}
return server.ListenAndServe()
```

### WebSocket Usage

- Use the gorilla/websocket library for WebSocket connections
- Handle connection upgrades properly
- Close connections gracefully

## Project Structure

Follow the established package structure:

```
tera-trace/
├── cmd/                    # Entry points (build targets)
├── pkg/
│   ├── aggregator/         # Data aggregation logic
│   ├── ingestion/          # HTTP & WebSocket ingestion servers
│   ├── server/             # Dashboard HTTP server
│   ├── storage/            # In-memory storage layer
│   ├── terminal/           # Terminal UI / startup banner
│   ├── translator/         # Data translation utilities
│   ├── ui/                 # Embedded web UI assets
│   └── utils/              # Logging & helpers
├── tera-trace-client/      # Node.js client package
├── package-test/           # Integration tests
├── go.mod
├── go.sum
├── AGENTS.md               # This file
└── README.md
```

### Package Responsibilities

- **aggregator**: Processes and aggregates incoming data
- **ingestion**: Handles HTTP and WebSocket data intake
- **server**: Serves the web dashboard
- **storage**: Manages in-memory data storage
- **terminal**: Handles CLI output and startup banners
- **translator**: Converts raw data to structured log entries
- **ui**: Contains embedded web assets
- **utils**: Shared utilities like logging
- **tera-trace-client**: Node.js client library for sending logs to TeraTrace
- **package-test**: Integration test suite for client-server communication

## Security Considerations

- **Network Binding**: Always bind to `127.0.0.1` only
- **No External Connections**: Never make outbound network requests
- **Data Privacy**: All data remains local to the machine
- **Input Validation**: Validate all incoming data
- **Error Messages**: Don't expose sensitive information in errors

## Testing Guidelines

When adding tests:

1. Create `*_test.go` files in the same package
2. Use table-driven tests for multiple test cases
3. Test both success and error paths
4. Use meaningful test names: `TestFunctionName_Scenario`

Example test structure:
```go
func TestTranslateJSON(t *testing.T) {
    tests := []struct {
        name     string
        input    []byte
        service  string
        wantErr  bool
    }{
        // test cases
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // test implementation
        })
    }
}
```

## Code Review Checklist

Before committing code:

- [ ] `go fmt` and `go vet` pass without errors
- [ ] All exported functions/types have documentation
- [ ] Error handling is comprehensive
- [ ] No hardcoded values that should be constants
- [ ] Naming follows Go conventions
- [ ] Imports are properly grouped and sorted
- [ ] Code compiles successfully
- [ ] No unused variables or imports
- [ ] Security considerations addressed

## Git Workflow

- Use descriptive commit messages
- Keep commits focused on single changes
- Use branches for feature development
- Follow conventional commit format when possible

## Development Environment

- Go 1.24.1 or later
- Node.js 14+ (for client package development)
- Windows/Linux/macOS support
- No external dependencies for runtime
- Web browser for UI access (localhost:8080)

## Performance Considerations

- Minimize allocations in hot paths
- Use efficient data structures
- Profile memory usage for long-running processes
- Consider goroutine pool sizes for concurrent operations

---

*This document should be updated as the project evolves and new patterns emerge.*