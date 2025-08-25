const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const router = express.Router();

// Helper: generate JWT
const generateToken = user =>
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'mysecretkey',
    { expiresIn: '7d' }
  );

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = new User({ username, name, email, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register Error:', err);

    // Check for Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors)
        .map(e => e.message)
        .join(', ');
      return res.status(400).json({ success: false, message: messages });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
