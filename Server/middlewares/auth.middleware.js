const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model'); 

// Middleware to verify admin JWT
const verifyAdminToken = async (req, res, next) => {
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
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: 'Admin not found' });
    }

    // Attach admin info to request
    req.admin = admin;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

module.exports = verifyAdminToken;
