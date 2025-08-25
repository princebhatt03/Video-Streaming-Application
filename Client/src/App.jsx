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

const App = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // connect socket.io client
    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:3000',
      {
        withCredentials: true,
      }
    );

    setSocket(newSocket);

    // Listen for connect/disconnect
    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    // Example: listen for custom server events
    newSocket.on('server-message', data => {
      console.log('📩 Message from server:', data);
    });

    // cleanup
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      {/* Global Toast Notifications */}
      <Toaster position="top-center" />

      {/* Routes */}
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
