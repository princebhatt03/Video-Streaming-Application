import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  // Check if admin is logged in
  useEffect(() => {
    const adminData = localStorage.getItem('adminInfo');
    if (adminData) setAdmin(JSON.parse(adminData));
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setAdmin(null);
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };

  return (
    <header className="bg-gray-800 text-white px-4 py-3 shadow-md flex justify-between items-center flex-wrap">
      <div className="flex items-center space-x-3">
        <span
          className="font-bold text-lg cursor-pointer"
          onClick={() => navigate('/')}>
          Admin Panel
        </span>
      </div>

      <div className="flex items-center space-x-4 mt-2 md:mt-0">
        {admin ? (
          <>
            <div className="flex flex-col text-sm md:text-base">
              <span>
                <strong>ID:</strong> {admin.adminId}
              </span>
              <span>
                <strong>Name:</strong> {admin.fullName}
              </span>
              <span>
                <strong>Email:</strong> {admin.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium transition">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/admin-login')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition">
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
