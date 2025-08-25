import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import SimplePeer from 'simple-peer';
import AdminHeader from '../../components/admin/Header';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const AdminDashboard = ({ socket }) => {
  const admin = JSON.parse(localStorage.getItem('adminInfo') || 'null');
  const token = localStorage.getItem('adminToken');

  const [streamDoc, setStreamDoc] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const peersRef = useRef({});

  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const viewerJoinedHandlerRef = useRef(null);
  const signalViewerHandlerRef = useRef(null);

  useEffect(() => {
    if (!admin || !token) toast.error('Please login as admin');

    return () => {
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(p => p.destroy());
      peersRef.current = {};

      if (socket) {
        viewerJoinedHandlerRef.current &&
          socket.off('viewer:joined', viewerJoinedHandlerRef.current);
        signalViewerHandlerRef.current &&
          socket.off('signal:viewer-to-admin', signalViewerHandlerRef.current);
      }

      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
  }, []);

  // ------------------- START CAMERA & MIC -------------------
  const startMedia = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = ms;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = ms;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }
    } catch {
      toast.error('Camera/microphone access denied');
      throw new Error('Media access denied');
    }
  };

  // ------------------- RECORDING -------------------
  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType))
      mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstart = () => toast.success('Recording started');
      recorder.onerror = e => toast.error('Recording error');

      recorder.start(1000);
    } catch (err) {
      toast.error('Could not start recording');
      console.error(err);
    }
  };

  const stopRecordingAndUpload = async streamId => {
    if (!recorderRef.current) return null;

    return new Promise(resolve => {
      recorderRef.current.onstop = async () => {
        if (recordedChunksRef.current.length === 0) return resolve(null);
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        });
        const form = new FormData();
        form.append('file', blob, `recording_${Date.now()}.webm`);

        try {
          const { data } = await api.post(
            `/api/streams/${streamId}/recording`,
            form,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Recording saved');
          resolve(data);
        } catch (err) {
          toast.error('Failed to upload recording');
          console.error(err);
          resolve(null);
        }
      };

      try {
        recorderRef.current.stop();
      } catch {
        resolve(null);
      }
    });
  };

  // ------------------- START STREAM -------------------
  const startStream = async () => {
    if (!token) return toast.error('Not authorized');
    if (!title.trim()) return toast.error('Title required');

    try {
      const { data } = await api.post(
        '/api/streams/start',
        { title, description: desc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) return toast.error(data.message || 'Failed to start');

      const s = data.stream;
      setStreamDoc(s);
      setIsLive(true);

      await startMedia();

      socket.emit('admin:join', { streamId: s._id });
      socket.emit('admin:started', { streamId: s._id, title: s.title });

      // ------------------- HANDLE VIEWERS -------------------
      const onViewerJoined = ({ viewerId }) => {
        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: mediaStreamRef.current,
        });
        peersRef.current[viewerId] = peer;

        peer.on('signal', signal =>
          socket.emit('signal:admin-to-viewer', { viewerId, signal })
        );
        peer.on('error', err => console.error('Peer error:', err));
        peer.on('close', () => delete peersRef.current[viewerId]);
      };
      viewerJoinedHandlerRef.current = onViewerJoined;
      socket.on('viewer:joined', onViewerJoined);

      const onSignalViewer = ({ viewerId, signal }) => {
        const peer = peersRef.current[viewerId];
        if (peer) peer.signal(signal);
      };
      signalViewerHandlerRef.current = onSignalViewer;
      socket.on('signal:viewer-to-admin', onSignalViewer);

      startRecording();
      toast.success('Live stream started');
    } catch (err) {
      toast.error('Failed to start stream');
      console.error('Start stream failed:', err);
    }
  };

  // ------------------- END STREAM -------------------
  const endStream = async () => {
    if (!streamDoc) return;

    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(p => p.destroy());
    peersRef.current = {};

    if (socket) {
      viewerJoinedHandlerRef.current &&
        socket.off('viewer:joined', viewerJoinedHandlerRef.current);
      signalViewerHandlerRef.current &&
        socket.off('signal:viewer-to-admin', signalViewerHandlerRef.current);
    }

    try {
      await stopRecordingAndUpload(streamDoc._id);

      const { data } = await api.post(
        `/api/streams/end/${streamDoc._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) toast.error('Failed to end stream on server');
      else socket.emit('admin:ended', { streamId: streamDoc._id });

      setIsLive(false);
      setStreamDoc(null);
      setTitle('');
      setDesc('');
      toast.success('Stream ended and recording saved');
    } catch (err) {
      toast.error('Failed to end stream');
      console.error('End stream error:', err);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white px-4 py-3">
          Admin Dashboard
        </header>

        <main
          className="mx-auto max-w-5xl px-4"
          style={{ minHeight: 'calc(100vh - 3rem)' }}>
          <div className="py-6 grid md:grid-cols-2 gap-6">
            {/* Stream Controls */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="text-xl font-semibold mb-4">Go Live</h2>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 mb-3"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Session title"
              />
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 mb-4"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Short description (optional)"
              />
              {!isLive ? (
                <button
                  onClick={startStream}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-medium">
                  Start Live
                </button>
              ) : (
                <button
                  onClick={endStream}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-medium">
                  End Live & Save Recording
                </button>
              )}
              {streamDoc && (
                <p className="text-sm text-gray-600 mt-3">
                  <span className="font-semibold">Live ID:</span>{' '}
                  {streamDoc._id}
                </p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <video
                ref={localVideoRef}
                className="w-full aspect-video bg-black rounded-lg"
                playsInline
                muted
                autoPlay
              />
              <p className="text-xs text-gray-500 mt-2">
                This is your local camera preview. Viewers will receive it in
                real-time via WebRTC.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
