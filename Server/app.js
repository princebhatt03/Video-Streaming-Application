require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require('./db/db');

// Routes
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const streamRoutes = require('./routes/stream.routes');

// ---------------- DB Connection ----------------
connectToDb();

// ---------------- Express App ----------------
const app = express();
const server = http.createServer(app);

// ---------------- Socket.IO ----------------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Attach io to app for route access if needed
app.set('io', io);

io.on('connection', socket => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // ---------------- Admin joins a stream ----------------
  socket.on('admin:join', ({ streamId }) => {
    socket.join(`stream:${streamId}`);
    socket.data.role = 'admin';
    socket.data.streamId = streamId;
    console.log(`👨‍💻 Admin joined stream:${streamId}`);
  });

  // ---------------- Viewer joins a stream ----------------
  socket.on('viewer:join', ({ streamId }) => {
    socket.join(`stream:${streamId}`);
    socket.data.role = 'viewer';
    socket.data.streamId = streamId;
    console.log(`👀 Viewer joined stream:${streamId}`);

    // Notify admin that a viewer joined
    socket.to(`stream:${streamId}`).emit('viewer:joined', {
      viewerId: socket.id,
    });
  });

  // ---------------- WebRTC signaling ----------------
  socket.on('signal:admin-to-viewer', ({ viewerId, signal }) => {
    io.to(viewerId).emit('signal:from-admin', { signal });
  });

  socket.on('signal:viewer-to-admin', ({ streamId, signal }) => {
    socket.to(`stream:${streamId}`).emit('signal:from-viewer', {
      viewerId: socket.id,
      signal,
    });
  });

  // ---------------- Handle leave ----------------
  socket.on('leave-stream', () => {
    const streamId = socket.data.streamId;
    if (streamId) {
      socket.leave(`stream:${streamId}`);
      console.log(`🚪 ${socket.data.role} left stream:${streamId}`);

      // If viewer leaves, notify admin
      if (socket.data.role === 'viewer') {
        socket.to(`stream:${streamId}`).emit('viewer:left', {
          viewerId: socket.id,
        });
      }
    }
  });

  // ---------------- Handle disconnect ----------------
  socket.on('disconnect', () => {
    const streamId = socket.data.streamId;
    console.log(
      `❌ Disconnected: ${socket.id} (${socket.data.role || 'unknown'})`
    );

    if (streamId) {
      if (socket.data.role === 'admin') {
        // Notify viewers that admin disconnected
        socket.to(`stream:${streamId}`).emit('admin:disconnected');
      } else if (socket.data.role === 'viewer') {
        // Notify admin that viewer left
        socket.to(`stream:${streamId}`).emit('viewer:left', {
          viewerId: socket.id,
        });
      }
    }
  });
});

// ---------------- Middleware ----------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONNECT,
      ttl: 14 * 24 * 60 * 60, // Session TTL = 14 days
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// ---------------- Routes ----------------
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/streams', streamRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running 🚀' });
});

// ---------------- Exports ----------------
module.exports = { app, server, io };
