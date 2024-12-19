import React, { useState } from 'react';
import { Lock, Mail, UserPlus, X } from 'lucide-react';
import { supabase } from '../../api/supabase';

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const Signup: React.FC<SignupProps> = ({ isOpen, onClose, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Basic validations
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}` },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        setSuccess('Account created successfully! Please check your email for verification.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } catch (err: any) {
      console.error('Unexpected error during signup:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    // Automatically remove spaces
    const sanitizedValue = value.replace(/\s+/g, '');
    setPassword(sanitizedValue);
  };

  const handleConfirmPasswordChange = (value: string) => {
    // Automatically remove spaces
    const sanitizedValue = value.replace(/\s+/g, '');
    setConfirmPassword(sanitizedValue);
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-8 space-y-6 bg-white shadow-lg rounded-xl">
        <button onClick={handleClose} className="absolute text-gray-400 top-4 right-4 hover:text-gray-500">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-3xl font-bold">Create account</h2>
          <p className="mt-2 text-gray-600">Sign up to get started</p>
        </div>

        {error && <div className="p-3 text-sm text-red-500 rounded-lg bg-red-50">{error}</div>}
        {success && <div className="p-3 text-sm text-green-500 rounded-lg bg-green-50">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                minLength={8}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
                className="w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                minLength={8}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button onClick={onLoginClick} className="text-green-600 hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
