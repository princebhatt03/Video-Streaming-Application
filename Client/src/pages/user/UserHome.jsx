import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow p-4 animate-pulse">
    <div className="h-3 w-12 bg-gray-300 rounded mb-2"></div>
    <div className="h-5 w-2/3 bg-gray-300 rounded mb-2"></div>
    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
    <div className="h-3 w-1/2 bg-gray-200 rounded mb-3"></div>
    <div className="h-9 w-full bg-gray-300 rounded"></div>
  </div>
);

const UserHome = ({ socket }) => {
  const navigate = useNavigate();
  const [live, setLive] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // Fetch live streams from server
  const loadLive = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/streams/live');
      if (data?.success && isMounted.current) {
        setLive(Array.isArray(data.streams) ? data.streams : []);
      }
    } catch (err) {
      console.error('❌ Error loading live streams:', err);
      if (isMounted.current) toast.error('Unable to load live streams.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const addStreamSafely = newStream => {
    if (!newStream) return;
    const id = newStream._id || newStream.streamId || newStream.id;
    setLive(prev => {
      const exists = prev.some(s => (s._id || s.id) === id);
      if (exists) {
        return prev.map(s => ((s._id || s.id) === id ? newStream : s));
      }
      return [newStream, ...prev];
    });
  };

  const removeStreamSafely = id => {
    setLive(prev => prev.filter(s => (s._id || s.id) !== id));
  };

  useEffect(() => {
    isMounted.current = true;
    loadLive();

    if (!socket) {
      console.warn('⚠️ No socket provided to UserHome');
      return () => {
        isMounted.current = false;
      };
    }

    // --- SOCKET LISTENERS ---
    const onConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      loadLive();
    };

    const onAdminStarted = s => {
      console.log('📣 Event received: admin:started', s);
      toast.success(`${s?.title + ' Stream' || 'Live Stream'} started`);
      addStreamSafely(s);
    };

    const onAdminEnded = s => {
      console.log('📴 Event received: admin:ended', s);
      toast.success(`Stream ended: ${s?.title || ''}`);
      removeStreamSafely(s.streamId || s._id || s.id);
    };

    const onError = err => {
      console.error('⚠️ Socket error:', err);
    };

    socket.on('connect', onConnect);
    socket.on('admin:started', onAdminStarted);
    socket.on('admin:ended', onAdminEnded);
    socket.on('connect_error', onError);

    if (socket.connected) onConnect();

    return () => {
      isMounted.current = false;
      socket.off('connect', onConnect);
      socket.off('admin:started', onAdminStarted);
      socket.off('admin:ended', onAdminEnded);
      socket.off('connect_error', onError);
    };
  }, [socket]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Live Streams</span>
          <div className="flex items-center gap-3">
            <button
              onClick={loadLive}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
              Refresh
            </button>
            <span className="text-xs text-gray-300">Live: {live.length}</span>
          </div>
        </header>

        <main
          className="mx-auto max-w-5xl px-4"
          style={{ minHeight: 'calc(100vh - 3rem)' }}>
          <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">Live Now</h2>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : live.length === 0 ? (
              <p className="text-gray-600">No live streams right now.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {live.map(s => (
                  <div
                    key={s._id || s.id}
                    className="bg-white rounded-2xl shadow p-4">
                    <p className="text-sm text-red-600 font-medium mb-1">
                      ● LIVE
                    </p>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-gray-600 text-sm">{s.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      By {s.admin?.fullName || 'Unknown'} (
                      {s.admin?.adminId || '—'})
                    </p>
                    <button
                      onClick={() => navigate(`/live/${s._id || s.id}`)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm">
                      Watch
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex gap-4 justify-between">
              <button
                onClick={() => navigate('/recordings')}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                View Recordings
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                Go Back to Home
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserHome;
