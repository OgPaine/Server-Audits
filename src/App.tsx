import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ServerForm } from './components/server/ServerForm';
import { AdminPanel } from './components/admin/AdminPanel';
import RatedServers from './components/server/RatedServers';
import { useAuthStore } from './store/authStore';
import MenuBar from './components/layout/MenuBar';
import Account from './components/Account';
import ResetPassword from './components/auth/ResetPassword';
import Footer from './components/layout/Footer';

const PrivateRoute = ({
  children,
  isAuthenticated,
}: {
  children: JSX.Element;
  isAuthenticated: boolean;
}) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, isAdmin } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    isUser: state.isUser,
  }));

  const logout = useAuthStore.getState().logout;

  return (
    <Router>
      <div className="flex flex-col min-h-screen full-height-gradient">
        {/* Header/Menu */}
        <MenuBar isAuthenticated={isAuthenticated} logout={logout} isAdmin={isAdmin} />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<ServerForm />} />
            <Route path="/rated-servers" element={<RatedServers />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
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
