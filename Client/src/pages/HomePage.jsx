import React from 'react';
import Header from '../components/user/Header';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to SkillYug Video Streaming App
        </h1>
        <p className="text-lg mb-6">
          Watch live streams seamlessly and enjoy real-time interaction with
          your favorite creators.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/admin-login')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition">
            Login as an Admin
          </button>

          <button
            onClick={() => navigate('/login')}
            className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-white/30 transition">
            Login as a User
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transform transition">
            <h3 className="text-xl font-semibold mb-2">Real-Time Streaming</h3>
            <p>
              Experience high-quality live streams with minimal delay and smooth
              playback.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transform transition">
            <h3 className="text-xl font-semibold mb-2">User Dashboard</h3>
            <p>
              Manage your favorite streams, subscriptions, and personal settings
              easily.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transform transition">
            <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
            <p>
              Built with modern technologies to ensure speed, security, and
              reliability.
            </p>
          </div>
        </div>
      </section>

      {/* About / Contact Section */}
      <section className="bg-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About the Developer</h2>
          <p className="mb-6">
            Hi! I'm <span className="font-semibold">Prince Bhatt</span>, a Full
            Stack Web Developer. I built this Video Streaming Application as a
            job task for <span className="font-semibold">SkillYug</span>.
          </p>
          <div className="flex justify-center gap-6 text-2xl">
            <button
              onClick={() =>
                window.open(
                  'https://www.linkedin.com/in/prince-bhatt-0958a725a/',
                  '_blank'
                )
              }
              className="hover:text-gray-200">
              <FaLinkedin />
            </button>
            <button
              onClick={() =>
                window.open('https://github.com/princebhatt03', '_blank')
              }
              className="hover:text-gray-200">
              <FaGithub />
            </button>
            <button
              onClick={() =>
                window.open(
                  'https://princebhatt03.github.io/Portfolio',
                  '_blank'
                )
              }
              className="hover:text-gray-200">
              <FaGlobe />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        &copy; 2025 Prince Bhatt. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
