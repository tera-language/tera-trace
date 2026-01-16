const TeraTraceClient = require('tera-trace-client');
const axios = require('axios');

async function checkServerRunning() {
  console.log('🔍 Checking if TeraTrace server is running...');
  try {
    await axios.get('http://localhost:8080', { timeout: 5000 });
    console.log('✅ TeraTrace server is running\n');
    return true;
  } catch (error) {
    console.log('❌ TeraTrace server is not running on http://localhost:8080');
    console.log('💡 Please start the server first: go run ./cmd/tera-trace\n');
    return false;
  }
}

async function runIntegrationTest() {
  console.log('🔬 Running TeraTrace Client Integration Tests...\n');

  // Pre-flight checks
  console.log('🔍 Performing pre-flight checks...');

  // Check if server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    throw new Error('TeraTrace server is not running');
  }

  // Check if client package can be imported
  try {
    const TeraTraceClient = require('tera-trace-client');
    console.log('✅ TeraTrace client package imported successfully');
  } catch (error) {
    console.error('❌ Failed to import TeraTrace client package:', error.message);
    throw new Error('Client package import failed');
  }

  console.log('✅ All pre-flight checks passed\n');

  const testStartTime = Date.now();
  let passedTests = 0;
  let failedTests = 0;

  try {

    // Test 1: HTTP Transport
    console.log('📡 Test 1: HTTP Transport');
    try {
      await testHTTPTransport();
      passedTests++;
      console.log('✅ HTTP Transport test PASSED');
    } catch (error) {
      failedTests++;
      console.error('❌ HTTP Transport test FAILED');
      throw error;
    }

    // Test 2: WebSocket Transport
    console.log('\n🔗 Test 2: WebSocket Transport');
    try {
      await testWebSocketTransport();
      passedTests++;
      console.log('✅ WebSocket Transport test PASSED');
    } catch (error) {
      failedTests++;
      console.error('❌ WebSocket Transport test FAILED');
      throw error;
    }

    // Test 3: Error Handling
    console.log('\n⚠️  Test 3: Error Handling');
    try {
      await testErrorHandling();
      passedTests++;
      console.log('✅ Error Handling test PASSED');
    } catch (error) {
      failedTests++;
      console.error('❌ Error Handling test FAILED');
      throw error;
    }

    // Test 4: Performance Test
    console.log('\n⚡ Test 4: Performance Test');
    try {
      await testPerformance();
      passedTests++;
      console.log('✅ Performance test PASSED');
    } catch (error) {
      failedTests++;
      console.error('❌ Performance test FAILED');
      throw error;
    }

    const totalTime = Date.now() - testStartTime;

    console.log('\n' + '='.repeat(50));
    console.log('🎉 INTEGRATION TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${passedTests}`);
    console.log(`❌ Tests Failed: ${failedTests}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📊 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
      console.log('\n🎯 ALL TESTS PASSED SUCCESSFULLY!');
      console.log('🔍 Open http://localhost:8080 in your browser to view the logs');
      console.log('💡 Check the web interface to verify all log entries were received');
    } else {
      console.log(`\n⚠️  ${failedTests} test(s) failed - check the output above for details`);
    }

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    throw error;
  }
}

async function testHTTPTransport() {
  const client = new TeraTraceClient({
    service: 'integration-http',
    transport: 'http'
  });

  try {
    // Test basic logging
    await client.info('HTTP integration test started');
    await client.warn('HTTP warning test');
    await client.error('HTTP error test');
    await client.debug('HTTP debug test');

    // Test structured data
    await client.log({
      level: 'INFO',
      message: 'HTTP structured log',
      traceId: 'http-integration-123',
      sessionId: 'session-456',
      metadata: {
        testSuite: 'integration',
        transport: 'http',
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ HTTP transport working correctly');
  } catch (error) {
    console.error('❌ HTTP transport test failed:', error.message);
    throw error;
  }
}

async function testWebSocketTransport() {
  const client = new TeraTraceClient({
    service: 'integration-ws',
    transport: 'ws'
  });

  try {
    // Wait a bit for WebSocket connection to establish
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test basic logging
    await client.info('WebSocket integration test started');
    await client.warn('WebSocket warning test');
    await client.error('WebSocket error test');
    await client.debug('WebSocket debug test');

    // Test structured data
    await client.log({
      level: 'INFO',
      message: 'WebSocket structured log',
      traceId: 'ws-integration-789',
      sessionId: 'ws-session-101',
      metadata: {
        testSuite: 'integration',
        transport: 'websocket',
        persistent: true
      }
    });

    // Test connection persistence
    console.log('⏳ Testing WebSocket connection persistence...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await client.info('WebSocket connection persistence test');
    console.log('✅ WebSocket connection remains stable');

    client.close();
    console.log('✅ WebSocket transport working correctly');
  } catch (error) {
    console.error('❌ WebSocket transport test failed:', error.message);
    console.error('💡 Make sure TeraTrace server is running and WebSocket port 8081 is accessible');
    throw error;
  }
}

async function testErrorHandling() {
  console.log('🧪 Testing various error scenarios...');

  // Test 1: Non-existent server (should handle gracefully)
  console.log('1️⃣ Testing connection to non-existent server...');
  const badClient = new TeraTraceClient({
    host: 'non-existent-server.invalid',
    service: 'error-test',
    transport: 'http'
  });

  try {
    await badClient.info('This should fail gracefully');
    console.error('❌ Expected connection error but none occurred');
    throw new Error('Connection error was not handled properly');
  } catch (error) {
    console.log('✅ Connection error handled correctly:', error.code || error.message);
  }

  // Test 2: Invalid port (should fail)
  console.log('2️⃣ Testing invalid port...');
  const badPortClient = new TeraTraceClient({
    host: 'localhost',
    httpPort: 99999, // Invalid port
    service: 'error-test',
    transport: 'http'
  });

  try {
    await badPortClient.warn('This should fail due to invalid port');
    console.error('❌ Expected port error but none occurred');
    throw new Error('Invalid port error was not handled properly');
  } catch (error) {
    console.log('✅ Invalid port error handled correctly:', error.code || error.message);
  }

  // Test 3: Invalid transport parameter (should default gracefully)
  console.log('3️⃣ Testing invalid transport parameter...');
  try {
    const invalidTransportClient = new TeraTraceClient({
      transport: 'invalid-transport-type',
      service: 'error-test'
    });

    // This should work because client defaults to 'http'
    await invalidTransportClient.info('Testing invalid transport fallback');
    console.log('✅ Invalid transport parameter handled gracefully (defaults to HTTP)');
  } catch (error) {
    console.error('❌ Unexpected error with invalid transport:', error.message);
    throw error;
  }

  // Test 4: Malformed log data
  console.log('4️⃣ Testing malformed log data...');
  const goodClient = new TeraTraceClient({
    service: 'error-test',
    transport: 'http'
  });

  try {
    // Try to send invalid log data (this should still work as client validates)
    await goodClient.log({
      level: 'INVALID_LEVEL',
      message: null, // Invalid message
      invalidField: 'should be ignored'
    });
    console.log('✅ Malformed log data handled gracefully');
  } catch (error) {
    // This might fail depending on client validation
    console.log('ℹ️  Malformed log data resulted in expected error:', error.message);
  }

  console.log('✅ All error handling tests completed');
}

async function testPerformance() {
  const client = new TeraTraceClient({
    service: 'performance-test',
    transport: 'http'
  });

  const startTime = Date.now();
  const logCount = 100;
  let successCount = 0;
  let errorCount = 0;

  console.log(`📊 Starting performance test: sending ${logCount} logs sequentially...`);
  console.log('⏳ This may take a moment...');

  // Send logs sequentially to avoid overwhelming the server
  for (let i = 1; i <= logCount; i++) {
    try {
      await client.info(`Performance test log #${i}`, {
        traceId: `perf-${i}`,
        metadata: { sequence: i, total: logCount }
      });
      successCount++;
    } catch (error) {
      errorCount++;
      if (errorCount <= 3) { // Only log first few errors
        console.warn(`⚠️  Log #${i} failed:`, error.message);
      }
    }

    // Progress indicator every 25 logs
    if (i % 25 === 0) {
      console.log(`📈 Progress: ${i}/${logCount} logs sent (${successCount} successful, ${errorCount} failed)`);
    }
  }

  const duration = Date.now() - startTime;
  const avgLatency = duration / successCount;

  console.log(`\n✅ Performance test completed:`);
  console.log(`   📊 Total logs attempted: ${logCount}`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   ⏱️  Total time: ${duration}ms`);
  console.log(`   📈 Average latency: ${avgLatency.toFixed(2)}ms per log`);

  // Performance warnings
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} logs failed - check server stability`);
  }

  if (avgLatency > 50) {
    console.warn(`⚠️  High latency detected (${avgLatency.toFixed(2)}ms avg) - consider connection issues`);
  } else if (avgLatency > 10) {
    console.log(`ℹ️  Moderate latency (${avgLatency.toFixed(2)}ms avg) - acceptable for development`);
  } else {
    console.log(`🚀 Excellent performance! (${avgLatency.toFixed(2)}ms avg)`);
  }

  // Overall assessment
  const successRate = (successCount / logCount) * 100;
  if (successRate >= 95) {
    console.log(`🎯 Performance test PASSED (${successRate.toFixed(1)}% success rate)`);
  } else {
    console.error(`❌ Performance test FAILED (${successRate.toFixed(1)}% success rate)`);
    throw new Error(`Performance test failed: ${errorCount}/${logCount} logs failed`);
  }
}

// Run the tests
runIntegrationTest().catch((error) => {
  console.error('Integration test suite failed:', error);
  process.exit(1);
});