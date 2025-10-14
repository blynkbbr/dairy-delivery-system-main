const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.status
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
    issuer: 'dairy-delivery-system',
    audience: 'dairy-app'
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'dairy-delivery-system',
      audience: 'dairy-app'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};