// Test server connectivity check
const axios = require('axios');

async function checkServerRunning() {
  console.log('🔍 Testing server connectivity check...');
  try {
    await axios.get('http://localhost:8080', { timeout: 5000 });
    console.log('✅ Server connectivity check passed');
    return true;
  } catch (error) {
    console.log('❌ Server connectivity check failed (expected if server not running):', error.code);
    return false;
  }
}

checkServerRunning();