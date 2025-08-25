import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
  return (
    <>
      {/* Global Toast Notifications */}
      <Toaster position="top-center" />

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/user-home"
          element={<UserHome />}
        />
        <Route
          path="/register"
          element={<UserRegister />}
        />
        <Route
          path="/login"
          element={<UserLogin />}
        />
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />
        <Route
          path="/admin-register"
          element={<AdminRegister />}
        />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
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
