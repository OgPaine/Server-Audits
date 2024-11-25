import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const Login: React.FC<LoginProps> = ({ isOpen, onClose, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      handleClose(); 
      navigate('/');
    } catch (err: any) {
      if (err?.message === 'Email not confirmed') {
        setError(
          <>
            <p>Your email has not been confirmed yet. Please check your inbox.</p>
          </>
        );
      } else {
        setError("Invalid email or password. Please try again."); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setError('');
    setEmail(''); 
    setPassword(''); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-8 space-y-6 bg-white shadow-lg sm:max-w-md rounded-xl">
        <button
          onClick={handleClose}
          className="absolute text-gray-400 top-4 right-4 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
            <LogIn className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Please sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                aria-label="Email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                aria-label="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading} 
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSignupClick}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
