const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const LiveStream = require('../models/stream.model'); 
const { auth, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Helper: generate JWT for admin
const generateToken = admin =>
  jwt.sign(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET || 'mysecretkey',
    { expiresIn: '7d' }
  );

// ========================
// REGISTER ADMIN
// ========================
router.post('/register', async (req, res) => {
  try {
    const { adminId, fullName, email, password } = req.body;
    if (!adminId || !fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }

    const admin = new Admin({ adminId, fullName, email, password });
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: { id: admin._id, adminId, fullName, email },
    });
  } catch (err) {
    console.error('Admin Register Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// LOGIN ADMIN
// ========================
router.post('/login', async (req, res) => {
  try {
    const { adminId, email, password } = req.body;
    if (!adminId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const admin = await Admin.findOne({ adminId, email }).select('+password');
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

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

// ========================
// GET ADMIN PROFILE
// ========================
router.get('/me', auth, requireRole('admin'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, admin });
  } catch (err) {
    console.error('Get Admin Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// LIVE STREAM ROUTES
// ========================

// START LIVE STREAM
router.post('/live/start', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, description } = req.body;

    const stream = new LiveStream({
      admin: req.user.id,
      title,
      description,
      isLive: true,
    });
    await stream.save();

    // 🔔 Notify via Socket.IO (optional)
    req.app.get('io').emit('live-started', {
      streamId: stream._id,
      admin: req.user.fullName,
      title,
    });

    res.status(200).json({
      success: true,
      message: 'Live stream started',
      stream,
    });
  } catch (err) {
    console.error('Start Live Stream Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// END LIVE STREAM
router.post('/live/end', auth, requireRole('admin'), async (req, res) => {
  try {
    const { streamId } = req.body;

    const stream = await LiveStream.findById(streamId);
    if (!stream) {
      return res
        .status(404)
        .json({ success: false, message: 'Stream not found' });
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    await stream.save();

    // 🔔 Notify users
    req.app.get('io').emit('live-ended', {
      streamId: stream._id,
      admin: req.user.fullName,
    });

    res.status(200).json({
      success: true,
      message: 'Live stream ended & saved as recording',
      stream,
    });
  } catch (err) {
    console.error('End Live Stream Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
