const axios = require('axios');
const WebSocket = require('ws');

/**
 * TeraTrace Client for sending logs to TeraTrace observability tool
 */
class TeraTraceClient {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.host - TeraTrace server host (default: 'localhost')
   * @param {number} options.httpPort - HTTP ingestion port (default: 8090)
   * @param {number} options.wsPort - WebSocket port (default: 8081)
   * @param {string} options.service - Default service name
   * @param {string} options.transport - Transport method: 'http' or 'ws' (default: 'http')
   * @param {boolean} options.autoReconnect - Auto reconnect WebSocket (default: true)
   */
  constructor(options = {}) {
    this.host = options.host || 'localhost';
    this.httpPort = options.httpPort || 8090;
    this.wsPort = options.wsPort || 8081;
    this.service = options.service || 'node-app';
    this.transport = options.transport || 'http';
    this.autoReconnect = options.autoReconnect !== false;

    this.httpUrl = `http://${this.host}:${this.httpPort}/ingest`;
    this.wsUrl = `ws://${this.host}:${this.wsPort}/ws`;

    this.wsConnection = null;
    this.wsConnected = false;
    this.wsMessageQueue = [];

    if (this.transport === 'ws') {
      this.connectWebSocket();
    }
  }

  /**
   * Send a log entry to TeraTrace
   * @param {Object} logData - Log data
   * @param {string} logData.level - Log level (INFO, WARN, ERROR, DEBUG)
   * @param {string} logData.message - Log message
   * @param {string} logData.service - Service name (optional, uses default if not provided)
   * @param {string} logData.traceId - Trace ID (optional)
   * @param {string} logData.sessionId - Session ID (optional)
   * @param {Object} logData.metadata - Additional metadata (optional)
   * @param {Date|string} logData.timestamp - Timestamp (optional, defaults to now)
   */
  async log(logData) {
    const logEntry = {
      level: logData.level || 'INFO',
      message: logData.message,
      service: logData.service || this.service,
      timestamp: logData.timestamp || new Date().toISOString(),
      ...(logData.traceId && { traceId: logData.traceId }),
      ...(logData.sessionId && { sessionId: logData.sessionId }),
      ...logData.metadata,
    };

    if (this.transport === 'ws') {
      return this.sendViaWebSocket(logEntry);
    } else {
      return this.sendViaHTTP(logEntry);
    }
  }

  /**
   * Send log via HTTP POST
   * @private
   */
  async sendViaHTTP(logEntry) {
    try {
      await axios.post(this.httpUrl, logEntry, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('TeraTrace HTTP send failed:', error.message);
      throw error;
    }
  }

  /**
   * Send log via WebSocket
   * @private
   */
  sendViaWebSocket(logEntry) {
    return new Promise((resolve, reject) => {
      if (this.wsConnected && this.wsConnection) {
        this.wsConnection.send(JSON.stringify(logEntry), (error) => {
          if (error) {
            console.error('TeraTrace WebSocket send failed:', error.message);
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        // Queue message if not connected
        this.wsMessageQueue.push({ data: logEntry, resolve, reject });

        if (!this.wsConnection) {
          this.connectWebSocket();
        }
      }
    });
  }

  /**
   * Connect to WebSocket
   * @private
   */
  connectWebSocket() {
    try {
      this.wsConnection = new WebSocket(this.wsUrl);

      this.wsConnection.on('open', () => {
        this.wsConnected = true;
        console.log('Connected to TeraTrace WebSocket');

        // Send queued messages
        while (this.wsMessageQueue.length > 0) {
          const { data, resolve, reject } = this.wsMessageQueue.shift();
          this.wsConnection.send(JSON.stringify(data), (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }
      });

      this.wsConnection.on('error', (error) => {
        console.error('TeraTrace WebSocket error:', error.message);
        this.wsConnected = false;
      });

      this.wsConnection.on('close', () => {
        this.wsConnected = false;
        console.log('Disconnected from TeraTrace WebSocket');

        if (this.autoReconnect) {
          setTimeout(() => this.connectWebSocket(), 5000);
        }
      });

      this.wsConnection.on('message', (_data) => {
        // Handle incoming messages if needed
        try {
          // const message = JSON.parse(_data.toString());
          // Could emit events for incoming logs if needed
        } catch (e) {
          // Ignore parsing errors for incoming messages
        }
      });
    } catch (error) {
      console.error('Failed to connect to TeraTrace WebSocket:', error.message);
      this.wsConnected = false;

      if (this.autoReconnect) {
        setTimeout(() => this.connectWebSocket(), 5000);
      }
    }
  }

  /**
   * Close WebSocket connection
   */
  close() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }

  /**
   * Convenience methods for different log levels
   */
  info(message, options = {}) {
    return this.log({ level: 'INFO', message, ...options });
  }

  warn(message, options = {}) {
    return this.log({ level: 'WARN', message, ...options });
  }

  error(message, options = {}) {
    return this.log({ level: 'ERROR', message, ...options });
  }

  debug(message, options = {}) {
    return this.log({ level: 'DEBUG', message, ...options });
  }
}

module.exports = TeraTraceClient;
