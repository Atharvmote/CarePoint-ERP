import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
}

export default ProtectedRoute;
