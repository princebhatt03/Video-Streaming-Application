import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Header from '../../components/user/Header';

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

const UserLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error('All fields are required');
    }

    try {
      setLoading(true);
      const res = await api.post('/api/users/login', form);
      const data = res.data;

      if (data.success) {
        // Save JWT token to localStorage (or cookie if you prefer)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success(data.message || 'Login successful 🎉');

        // Redirect to home or dashboard
        setTimeout(() => navigate('/user-home'), 1200);
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login Error:', err);

      // Show backend validation errors or fallback message
      const msg = err?.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login as a User
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            {/* Email */}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate('/register')}>
              Register here
            </span>
          </p>
          <p className="text-sm text-center text-gray-600 mt-4">
            Login as a Admin{' '}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate('/admin-login')}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default UserLogin;
