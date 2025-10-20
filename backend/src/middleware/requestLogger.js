const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'] || '';
  const userId = req.user?.id || 'anonymous';

  // Log incoming request
  logger.http(`Incoming ${method} ${url}`, {
    method,
    url,
    ip,
    userAgent,
    userId,
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Log response
    logger.http(`Response ${method} ${url} - ${statusCode}`, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userId,
      timestamp: new Date().toISOString(),
      contentLength: res.get('Content-Length') || (chunk ? chunk.length : 0),
    });

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;