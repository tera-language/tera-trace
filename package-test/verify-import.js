// Simple test to verify the client package can be imported
const TeraTraceClient = require('tera-trace-client');

console.log('✅ Successfully imported TeraTraceClient');

const client = new TeraTraceClient({
  service: 'import-test'
});

console.log('✅ Successfully created client instance');
console.log('Client config:', {
  host: client.host,
  httpPort: client.httpPort,
  wsPort: client.wsPort,
  service: client.service,
  transport: client.transport
});

console.log('✅ Package test setup complete!');