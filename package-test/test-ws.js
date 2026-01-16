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

async function testWebSocketTransport() {
  console.log('🧪 Testing WebSocket Transport...');

  // Check if server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    throw new Error('TeraTrace server is not running');
  }

  try {
    // Test WebSocket client
    console.log('🔧 Creating WebSocket client...');
    const client = new TeraTraceClient({
      service: 'test-websocket',
      transport: 'ws'
    });

    // Wait for WebSocket connection to establish
    console.log('⏳ Waiting for WebSocket connection...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📤 Sending test logs via WebSocket...');

    // Test 1: Basic log levels
    console.log('1️⃣ Testing basic log levels...');
    await client.info('WebSocket test started', {
      metadata: { testType: 'websocket', timestamp: Date.now() }
    });

    await client.warn('This is a warning via WebSocket');

    await client.error('This is an error via WebSocket', {
      traceId: 'ws-test-123',
      metadata: { errorCode: 404 }
    });

    await client.debug('Debug message via WebSocket', {
      metadata: { debugInfo: 'websocket test data' }
    });

    // Test 2: Structured logging
    console.log('2️⃣ Testing structured logging...');
    await client.log({
      level: 'INFO',
      message: 'Custom log entry via WebSocket',
      traceId: 'custom-ws-trace-456',
      sessionId: 'ws-session-789',
      metadata: {
        transport: 'websocket',
        persistent: true,
        numberField: 1337
      }
    });

    // Test 3: Batch sending (WebSocket should handle this efficiently)
    console.log('3️⃣ Testing batch sending...');
    const promises = [];
    for (let i = 1; i <= 5; i++) {
      promises.push(client.info(`Batch WebSocket log #${i}`, {
        traceId: `ws-batch-${i}`,
        metadata: { batchId: i, transport: 'websocket' }
      }));
    }
    await Promise.all(promises);

    // Test 4: Connection persistence
    console.log('4️⃣ Testing connection persistence...');
    await new Promise(resolve => setTimeout(resolve, 500));
    await client.info('Connection persistence test', {
      metadata: { persistenceTest: true }
    });

    console.log('✅ WebSocket transport test completed successfully!');
    console.log('🔍 Check TeraTrace web interface at http://localhost:8080 to verify logs');
    console.log('📊 Sent: 4 basic logs + 1 structured log + 5 batch logs + 1 persistence log = 11 total logs');

    // Close WebSocket connection
    console.log('🔌 Closing WebSocket connection...');
    client.close();

  } catch (error) {
    console.error('❌ WebSocket transport test failed:', error.message);
    console.error('💡 Possible causes:');
    console.error('   - TeraTrace server not running');
    console.error('   - WebSocket port 8081 not accessible');
    console.error('   - WebSocket connection timeout');
    console.error('   - Server WebSocket endpoint not responding');
    throw error;
  }
}

// Run the test
testWebSocketTransport().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});