const express = require('express');
const LiveStream = require('../models/stream.model');
const { auth, requireRole } = require('../middlewares/auth.middleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// ---------------- Cloudinary Storage ----------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'live_stream_videos',
    resource_type: 'video',
    public_id: `recording_${Date.now()}`,
  }),
});
const upload = multer({ storage });

// ---------------- START STREAM ----------------
router.post('/start', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const admin = req.user;

    if (!admin || !admin._id)
      return res
        .status(500)
        .json({ success: false, message: 'Admin info missing' });

    const newStream = new LiveStream({
      title,
      description,
      admin: {
        id: admin._id,
        adminId: admin._id.toString(),
        fullName: admin.fullName || admin.name || 'Admin',
        email: admin.email,
      },
      status: 'live',
      startedAt: new Date(),
    });

    const savedStream = await newStream.save();

    // Emit socket event to all viewers
    const io = req.app.get('io');
    io.emit('admin:started', { streamId: savedStream._id });

    res.json({ success: true, stream: savedStream });
  } catch (err) {
    console.error('Start stream error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to start stream',
    });
  }
});

// ---------------- UPLOAD RECORDING ----------------
router.post(
  '/:id/recording',
  auth,
  requireRole('admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const stream = await LiveStream.findById(id);
      if (!stream)
        return res
          .status(404)
          .json({ success: false, message: 'Stream not found' });

      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: 'No file uploaded' });

      // Only admin who started can upload
      if (String(stream.admin.id) !== String(req.user._id))
        return res.status(403).json({ success: false, message: 'Forbidden' });

      stream.recordingUrl = req.file.path;
      await stream.save();

      res.json({ success: true, stream });
    } catch (err) {
      console.error('Upload recording error:', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

// ---------------- END STREAM ----------------
router.post('/end/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const stream = await LiveStream.findById(id);
    if (!stream)
      return res
        .status(404)
        .json({ success: false, message: 'Stream not found' });

    if (String(stream.admin.id) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Forbidden' });

    stream.status = 'ended';
    stream.endedAt = new Date();
    await stream.save();

    const io = req.app.get('io');
    io.emit('admin:ended', { streamId: stream._id });

    res.json({ success: true, stream });
  } catch (err) {
    console.error('End stream error:', err);
    res.status(500).json({ success: false, message: 'Failed to end stream' });
  }
});

// ---------------- GET LIVE STREAMS ----------------
router.get('/live', async (req, res) => {
  try {
    const streams = await LiveStream.find({ status: 'live' }).sort({
      startedAt: -1,
    });
    res.json({ success: true, streams });
  } catch (err) {
    console.error('Get live streams error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================== GET RECORDINGS ========================
router.get('/recordings', async (req, res) => {
  try {
    const streams = await LiveStream.find({ status: 'ended' }).sort({
      endedAt: -1,
    });
    res.json({ success: true, streams });
  } catch (err) {
    console.error('Get recordings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
