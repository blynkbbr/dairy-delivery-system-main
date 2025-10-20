const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeCronJobs } = require('./services/cronJobs');
const requestLogger = require('./middleware/requestLogger');
const performanceMonitor = require('./middleware/performanceMonitor');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Trust proxy (required for rate limiting and X-Forwarded-For headers)
app.set('trust proxy', 1);

// Request logging middleware (must be first)
app.use(requestLogger);

// Performance monitoring middleware
app.use(performanceMonitor);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com', 'https://admin.your-domain.com']
    : ['http://localhost:3001', 'http://localhost:19006'], // React and React Native
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/actions', require('./routes/actions'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  const userId = req.user?.id || 'anonymous';
  const { method, url, ip } = req;

  // Log the error with context
  logger.error(`Error in ${method} ${url}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method,
      url,
      ip,
      userId,
      userAgent: req.headers['user-agent'],
      body: req.body,
      query: req.query,
      params: req.params,
    },
    timestamp: new Date().toISOString(),
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: error.details
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  
  // Initialize cron jobs for automated tasks
  if (process.env.ENABLE_CRON_JOBS !== 'false') {
    initializeCronJobs();
  } else {
    console.log('⏰ Cron jobs disabled via environment variable');
  }
});

module.exports = app;