import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const UserHome = ({ socket }) => {
  const navigate = useNavigate();
  const [live, setLive] = useState([]);

  const loadLive = async () => {
    try {
      const { data } = await api.get('/api/streams/live');
      if (data.success) setLive(data.streams);
    } catch (err) {
      console.error('❌ Error loading live streams:', err);
    }
  };

  useEffect(() => {
    loadLive();

    if (!socket) return; // ✅ Prevent error when socket is null

    socket.on('stream:started', s => {
      toast.success(`🔴 ${s.admin.fullName} started: ${s.title}`);
      setLive(prev => [s, ...prev]);
    });

    socket.on('stream:ended', ({ id }) => {
      toast('Stream ended', { icon: '🟡' });
      setLive(prev => prev.filter(s => s._id !== id && s.id !== id));
    });

    return () => {
      socket.off('stream:started');
      socket.off('stream:ended');
    };
  }, [socket]); // ✅ re-run only when socket changes

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-3">User Home</header>

      <main
        className="mx-auto max-w-5xl px-4"
        style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <div className="py-6">
          <h2 className="text-xl font-semibold mb-4">Live Now</h2>
          {live.length === 0 && (
            <p className="text-gray-600">No live streams right now.</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {live.map(s => (
              <div
                key={s._id || s.id}
                className="bg-white rounded-2xl shadow p-4">
                <p className="text-sm text-red-600 font-medium mb-1">● LIVE</p>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  By {s.admin?.fullName} ({s.admin?.adminId})
                </p>
                <button
                  onClick={() => navigate(`/live/${s._id || s.id}`)}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm">
                  Watch
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/recordings')}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg">
              View Recordings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHome;
