import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ServerForm } from './components/ServerForm';
import { AdminPanel } from './components/AdminPanel';
import { RatedServers } from './components/RatedServers';
import { useAuthStore } from './store/authStore';
import MenuBar from './components/MenuBar';
import Account from './components/Account';
import ResetPassword from './components/ResetPassword';


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
  const { isAuthenticated, isAdmin ,isUser} = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    isUser: state.isUser,
  }));

  const logout = useAuthStore.getState().logout;

  return (
    <Router>
      <div className="full-height-gradient">
        <MenuBar isAuthenticated={isAuthenticated} logout={logout} isAdmin={isAdmin} isUser={isUser} />

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
      </div>
    </Router>
  );
}

export default App;
