const logger = require('./logger');

/**
 * Log user actions for auditing and tracking
 * @param {string} action - The action performed (e.g., 'profile_update', 'address_add')
 * @param {Object} details - Additional details about the action
 * @param {Object} req - Express request object (optional)
 */
const logUserAction = (action, details = {}, req = null) => {
  const userId = req?.user?.id || details.userId || 'anonymous';
  const ip = req?.ip || details.ip || 'unknown';
  const userAgent = req?.headers?.['user-agent'] || details.userAgent || 'unknown';

  logger.info(`User Action: ${action}`, {
    action,
    userId,
    ip,
    userAgent,
    details,
    timestamp: new Date().toISOString(),
    route: req ? `${req.method} ${req.originalUrl}` : 'unknown',
  });
};

/**
 * Log admin actions for security auditing
 * @param {string} action - The admin action performed
 * @param {Object} details - Additional details about the action
 * @param {Object} req - Express request object
 */
const logAdminAction = (action, details = {}, req) => {
  const adminId = req?.user?.id || 'unknown';
  const ip = req?.ip || 'unknown';
  const userAgent = req?.headers?.['user-agent'] || 'unknown';

  logger.warn(`Admin Action: ${action}`, {
    action,
    adminId,
    ip,
    userAgent,
    details,
    timestamp: new Date().toISOString(),
    route: req ? `${req.method} ${req.originalUrl}` : 'unknown',
  });
};

/**
 * Log business events (orders, payments, etc.)
 * @param {string} event - The business event
 * @param {Object} details - Event details
 * @param {Object} req - Express request object (optional)
 */
const logBusinessEvent = (event, details = {}, req = null) => {
  const userId = req?.user?.id || details.userId || 'system';
  const ip = req?.ip || details.ip || 'system';

  logger.info(`Business Event: ${event}`, {
    event,
    userId,
    ip,
    details,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logUserAction,
  logAdminAction,
  logBusinessEvent,
};