import { useEffect } from 'react';
import toast from 'react-hot-toast';
import socket from '../src/socket';

function StreamListener() {
  useEffect(() => {
    // 🔌 Connection
    socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', socket.id);
      toast.success('Connected to live server ⚡');
    });

    socket.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason);
      toast.error('Disconnected from live server ❌');
    });

    socket.on('connect_error', err => {
      console.error('⚠️ Socket connection error:', err.message);
      toast.error('Connection error: ' + err.message);
    });

    // 🔴 Admin starts stream
    socket.on('admin:started', data => {
      console.log('🔴 Stream started:', data);
    //   toast.success(`🔴 Live Stream Started: ${data.title}`);
    });

    // ⚪ Admin ends stream
    socket.on('admin:ended', data => {
      console.log('⚪ Stream ended:', data);
    //   toast(`⚪ Stream Ended: ${data.title}`, { icon: '🛑' });
    });

    // 🧹 Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('admin:started');
      socket.off('admin:ended');
    };
  }, []);

  return null; // no UI, just a listener
}

export default StreamListener;
