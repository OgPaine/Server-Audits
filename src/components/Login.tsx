import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn, X, Loader } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../api/supabase";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

// Reusable Input Component
const InputField = ({
  type,
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  id,
  required = true,
}: {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  icon: React.ElementType;
  id: string;
  required?: boolean;
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

const Login: React.FC<LoginProps> = ({ isOpen, onClose, onSignupClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isForgotPassword && !password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess("Password reset instructions have been sent to your email.");
        setEmail("");
      } else {
        await login(email, password);

        const authState = useAuthStore.getState();
        if (authState.isAuthenticated) {
          handleClose();
          navigate("/");
        } else {
          throw new Error("Login failed. Please check your credentials.");
        }
      }
    } catch (err) {
      setError(
        isForgotPassword
          ? "Failed to send reset instructions. Please try again."
          : err instanceof Error 
            ? err.message
            : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
    setIsForgotPassword(false);
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError(null);
    setSuccess(null);
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg p-8 space-y-6 bg-white shadow-lg sm:max-w-md rounded-xl">
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 text-gray-400 hover:text-gray-500 ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={isLoading}
          aria-label="Close login form"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
            <LogIn className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {isForgotPassword ? "Reset Password" : "Welcome back"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isForgotPassword
              ? "Enter your email to receive reset instructions"
              : "Please sign in to your account"}
          </p>
        </div>

        {error && (
          <div
            className="p-3 text-sm text-red-500 rounded-lg bg-red-50 animate-fade-in"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 text-sm text-green-500 rounded-lg bg-green-50 animate-fade-in"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <InputField
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            label="Email address"
            icon={Mail}
            required={true}
          />

          {!isForgotPassword && (
            <InputField
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              label="Password"
              icon={Lock}
              required={true}
            />
          )}

          <button
            type="submit"
            className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{isForgotPassword ? "Sending..." : "Signing in..."}</span>
              </span>
            ) : (
              isForgotPassword ? "Send Reset Instructions" : "Sign in"
            )}
          </button>
        </form>

        <div className="space-y-2 text-center">
          <button
            onClick={toggleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isForgotPassword ? "Back to login" : "Forgot password?"}
          </button>
          {!isForgotPassword && (
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onSignupClick}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
