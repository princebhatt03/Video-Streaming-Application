const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const User = require('../models/user.model'); // ✅ add user model if needed

// Middleware to verify token (for both user & admin)
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');

    let account = null;

    // Check if it's an Admin
    account = await Admin.findById(decoded.id).select('-password');
    if (account) {
      req.user = { ...account._doc, role: 'admin' }; // ✅ attach admin with role
      return next();
    }

    // Else check User
    account = await User.findById(decoded.id).select('-password');
    if (account) {
      req.user = { ...account._doc, role: 'user' }; // ✅ attach user with role
      return next();
    }

    return res
      .status(401)
      .json({ success: false, message: 'Account not found' });
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// Role-based access
const requireRole = role => {
  return (req, res, next) => {
    try {
      if (!req.user || req.user.role !== role) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden: Insufficient rights' });
      }
      next();
    } catch (err) {
      console.error('Role Middleware Error:', err.message);
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
  };
};

module.exports = { auth, requireRole };
