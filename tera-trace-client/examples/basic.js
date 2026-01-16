const TeraTraceClient = require('../index');

// Example: Basic logging
async function basicExample() {
  console.log('=== Basic Logging Example ===');

  const tracer = new TeraTraceClient({
    service: 'example-app',
    transport: 'http', // Use HTTP transport
  });

  try {
    // Send different types of logs
    await tracer.info('Application started successfully');
    await tracer.warn('This is a warning message');
    await tracer.error('This is an error message');
    await tracer.debug('Debug information', {
      metadata: { debugData: 'some debug info' },
    });

    // Send custom log with trace ID
    await tracer.log({
      level: 'INFO',
      message: 'Custom log with trace ID',
      traceId: 'trace-12345',
      sessionId: 'session-abc',
      metadata: {
        userId: 123,
        action: 'login',
        ip: '192.168.1.1',
      },
    });

    console.log('All logs sent successfully!');
  } catch (error) {
    console.error('Failed to send logs:', error.message);
  }
}

// Example: Express.js integration
function expressExample() {
  console.log('=== Express.js Integration Example ===');

  const tracer = new TeraTraceClient({
    service: 'express-example',
    transport: 'http',
  });

  // Simulate Express middleware
  const simulateRequest = async (method, url, traceId) => {
    const startTime = Date.now();

    await tracer.info(`Incoming ${method} ${url}`, {
      traceId,
      metadata: { method, url },
    });

    // Simulate some processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    const duration = Date.now() - startTime;
    await tracer.info(`Request completed`, {
      traceId,
      metadata: { duration, statusCode: 200 },
    });
  };

  // Simulate some requests
  setTimeout(() => simulateRequest('GET', '/api/users', 'req-1'), 0);
  setTimeout(() => simulateRequest('POST', '/api/users', 'req-2'), 200);
  setTimeout(() => simulateRequest('GET', '/api/orders', 'req-3'), 400);
}

// Run examples
async function main() {
  console.log('TeraTrace Client Examples');
  console.log('Make sure TeraTrace server is running on localhost:8090\n');

  await basicExample();
  console.log('');

  expressExample();

  // Keep the process running briefly to see WebSocket example if enabled
  setTimeout(() => {
    console.log('\nExamples completed!');
    process.exit(0);
  }, 1000);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

main();
