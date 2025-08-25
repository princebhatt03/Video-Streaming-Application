import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../../components/user/Header';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const Recordings = () => {
  const [recs, setRecs] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const normalizeRecordingUrl = url => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${base.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/streams/recordings');
      if (data && data.success) {
        setRecs(data.streams || []);
      } else {
        toast.error(data?.message || 'Failed to fetch recordings');
        setRecs([]);
      }
    } catch (err) {
      console.error('Fetch recordings error:', err);
      toast.error('Could not load recordings');
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Recordings</span>
          <button
            onClick={load}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
            Refresh
          </button>
        </header>

        <main
          className="mx-auto max-w-5xl px-4 py-6"
          style={{ minHeight: 'calc(100vh - 3rem)' }}>
          {loading && <p className="text-gray-600">Loading recordings...</p>}

          {!loading && recs.length === 0 && (
            <p className="text-gray-600">No recordings yet.</p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recs.map(r => {
              const videoSrc = normalizeRecordingUrl(r.recordingUrl);
              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl shadow p-4">
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    By {r.admin?.fullName || 'Unknown'}
                  </p>

                  {videoSrc ? (
                    <video
                      controls
                      preload="metadata"
                      className="w-full rounded-lg bg-black aspect-video">
                      <source
                        src={videoSrc}
                        type="video/webm"
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Recording not available
                    </p>
                  )}

                  {r.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {r.description}
                    </p>
                  )}
                  {r.endedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Ended: {new Date(r.endedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => navigate('/user-home')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-300">
          Go Back to Live Stream
        </button>

        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition duration-300">
          Go Back to Home
        </button>
      </div>
    </>
  );
};

export default Recordings;
