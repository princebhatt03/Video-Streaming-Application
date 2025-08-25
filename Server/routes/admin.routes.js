const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// Helper: generate JWT for admin
const generateToken = admin =>
  jwt.sign(
    { id: admin._id, email: admin.email, roles: admin.roles },
    process.env.JWT_SECRET || 'mysecretkey',
    { expiresIn: '7d' }
  );

// REGISTER ADMIN
router.post('/register', async (req, res) => {
  try {
    const { adminId, fullName, email, password } = req.body;
    if (!adminId || !fullName || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });

    const existing = await Admin.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });

    const admin = new Admin({ adminId, fullName, email, password });
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: { id: admin._id, adminId, fullName, email },
    });
  } catch (err) {
    console.error('Admin Register Error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors)
        .map(e => e.message)
        .join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// LOGIN ADMIN
// ========================
router.post('/login', async (req, res) => {
  try {
    const { adminId, email, password } = req.body;
    if (!adminId || !email || !password)
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });

    // Find admin by adminId AND email
    const admin = await Admin.findOne({ adminId, email }).select('+password');
    if (!admin)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });

    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        fullName: admin.fullName,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET ADMIN PROFILE
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    res.status(200).json({ success: true, admin });
  } catch (err) {
    console.error('Get Admin Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * LIVE STREAM ROUTES
 * You can expand these with actual streaming logic (Socket.IO or Cloud storage)
 */

// START LIVE STREAM
router.post('/live/start', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    // TODO: implement live stream logic
    // Example: store in DB or notify Socket.IO clients
    res.status(200).json({
      success: true,
      message: 'Live stream started',
      data: { title, description },
    });
  } catch (err) {
    console.error('Start Live Stream Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// END LIVE STREAM
router.post('/live/end', authMiddleware, async (req, res) => {
  try {
    const { streamId } = req.body;
    // TODO: implement stop logic & save recording to cloud
    res.status(200).json({
      success: true,
      message: 'Live stream ended',
      data: { streamId },
    });
  } catch (err) {
    console.error('End Live Stream Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
