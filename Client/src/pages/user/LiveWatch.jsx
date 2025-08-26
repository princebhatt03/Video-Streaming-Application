import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimplePeer from 'simple-peer';
import { toast } from 'react-hot-toast';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

const LiveWatch = ({ socket }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ Extract streamId from URL
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const [liveStreamId, setLiveStreamId] = useState(null);

  useEffect(() => {
    if (!socket) return;
    if (!id) {
      toast.error('Invalid stream ID');
      navigate('/user-home');
      return;
    }

    setLiveStreamId(id);

    // --- Create SimplePeer for viewer ---
    const peer = new SimplePeer({ initiator: false, trickle: false });
    peerRef.current = peer;

    // Send viewer signal to admin
    peer.on('signal', signal => {
      socket.emit('signal:viewer-to-admin', {
        viewerId: socket.id,
        streamId: id,
        signal,
      });
    });

    // Receive remote stream from admin
    peer.on('stream', remoteStream => {
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
        videoRef.current.play().catch(() => console.warn('Autoplay blocked'));
        toast.success('Connected to live stream 🎥');
      }
    });

    peer.on('error', err => console.error('Peer error:', err));

    // --- Notify admin that viewer joined ---
    socket.emit('viewer:join', { viewerId: socket.id, streamId: id });
    console.log('👀 Viewer joined stream:', id);

    // --- Listen for signals from admin ---
    const handleSignalFromAdmin = ({ streamId: sid, signal }) => {
      if (peerRef.current && sid === id) {
        peerRef.current.signal(signal);
      }
    };
    socket.on('signal:admin-to-viewer', handleSignalFromAdmin);

    // --- Listen for admin ending stream ---
    const handleAdminEnded = ({ streamId: sid }) => {
      if (sid === id) {
        toast('Live stream has ended');
        peerRef.current?.destroy();
        peerRef.current = null;
        setLiveStreamId(null);
        navigate('/user-home');
      }
    };
    socket.on('admin:ended', handleAdminEnded);

    // --- Cleanup on unmount ---
    return () => {
      peerRef.current?.destroy();
      peerRef.current = null;
      socket.off('signal:admin-to-viewer', handleSignalFromAdmin);
      socket.off('admin:ended', handleAdminEnded);
    };
  }, [socket, id, navigate]);

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <span>Watching Live</span>
        <button
          className="bg-red-600 px-3 py-1 rounded"
          onClick={() => navigate('/user-home')}>
          Back
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {!liveStreamId ? (
          <p className="text-white text-center mt-20">
            No live stream currently. Waiting for admin...
          </p>
        ) : (
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black rounded-lg"
            playsInline
            autoPlay
            controls
          />
        )}
      </main>
    </div>
  );
};

export default LiveWatch;
