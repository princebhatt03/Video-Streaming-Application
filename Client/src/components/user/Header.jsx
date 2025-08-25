import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link
        to="/"
        className="text-lg font-bold">
        My Streaming App
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex flex-col text-sm">
              <span>{user.name}</span>
              <span className="text-gray-200 text-xs">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm">
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-gray-100">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
