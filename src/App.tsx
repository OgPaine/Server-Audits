import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ServerForm } from './components/server/ServerForm';
import { AdminPanel } from './components/admin/AdminPanel';
import RatedServers from './components/server/RatedServers';
import { useAuthStore } from './store/authStore';
import MenuBar from './components/layout/MenuBar';
import Account from './components/Account';
import ResetPassword from './components/auth/ResetPassword';
import Login from './components/auth/Login';
import Footer from './components/layout/Footer';

const PrivateRoute = ({
  children,
  onLoginRequired,
}: {
  children: JSX.Element;
  onLoginRequired: () => void;
}) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      onLoginRequired();
    }
  }, [isAuthenticated, onLoginRequired]);

  return isAuthenticated ? children : null;
};

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  
  const { isAuthenticated, isAdmin, checkAuth } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    checkAuth: state.checkAuth,
  }));

  const logout = useAuthStore.getState().logout;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up session expiration check
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        useAuthStore.getState().checkSessionExpiration();
      }, 60 * 1000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLoginRequired = () => {
    setIsLoginOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginOpen(false);
  };

  const handleSignupClick = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen full-height-gradient">
        {/* Header/Menu */}
        <MenuBar 
          isAuthenticated={isAuthenticated} 
          logout={logout} 
          isAdmin={isAdmin}
          onLoginClick={handleLoginRequired}
        />

        {/* Authentication Modals */}
        <Login 
          isOpen={isLoginOpen}
          onClose={handleLoginClose}
          onSignupClick={handleSignupClick}
        />
        {/* Add your Signup component here */}

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<ServerForm />} />
            <Route path="/rated-servers" element={<RatedServers />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute onLoginRequired={handleLoginRequired}>
                  {isAdmin ? <AdminPanel /> : <Navigate to="/" replace />}
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute onLoginRequired={handleLoginRequired}>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;