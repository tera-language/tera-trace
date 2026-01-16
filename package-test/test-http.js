const TeraTraceClient = require('tera-trace-client');
const axios = require('axios');

async function checkServerRunning() {
  console.log('🔍 Checking if TeraTrace server is running...');
  try {
    await axios.get('http://localhost:8080', { timeout: 5000 });
    console.log('✅ TeraTrace server is running');
    return true;
  } catch (error) {
    console.log('❌ TeraTrace server is not running on http://localhost:8080');
    console.log('💡 Please start the server first: go run ./cmd/tera-trace');
    return false;
  }
}

async function testHTTPTransport() {
  console.log('🧪 Testing HTTP Transport...');

  // Check if server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    throw new Error('TeraTrace server is not running');
  }

  try {
    // Test HTTP client
    console.log('🔧 Creating HTTP client...');
    const client = new TeraTraceClient({
      service: 'test-http',
      transport: 'http'
    });

    console.log('📤 Sending test logs via HTTP...');

    // Test 1: Basic log levels
    console.log('1️⃣ Testing basic log levels...');
    await client.info('HTTP test started', {
      metadata: { testType: 'http', timestamp: Date.now() }
    });

    await client.warn('This is a warning via HTTP');

    await client.error('This is an error via HTTP', {
      traceId: 'http-test-123',
      metadata: { errorCode: 500 }
    });

    await client.debug('Debug message via HTTP', {
      metadata: { debugInfo: 'test data' }
    });

    // Test 2: Structured logging
    console.log('2️⃣ Testing structured logging...');
    await client.log({
      level: 'INFO',
      message: 'Custom log entry via HTTP',
      traceId: 'custom-trace-456',
      sessionId: 'session-789',
      metadata: {
        customField: 'customValue',
        numberField: 42,
        objectField: { nested: true }
      }
    });

    // Test 3: Batch logging
    console.log('3️⃣ Testing batch logging...');
    const batchPromises = [];
    for (let i = 1; i <= 5; i++) {
      batchPromises.push(
        client.info(`Batch HTTP log #${i}`, {
          traceId: `http-batch-${i}`,
          metadata: { batchId: i, transport: 'http' }
        })
      );
    }
    await Promise.all(batchPromises);

    console.log('✅ HTTP transport test completed successfully!');
    console.log('🔍 Check TeraTrace web interface at http://localhost:8080 to verify logs');
    console.log('📊 Sent: 4 basic logs + 1 structured log + 5 batch logs = 10 total logs');

  } catch (error) {
    console.error('❌ HTTP transport test failed:', error.message);
    console.error('💡 Possible causes:');
    console.error('   - TeraTrace server not running');
    console.error('   - HTTP port 8090 not accessible');
    console.error('   - Network connectivity issues');
    throw error;
  }
}

// Run the test
testHTTPTransport().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});