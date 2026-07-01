import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const ApplicationName = "TOMO";

  return (
    <div className="min-h-screen bg-[url('/landingPage.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center p-4 sm:p-8">
      {/* Main Content Card */}
      <div className="max-w-lg w-full bg-transparent rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center space-y-8">
        {/* Logo Section */}
        <div className="relative">
          <img
            src="/logo3.png"
            alt={`${ApplicationName} Logo`}
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome to {ApplicationName}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Ready to dive in? Log in or sign up to start connecting with your
            friends today.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full gap-4 pt-2">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Link to="/login" className="w-full h-full block">
              Log In
            </Link>
          </button>
          <button className="flex-1 bg-white hover:bg-gray-50 text-indigo-600 font-bold py-3 px-6 border-2 border-indigo-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Link to="/signup" className="w-full h-full block">
              Sign Up
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;