import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../api/supabase';

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  icon: React.ElementType;
  id: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  id,
  required = true,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
        aria-label={label}
      />
    </div>
  </div>
);

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    if (error) setError(null);
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      if (email) {
        await login(email, newPassword);
      }

      alert('Password successfully reset!');
      navigate('/');

    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred while resetting your password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 full-height-gradient">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white shadow-lg sm:max-w-md rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
              <KeyRound className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-gray-600">
              Please enter your new password
            </p>
          </div>

          {error && (
            <div
              className="p-3 text-sm text-red-500 rounded-lg bg-red-50 animate-fade-in"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              label="New Password"
              icon={Lock}
            />

            <InputField
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              label="Confirm Password"
              icon={Lock}
            />

            <button
              type="submit"
              className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Resetting password...</span>
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;