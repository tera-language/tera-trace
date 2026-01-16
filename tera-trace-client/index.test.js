const TeraTraceClient = require('./index');

describe('TeraTraceClient', () => {
  let client;

  beforeEach(() => {
    client = new TeraTraceClient({
      host: 'localhost',
      httpPort: 8090,
      service: 'test-service',
    });
  });

  afterEach(() => {
    client.close();
  });

  test('should create client with default options', () => {
    const defaultClient = new TeraTraceClient();
    expect(defaultClient.host).toBe('localhost');
    expect(defaultClient.httpPort).toBe(8090);
    expect(defaultClient.service).toBe('node-app');
    expect(defaultClient.transport).toBe('http');
  });

  test('should create client with custom options', () => {
    expect(client.host).toBe('localhost');
    expect(client.httpPort).toBe(8090);
    expect(client.service).toBe('test-service');
  });

  test('should format log entry correctly', async () => {
    const mockAxios = jest.spyOn(require('axios'), 'post');
    mockAxios.mockResolvedValue({ status: 200 });

    const timestamp = new Date().toISOString();
    await client.log({
      level: 'INFO',
      message: 'Test message',
      timestamp: timestamp,
      traceId: 'test-trace',
      metadata: { key: 'value' },
    });

    expect(mockAxios).toHaveBeenCalledWith(
      'http://localhost:8090/ingest',
      {
        level: 'INFO',
        message: 'Test message',
        service: 'test-service',
        timestamp: timestamp,
        traceId: 'test-trace',
        key: 'value',
      },
      expect.any(Object)
    );

    mockAxios.mockRestore();
  });

  test('should use convenience methods', async () => {
    const mockAxios = jest.spyOn(require('axios'), 'post');
    mockAxios.mockResolvedValue({ status: 200 });

    await client.info('Info message');
    await client.warn('Warning message');
    await client.error('Error message');
    await client.debug('Debug message');

    expect(mockAxios).toHaveBeenCalledTimes(4);
    mockAxios.mockRestore();
  });
});
