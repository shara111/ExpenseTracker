import React from "react";
import card2 from "../assets/images/card2.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right Side - Image/Brand */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <img
              src={card2}
              alt="Finance Tracker"
              className="w-full max-w-lg mx-auto drop-shadow-xl rounded-2xl"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Track Your Finances
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Manage your income and expenses efficiently with our modern
              expense tracking application
            </p>

            {/* Feature badges */}
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 text-gray-700 text-sm font-medium shadow-sm">
                📊 Real-time Analytics
              </div>
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 text-gray-700 text-sm font-medium shadow-sm">
                🔒 Secure & Private
              </div>
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 text-gray-700 text-sm font-medium shadow-sm">
                👥 Share Accounts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
