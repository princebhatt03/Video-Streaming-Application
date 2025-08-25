import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

// Pages
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import UserRegister from './pages/user/UserRegister';
import UserLogin from './pages/user/UserLogin';
import UserHome from './pages/user/UserHome';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveWatch from './pages/user/LiveWatch';
import Recordings from './pages/user/Recordings';

const App = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // ✅ Connect socket.io client once
    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:3000',
      {
        withCredentials: true,
      }
    );

    setSocket(newSocket);

    // ✅ Listen for connect/disconnect
    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    // Example: custom server event
    newSocket.on('server-message', data => {
      console.log('📩 Message from server:', data);
    });

    // ✅ Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    // Optional: Loading state until socket connects
    return (
      <div className="flex h-screen items-center justify-center">
        Connecting...
      </div>
    );
  }

  return (
    <>
      {/* ✅ Global Toast Notifications */}
      <Toaster position="top-center" />

      {/* ✅ Routes */}
      <Routes>
        <Route
          path="/"
          element={<HomePage socket={socket} />}
        />
        <Route
          path="/user-home"
          element={<UserHome socket={socket} />}
        />
        <Route
          path="/register"
          element={<UserRegister socket={socket} />}
        />
        <Route
          path="/login"
          element={<UserLogin socket={socket} />}
        />
        <Route
          path="/live/:id"
          element={<LiveWatch socket={socket} />}
        />
        <Route
          path="/recordings"
          element={<Recordings />}
        />
        <Route
          path="/admin-login"
          element={<AdminLogin socket={socket} />}
        />
        <Route
          path="/admin-register"
          element={<AdminRegister socket={socket} />}
        />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard socket={socket} />}
        />
        <Route
          path="*"
          element={<ErrorPage />}
        />
      </Routes>
    </>
  );
};

export default App;
