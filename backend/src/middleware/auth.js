const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const db = require('../utils/database');

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get fresh user data from database
    const user = await db('users')
      .where({ id: decoded.id })
      .first();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required role(s)
 * @param {...string} roles - Required roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Adds user to request if token is provided, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await db('users')
        .where({ id: decoded.id, status: 'active' })
        .first();
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = (req, res, next) => {
  // This is a simple implementation
  // In production, use Redis or similar for distributed rate limiting
  const ip = req.ip || req.connection.remoteAddress;
  const key = `auth_${ip}`;
  
  // For now, just continue - implement proper rate limiting with Redis
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  authRateLimit
};