import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminHeader from '../../components/admin/Header';

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    adminId: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.adminId || !form.email || !form.password) {
      return toast.error('All fields are required');
    }

    try {
      setLoading(true);
      const res = await api.post('/api/admins/login', form);
      const data = res.data;

      if (data.success) {
        toast.success(data.message || 'Login successful!');
        // Save token and admin info in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));

        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1200);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      const msg = err?.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login as an Admin
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            {/* Admin ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin ID
              </label>
              <input
                type="text"
                name="adminId"
                value={form.adminId}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Admin ID"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate('/admin-register')}>
              Register here
            </span>
          </p>
          <p className="text-sm text-center text-gray-600 mt-4">
            Login as a User{' '}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate('/login')}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
