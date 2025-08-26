import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 🔌 Socket instance
import socket from './socket';

// 🔊 Global socket listener for live events
import StreamListener from './StreamListener';

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
  return (
    <>
      {/* ✅ Global Toast Notifications */}
      <Toaster position="top-center" />

      {/* ✅ Mount the StreamListener once globally */}
      <StreamListener socket={socket} />

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
