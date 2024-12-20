import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from '../auth/Login';
import Signup from '../auth/Signup';

interface MenuBarProps {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  onLoginClick: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({isAuthenticated, logout, isAdmin, onLoginClick }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleOpenLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  return (
    <>
      <div className="mb-10 bg-gray-800 shadow-md">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-white">strbull Server Audits</h1>

          <div className="flex gap-6">
            <Link to="/" className="font-extrabold text-white hover:text-gray-300">
              Submit Server
            </Link>
            <Link to="/rated-servers" className="font-extrabold text-white hover:text-gray-300">
              Rated Servers
            </Link>
            
            {isAuthenticated &&  (
              <Link to="/account" className="font-extrabold text-white hover:text-gray-300">
                Account
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="font-extrabold text-white hover:text-gray-300">
                Admin Panel
              </Link>
            )}
          </div>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSignupClick={handleOpenSignup}
      />

      <Signup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginClick={handleOpenLogin}
      />
    </>
  );
};

export default MenuBar;
