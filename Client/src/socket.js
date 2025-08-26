// src/socket.js
import { io } from 'socket.io-client';

// Use environment variable or fallback
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Initialize socket instance
const socket = io(SOCKET_URL, {
  transports: ['websocket'], // use WebSocket only
  withCredentials: true, // allow cookies/credentials if needed
  reconnection: true, // enable auto reconnect
  reconnectionAttempts: 5, // retry max 5 times
  reconnectionDelay: 2000, // wait 2s before retry
});

// 🔌 Connection Events
socket.on('connect', () => {
  console.log(`✅ Connected to socket server: ${socket.id}`);
});

socket.on('disconnect', reason => {
  console.log(`❌ Disconnected from socket server. Reason: ${reason}`);
});

socket.on('connect_error', err => {
  console.error('⚠️ Socket connection error:', err.message);
});

// 🔔 Custom Server Event Example
socket.on('server-message', data => {
  console.log('📩 Message from server:', data);
});

export default socket;
