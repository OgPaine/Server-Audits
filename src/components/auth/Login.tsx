import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn, X, Loader } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../api/supabase";
import { throttle } from "lodash";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 2 * 60 * 1000; // 2 minutes
const PASSWORD_MIN_LENGTH = 8;

const InputField = ({
  type,
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  id,
  required = true,
  autoComplete,
  maxLength = 100,
}: {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  icon: React.ElementType;
  id: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <Icon className="w-5 h-5" aria-hidden="true" />
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
        autoComplete={autoComplete}
        maxLength={maxLength}
        spellCheck="false"
        autoCorrect="off"
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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockTimer, setUnlockTimer] = useState<number | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Rate limit and lock-out logic
  useEffect(() => {
    const storedAttempts = Number(localStorage.getItem("loginAttempts")) || 0;
    const storedLockTime = Number(localStorage.getItem("lockTime"));
    const currentTime = Date.now();

    if (storedLockTime > currentTime) {
      setIsLocked(true);
      setLoginAttempts(storedAttempts);
      const remainingLockTime = storedLockTime - currentTime;
      setUnlockTimer(Math.ceil(remainingLockTime / 1000)); // in seconds

      const unlockTimeout = setTimeout(() => {
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("lockTime");
        setIsLocked(false);
        setUnlockTimer(null);
      }, remainingLockTime);

      return () => clearTimeout(unlockTimeout);
    } else {
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lockTime");
      setIsLocked(false);
    }
  }, [loginAttempts]);

  useEffect(() => {
    if (loginAttempts >= RATE_LIMIT_ATTEMPTS) {
      const lockExpiration = Date.now() + RATE_LIMIT_WINDOW;
      localStorage.setItem("loginAttempts", String(loginAttempts));
      localStorage.setItem("lockTime", String(lockExpiration));
      setIsLocked(true);
    }
  }, [loginAttempts]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= PASSWORD_MIN_LENGTH;
  };

  const throttledLogin = throttle(async (email: string, password: string) => {
    try {
      await login(email, password);
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated) {
        handleClose();
        navigate("/", { replace: true });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setLoginAttempts((prev) => prev + 1);
      throw err;
    }
  }, 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isLocked) {
      setError(
        `Too many login attempts. Please try again in ${unlockTimer} seconds.`
      );
      return;
    }

    if (!email.trim() || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isForgotPassword && !isValidPassword(password)) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
      return;
    }

    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess("If an account exists with this email, password reset instructions will be sent.");
        setEmail("");
      } else {
        await throttledLogin(email, password);
      }
    } catch (err: any) {
      setError(isForgotPassword
        ? "Unable to process request. Please try again later."
        : "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    resetForm();
  };

  const resetForm = () => {
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
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
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
            <LogIn className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {isForgotPassword ? "Reset Password" : "Welcome back"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isForgotPassword
              ? "Enter your email to receive reset instructions."
              : "Please sign in to your account."}
          </p>
        </div>

        {error && (
          <div
            className="p-3 text-sm text-red-500 rounded-lg bg-red-50"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 text-sm text-green-500 rounded-lg bg-green-50"
            role="alert"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            label="Email address"
            icon={Mail}
            required
            autoComplete="email"
          />

          {!isForgotPassword && (
            <InputField
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              label="Password"
              icon={Lock}
              required
              autoComplete="current-password"
            />
          )}

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              isForgotPassword ? "Send Reset Instructions" : "Sign In"
            )}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600">
          {isForgotPassword ? (
            <button
              onClick={toggleForgotPassword}
              className="text-blue-600 hover:text-blue-500"
            >
              Back to sign in
            </button>
          ) : (
            <>
              <button
                onClick={toggleForgotPassword}
                className="text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
              <p className="mt-2">
                Don't have an account?{" "}
                <button
                  onClick={onSignupClick}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;