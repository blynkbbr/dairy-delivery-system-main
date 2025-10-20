const logger = require('../utils/logger');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Override res.end to capture performance metrics
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const end = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    const { method, url, ip } = req;
    const userId = req.user?.id || 'anonymous';
    const statusCode = res.statusCode;

    // Log performance metrics for slow requests (>500ms) or errors
    if (duration > 500 || statusCode >= 400) {
      logger.warn(`Performance: ${method} ${url} - ${statusCode}`, {
        method,
        url,
        statusCode,
        duration: `${duration.toFixed(2)}ms`,
        memoryDelta,
        ip,
        userId,
        timestamp: new Date().toISOString(),
        performance: {
          duration,
          memoryDelta,
          heapUsed: endMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
        }
      });
    }

    // Log all requests with basic performance info
    logger.info(`Performance: ${method} ${url} - ${statusCode} (${duration.toFixed(2)}ms)`, {
      method,
      url,
      statusCode,
      duration: `${duration.toFixed(2)}ms`,
      ip,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = performanceMonitor;