# TeraTrace Client Integration Tests

This directory contains integration tests for the `tera-trace-client` npm package. These tests verify that the client can successfully communicate with the TeraTrace server using both HTTP and WebSocket transports.

## Prerequisites

- Node.js 14+
- TeraTrace server must be running (`go run ./cmd/tera-trace` or `./teratrace.exe`)
- The `tera-trace-client` package must be built (see `../tera-trace-client/`)

## Installation

```bash
npm install
```

This will install the local `tera-trace-client` package and axios for server connectivity checks.

## Test Scripts

### Run All Tests
Runs all test suites sequentially (HTTP, WebSocket, and integration tests):

```bash
npm run test:all
```

### Individual Test Suites

#### Full Integration Test
Runs comprehensive integration tests including error handling and performance:

```bash
npm test
# or
npm run test
```

#### HTTP Transport Test
Test HTTP transport functionality:

```bash
npm run test:http
```

#### WebSocket Transport Test
Test WebSocket transport functionality:

```bash
npm run test:ws
```

## What the Tests Do

### HTTP Transport Test (`test-http.js`)
- Checks if TeraTrace server is running on localhost:8080
- Creates a client with HTTP transport
- Sends various log types (info, warn, error, debug)
- Sends structured log entries with trace IDs and metadata
- Verifies all logs are sent successfully

### WebSocket Transport Test (`test-ws.js`)
- Checks if TeraTrace server is running on localhost:8080
- Creates a client with WebSocket transport
- Sends various log types
- Tests connection persistence
- Sends a batch of logs to test performance
- Closes the WebSocket connection properly

### Integration Test (`test-integration.js`)
- Comprehensive test suite that includes:
  - HTTP transport verification
  - WebSocket transport verification
  - Error handling tests (invalid server, invalid transport)
  - Performance test (100 concurrent logs)

### Run All Tests (`npm run test:all`)
- Executes all test suites sequentially:
  1. HTTP transport tests
  2. WebSocket transport tests
  3. Integration tests
- Ensures complete test coverage across all transport methods
- Useful for CI/CD pipelines or comprehensive validation

## Verification

After running any test, you can verify the results by:

1. Opening your browser to `http://localhost:8080`
2. Checking the TeraTrace web interface for the logged messages
3. Verifying that all expected log entries appear with correct:
   - Service names
   - Log levels
   - Messages
   - Trace IDs
   - Metadata

## Expected Output

A successful test run should show:

```
🔬 Running TeraTrace Client Integration Tests...

🔨 Building TeraTrace server...
✅ Server built successfully

🚀 Starting TeraTrace server...
✅ Server started successfully

📡 Test 1: HTTP Transport
✅ HTTP transport working correctly

🔗 Test 2: WebSocket Transport
✅ WebSocket transport working correctly

⚠️  Test 3: Error Handling
✅ Error handling working correctly
✅ Invalid transport handling working correctly

⚡ Test 4: Performance Test
📊 Sending 100 logs for performance test...
✅ Performance test completed: 100 logs in 450ms
📈 Average: 4.50ms per log

🎉 All integration tests passed successfully!
🔍 Open http://localhost:8080 in your browser to view the logs

🛑 Stopping server...
```

## Troubleshooting

### Server Not Running
If tests fail with "TeraTrace server is not running":
- Start the server first: `go run ./cmd/tera-trace`
- Or build and run: `go build -o teratrace.exe ./cmd/tera-trace && ./teratrace.exe`
- Verify server is accessible at http://localhost:8080

### Connection Issues
If tests fail to connect:
- Verify ports 8090 (HTTP) and 8081 (WebSocket) are available
- Check that the TeraTrace server is running and accessible
- Ensure firewall allows local connections
- Try accessing http://localhost:8080 manually in a browser

### Test Timeouts
If tests timeout:
- Increase timeout values in the test scripts
- Check server logs for errors
- Verify the server is responding to requests
- Restart the server if it's unresponsive

## Manual Testing

You can also run the client manually for testing:

```javascript
const TeraTraceClient = require('tera-trace-client');

// Make sure TeraTrace server is running first
const client = new TeraTraceClient({
  service: 'manual-test',
  transport: 'http'  // or 'ws'
});

client.info('Manual test log').then(() => {
  console.log('Log sent successfully');
});
```