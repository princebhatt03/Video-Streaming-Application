const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },

    admin: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
      },
      adminId: { type: String, required: true },
      fullName: { type: String, required: true },
      email: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ['live', 'ended'],
      default: 'live',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },

    playbackUrl: { type: String }, // for HLS streaming (future)
    recordingUrl: { type: String }, // uploaded file (Cloudinary/S3/local)
  },
  { timestamps: true }
);

// ✅ Ensure recordingUrl is set if stream is ended
StreamSchema.pre('save', function (next) {
  if (this.status === 'ended' && !this.recordingUrl) {
    return next(new Error('Recording URL is required when stream has ended.'));
  }
  next();
});

module.exports = mongoose.model('Stream', StreamSchema);
